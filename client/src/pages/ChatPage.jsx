import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useUiStore from '../store/uiStore';
import useSocket from '../hooks/useSocket';
import { getConversations } from '../api/conversations';
import { getOrCreateKeyPair } from '../utils/crypto';
import { storePublicKey } from '../api/auth';
import ChatWindow from '../components/chat/ChatWindow';
import UICustomizerPanel from '../components/ui/UICustomizerPanel';
import { AvatarRing } from '../components/ui/AvatarRing';
import Spinner from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import HexCodeCard from '../components/profile/HexCodeCard';
import { formatHexId } from '../utils/hexGenerator';
import {
  UserPlus, Search,
  QrCode, Palette, Radio, MoreVertical, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ChatPage() {
  const { user } = useAuthStore();
  const {
    conversations, setConversations, activeConversation,
    setActiveConversation, onlineUsers,
  } = useChatStore();
  const {
    initTheme, chatBg, customBgUrl, sidebarTab, setSidebarTab,
  } = useUiStore();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyQR, setShowMyQR] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const sidebarMenuRef = useRef(null);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const handleClick = (e) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(e.target)) {
        setSidebarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Handle hardware back button logic for mobile chat
  useEffect(() => {
    const handlePopState = (e) => {
      if (activeConversation) {
        setActiveConversation(null);
      }
    };
    if (activeConversation) {
      window.history.pushState({ chatOpen: true }, '');
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeConversation, setActiveConversation]);

  // Init theme + E2EE on mount
  useEffect(() => {
    initTheme();
    const initE2EE = async () => {
      try {
        const keyPair = await getOrCreateKeyPair();
        await storePublicKey(keyPair.publicKey, null).catch(() => {});
      } catch (err) {
        console.warn('[E2EE] Key init failed:', err.message);
      }
    };
    initE2EE();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const list = await getConversations();
        setConversations(list);
      } catch {
        toast.error('Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [setConversations]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setShowCustomizer(false); // Close customizer when switching chat
  };

  const filteredConversations = conversations.filter((conv) => {
    const partner = conv.participants.find((p) => (p._id || p) !== user?._id) || conv.participants[0];
    if (!partner) return false;
    const q = searchQuery.toLowerCase();
    return partner.username?.toLowerCase().includes(q) || partner.hexId?.toLowerCase().includes(q);
  });

  const getUnreadCount = (conv) => {
    if (
      conv.lastMessage &&
      !conv.lastMessage.readAt &&
      conv.lastMessage.senderId !== user?._id &&
      conv.lastMessage.senderId?._id !== user?._id
    ) return 1;
    return 0;
  };

  const formatLastActivity = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diff = Date.now() - date;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderConversationItem = (conv) => {
    const isSelfConv = conv.participants.every(
      (p) => (p._id || p).toString() === user?._id?.toString()
    );
    const partner = isSelfConv
      ? conv.participants[0]
      : conv.participants.find((p) => (p._id || p).toString() !== user?._id?.toString());
    if (!partner) return null;

    const isSelected = activeConversation?._id === conv._id;
    const isOnline = onlineUsers.has(partner.hexId);
    const unread = getUnreadCount(conv);

    let snippet = 'No messages yet';
    const lastMsg = conv.lastMessage;
    if (lastMsg) {
      if (lastMsg.isQuarantined) snippet = '🚫 Quarantined';
      else if (lastMsg.contentType === 'text') snippet = lastMsg.textContent || '';
      else snippet = `📎 ${lastMsg.contentType || 'File'}`;
    }

    const displayName = isSelfConv ? `${partner.username} (You)` : partner.username;

    return (
      <div
        key={conv._id}
        onClick={() => handleSelectConversation(conv)}
        className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150"
        style={{
          background: isSelected ? 'var(--bg-active)' : 'transparent',
          border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
        }}
        onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        <div className="relative flex-shrink-0">
          <AvatarRing src={partner.avatar} name={partner.username} isOnline={isOnline} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {displayName}
            </span>
            <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
              {formatLastActivity(conv.lastActivity)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] truncate max-w-[150px]" style={{ color: 'var(--text-muted)' }}>{snippet}</p>
            {unread > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] font-black px-1 ml-2 flex-shrink-0 text-white"
                style={{ background: 'var(--accent)' }}
              >
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Background overlay for readability */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }} />

      {/* ── LEFT SIDEBAR ───────────────────────────────────────────── */}
      <aside
        className={`${activeConversation ? 'hidden md:flex' : 'flex'} relative z-10 w-full md:w-[320px] lg:w-[360px] xl:w-[380px] h-full flex-col flex-shrink-0`}
        style={{
          background: 'var(--bg-sidebar)',
          backdropFilter: 'var(--backdrop)',
          borderRight: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[60px] min-h-[60px] flex-shrink-0">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/profile', { replace: true })}
          >
            <AvatarRing src={user?.avatar} name={user?.username} size="md" />
            <div>
              <h4 className="text-sm font-bold transition-colors group-hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                {user?.username || 'Guest'}
              </h4>
              <span className="font-mono text-[9px] block" style={{ color: 'var(--text-muted)' }}>
                {formatHexId(user?.hexId)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 relative" ref={sidebarMenuRef}>
            <button
              onClick={() => setSidebarMenuOpen(!sidebarMenuOpen)}
              className="p-2 rounded-xl transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <MoreVertical size={16} />
            </button>
            
            {sidebarMenuOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-44 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-primary)' }}
              >
                <button
                  onClick={() => { setShowMyQR(true); setSidebarMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <QrCode size={14} style={{ color: 'var(--accent)' }} />
                  My QR Code
                </button>
                <div className="h-px" style={{ background: 'var(--border-primary)' }} />
                <button
                  onClick={() => { setShowCustomizer(v => !v); setSidebarMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Palette size={14} style={{ color: 'var(--accent)' }} />
                  Customize UI
                </button>
                <div className="h-px" style={{ background: 'var(--border-primary)' }} />
                <button
                  onClick={() => { navigate('/profile', { replace: true }); setSidebarMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={14} style={{ color: 'var(--accent)' }} />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>



        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search chats…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2 text-xs outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {showCustomizer ? (
            <UICustomizerPanel onClose={() => setShowCustomizer(false)} />
          ) : (
            <div className="px-2 pb-4 space-y-0.5">
              {/* Conversations header */}
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Conversations
                </span>
                <button
                  onClick={() => navigate('/add-contact')}
                  className="flex items-center gap-1 text-[11px] font-bold transition-colors"
                  style={{ color: 'var(--text-accent)' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  <UserPlus size={12} />
                  New
                </button>
              </div>

              {loading ? (
                <Spinner size="md" className="py-24" />
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Radio size={32} className="mx-auto" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs leading-relaxed px-6" style={{ color: 'var(--text-muted)' }}>
                    No chats yet. Click &quot;New&quot; to start a secure conversation!
                  </p>
                </div>
              ) : (
                filteredConversations.map(renderConversationItem)
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── RIGHT CHAT AREA ─────────────────────────────────────── */}
      <main className={`${!activeConversation ? 'hidden md:flex' : 'flex'} relative z-10 flex-1 h-full overflow-hidden`}>
        <ChatWindow socket={socket} />
      </main>

      {/* My QR Modal */}
      <Modal isOpen={showMyQR} onClose={() => setShowMyQR(false)} title="Your Identity">
        <div className="flex justify-center">
          <HexCodeCard hexId={user?.hexId} username={user?.username} />
        </div>
      </Modal>
    </div>
  );
}

export default ChatPage;
