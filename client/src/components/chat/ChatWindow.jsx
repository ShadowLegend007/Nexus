import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useUiStore } from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { getMessages, sendMessage as apiSendMessage, updateConvAiSetting, starMessage, getStarredMessages } from '../../api/messages';
import { getPublicKey } from '../../api/auth';
import { encryptMessage } from '../../utils/crypto';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import Spinner from '../ui/Spinner';
import { AvatarRing } from '../ui/AvatarRing';
import { Modal } from '../ui/Modal';
import QRDisplay from '../contacts/QRDisplay';
import HexCodeCard from '../profile/HexCodeCard';
import { formatHexId } from '../../utils/hexGenerator';
import { PRESET_BACKGROUNDS } from '../../utils/presetAssets';
import {
  Shield, MessageSquare, QrCode, Sparkles, ArrowLeft,
  User, FolderOpen, Bot, Star, X, ChevronDown, Check,
  FileText, Image as ImageIcon, Video, Music, File, Download, Eye, MoreVertical
} from 'lucide-react';
import { formatBytes } from '../../utils/fileValidator';
import toast from 'react-hot-toast';

// ── Docs Full-Screen Panel ────────────────────────────────────────────────────
const FILE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'audio', label: 'Audio' },
  { id: 'pdf', label: 'Docs' },
];

function typeIcon(type, size = 16) {
  if (type === 'image') return <ImageIcon size={size} className="text-blue-400" />;
  if (type === 'video') return <Video size={size} className="text-pink-400" />;
  if (type === 'audio') return <Music size={size} className="text-green-400" />;
  if (['pdf','word','ppt','excel'].includes(type)) return <FileText size={size} className="text-orange-400" />;
  return <File size={size} className="text-purple-400" />;
}

function DocsPanelFull({ messages, onClose }) {
  const [activeTab, setActiveTab] = useState('all');

  const docs = messages.filter(m => m.fileUrl && m.contentType !== 'text');

  const filtered = activeTab === 'all' ? docs
    : activeTab === 'pdf'
      ? docs.filter(d => ['pdf','word','ppt','excel','other'].includes(d.contentType))
      : docs.filter(d => d.contentType === activeTab);

  const images = filtered.filter(d => d.contentType === 'image');
  const others = filtered.filter(d => d.contentType !== 'image');

  const handleDownload = (url, name) => {
    const a = document.createElement('a');
    a.href = url; a.download = name; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <FolderOpen size={16} style={{ color: 'var(--accent)' }} />
          Media, Links &amp; Docs
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        {FILE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 px-5 py-3 text-xs font-bold transition-colors border-b-2 -mb-px"
            style={{
              borderColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-accent)' : 'var(--text-muted)',
            }}
          >
            {tab.label}
            {activeTab === tab.id && docs.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: 'var(--accent)', color: '#fff' }}>
                {filtered.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <FolderOpen size={40} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No files in this category yet.</p>
          </div>
        ) : (
          <>
            {images.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>PHOTOS</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {images.map(doc => (
                    <div key={doc._id} className="relative group aspect-square rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                      <img src={doc.fileUrl} alt={doc.fileName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40">
                          <Eye size={13} className="text-white" />
                        </a>
                        <button onClick={() => handleDownload(doc.fileUrl, doc.fileName)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40">
                          <Download size={13} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                {images.length > 0 && (
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>FILES</p>
                )}
                <div className="space-y-2">
                  {others.map(doc => (
                    <div
                      key={doc._id}
                      className="flex items-center gap-3 p-3 rounded-xl group transition-colors"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
                    >
                      <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'var(--bg-hover)' }}>
                        {typeIcon(doc.contentType, 18)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{doc.fileName || 'Attachment'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatBytes(doc.fileSize || 0)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>·</span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10">
                          <Eye size={14} style={{ color: 'var(--text-secondary)' }} />
                        </a>
                        <button onClick={() => handleDownload(doc.fileUrl, doc.fileName)} className="p-1.5 rounded-lg hover:bg-white/10">
                          <Download size={14} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Starred Messages Panel (per-chat) ─────────────────────────────────────────
function StarredPanelFull({ messages, onClose }) {
  const starredMsgs = messages.filter(m =>
    m._clientStarred || (Array.isArray(m.starredBy) && m.starredBy.length > 0)
  );

  const fmt = (d) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ background: 'var(--bg-panel)' }}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          Starred Messages
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {starredMsgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Star size={40} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No starred messages in this chat.</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Right-click or long-press any message to star it.</p>
          </div>
        ) : (
          starredMsgs.map(msg => (
            <div
              key={msg._id}
              className="p-3 rounded-xl transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            >
              <div className="flex items-start gap-3">
                <Star size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold" style={{ color: 'var(--text-accent)' }}>
                      {msg.senderId?.username || 'User'}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{fmt(msg.createdAt)}</span>
                  </div>
                  {msg.contentType === 'text' ? (
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                      {msg.textContent}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      {typeIcon(msg.contentType)}
                      <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{msg.fileName || 'Attachment'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main ChatWindow ────────────────────────────────────────────────────────────
export function ChatWindow({ socket }) {
  const { user } = useAuthStore();
  const {
    activeConversation, activeMessages, setActiveMessages, addMessage,
    onlineUsers, setActiveConversation, cachePublicKey, getCachedPublicKey
  } = useChatStore();
  const { getTypingUsersForConversation, getConvAiSettings, updateConvAiSettings, getConvAiEnabled, setConvAiEnabled, theme, chatBg, customBgUrl } = useUiStore();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Overlay panels: null | 'docs' | 'starred'
  const [overlay, setOverlay] = useState(null);

  const [showPartnerQRModal, setShowPartnerQRModal] = useState(false);
  const [showMyIdentityModal, setShowMyIdentityModal] = useState(false);
  const scrollRef = useRef(null);

  const isSelfConv = activeConversation?.participants?.every((p) => (p._id || p) === user?._id) || false;
  const partner = isSelfConv
    ? activeConversation?.participants?.[0]
    : activeConversation?.participants?.find((p) => (p._id || p) !== user?._id);
  const partnerHex = partner?.hexId || '';
  const partnerOnline = onlineUsers.has(partnerHex);
  const partnerName = isSelfConv ? `${partner?.username} (You)` : (partner?.username || 'Partner');

  const typingHexList = getTypingUsersForConversation(activeConversation?._id || '');
  const partnerIsTyping = typingHexList.some((hex) => hex === partnerHex);
  const aiSettings = activeConversation ? getConvAiSettings(activeConversation._id) : { enabled: true, shareReport: false, filters: { text: true, documents: true, images: true, videos: false } };
  const aiEnabled = aiSettings.enabled;

  const isLightTheme = theme === 'light' || theme === 'warm-light';

  // Resolve chat background style
  const getBgStyle = () => {
    if (chatBg === 'custom' && customBgUrl) {
      return { backgroundImage: `url(${customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (chatBg === 'default' || !chatBg) {
      // Always use theme's native bg-chat variable so changing theme updates the chat bg
      return { background: 'var(--bg-chat)' };
    }
    const preset = PRESET_BACKGROUNDS.find(b => b.id === chatBg);
    if (!preset) return { background: 'var(--bg-chat)' };
    // For pattern-type backgrounds, also set a base background color from the theme
    if (preset.style.backgroundImage) {
      return {
        background: 'var(--bg-chat)',
        backgroundImage: preset.style.backgroundImage,
        backgroundSize: preset.style.backgroundSize,
      };
    }
    return preset.style;
  };

  // Fetch partner's public key
  useEffect(() => {
    if (!partnerHex || partnerHex === user?.hexId) return;
    if (!getCachedPublicKey(partnerHex)) {
      getPublicKey(partnerHex)
        .then(data => { if (data?.publicKey) cachePublicKey(partnerHex, data.publicKey); })
        .catch(() => {});
    }
  }, [partnerHex, user?.hexId]);

  useEffect(() => {
    if (!activeConversation) return;
    setOverlay(null);
    const fetchInitial = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const history = await getMessages(activeConversation._id, null, 40);
        setActiveMessages(history);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  const handleScroll = async (e) => {
    if (loadingMore || !hasMore || !activeConversation || activeMessages.length === 0) return;
    const element = e.target;
    if (element.scrollTop < 50) {
      setLoadingMore(true);
      const firstMessageId = activeMessages[0]._id;
      const scrollHeightBefore = element.scrollHeight;
      try {
        const olderHistory = await getMessages(activeConversation._id, firstMessageId, 40);
        if (olderHistory.length < 40) setHasMore(false);
        if (olderHistory.length > 0) {
          setActiveMessages([...olderHistory, ...activeMessages]);
          setTimeout(() => { element.scrollTop = element.scrollHeight - scrollHeightBefore; }, 50);
        }
      } catch (err) {
        console.error('Failed to load older messages:', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const handleSendMessage = async (msgData) => {
    try {
      let payload = { ...msgData };
      if (payload.textContent && partnerHex) {
        const partnerPubKey = getCachedPublicKey(partnerHex);
        if (partnerPubKey) {
          payload.encryptedContent = await encryptMessage(payload.textContent, partnerPubKey);
        }
      }
      const response = await apiSendMessage(payload);
      addMessage(response);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleToggleAi = async () => {
    const newVal = !aiEnabled;
    setConvAiEnabled(activeConversation._id, newVal);
    try { await updateConvAiSetting(activeConversation._id, newVal); } catch {}
  };

  useEffect(() => { scrollToBottom(); }, [activeMessages.length, partnerIsTyping]);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!activeConversation) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 p-8 text-center"
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="max-w-md space-y-6">
          <div
            className="inline-flex p-5 rounded-3xl"
            style={{
              background: 'var(--bg-active)',
              border: '1px solid var(--border-active)',
              boxShadow: '0 0 40px var(--accent-glow)',
            }}
          >
            <Shield size={48} style={{ color: 'var(--accent)' }} />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Nexus <Sparkles size={20} style={{ color: 'var(--accent)' }} className="animate-pulse" />
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              End-to-end encrypted messaging. Select a chat or start a new one.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left pt-2">
            {[
              { icon: <Shield size={14} />, title: 'E2E Encrypted', desc: 'Messages encrypted on device before sending.' },
              { icon: <Bot size={14} />, title: 'AI Analysis', desc: 'Smart threat detection after receipt.' },
              { icon: <User size={14} />, title: 'Hex Identity', desc: 'Pseudonymous 12-char Hex address.' },
              { icon: <FolderOpen size={14} />, title: 'Media Vault', desc: 'All docs stored securely on server.' },
            ].map(item => (
              <div
                key={item.title}
                className="p-4 rounded-2xl space-y-1.5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                  {item.title}
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <Modal isOpen={showMyIdentityModal} onClose={() => setShowMyIdentityModal(false)}>
          <div className="flex justify-center -mt-6">
            <HexCodeCard hexId={user?.hexId} username={user?.username} />
          </div>
        </Modal>
      </div>
    );
  }

  // ── Icon button helper ───────────────────────────────────────────────────────
  const IconBtn = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      title={label}
      className="p-2 rounded-xl transition-all"
      style={{
        background: active ? 'var(--bg-active)' : 'transparent',
        color: active ? 'var(--text-accent)' : 'var(--text-muted)',
        border: active ? '1px solid var(--border-active)' : '1px solid transparent',
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden relative">

      {/* ── Chat Header ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 h-[60px] min-h-[60px] flex-shrink-0 z-10"
        style={{
          background: 'var(--bg-sidebar)',
          backdropFilter: 'var(--backdrop)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
          {/* Back button (mobile) */}
          <button
            onClick={() => setActiveConversation(null)}
            className="md:hidden p-1.5 rounded-xl transition-all flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="cursor-pointer flex-shrink-0">
            <AvatarRing src={partner?.avatar} name={partner?.username} isOnline={partnerOnline} size="md" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{partnerName}</h3>
              <Shield size={11} className="flex-shrink-0" style={{ color: 'var(--accent)' }} title="E2E Encrypted" />
            </div>
            <span className="font-mono text-[10px] block mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {partnerOnline
                ? <span style={{ color: '#22c55e', fontWeight: 700 }}>● Online</span>
                : formatHexId(partnerHex)
              }
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-0.5 overflow-visible flex-shrink-0 relative" ref={headerMenuRef}>
          <button
            onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
            className="p-2 rounded-xl transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            title="More Options"
          >
            <MoreVertical size={18} />
          </button>

          {/* Header Dropdown Panel */}
          {headerMenuOpen && (
            <div 
              className="absolute top-full right-0 mt-2 w-[240px] rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-primary)' }}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => { setOverlay(v => v === 'starred' ? null : 'starred'); setHeaderMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Star size={14} className={overlay === 'starred' ? 'text-yellow-400 fill-yellow-400' : ''} />
                  Starred Messages
                </button>
                
                <button
                  onClick={() => { setOverlay(v => v === 'docs' ? null : 'docs'); setHeaderMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FolderOpen size={14} />
                  Media & Docs
                </button>

                <div className="h-px" style={{ background: 'var(--border-primary)' }} />

                <button
                  onClick={() => { setShowMyIdentityModal(true); setHeaderMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={14} />
                  My Identity
                </button>
                
                <button
                  onClick={() => { setShowPartnerQRModal(true); setHeaderMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <QrCode size={14} />
                  Partner QR
                </button>

                <div className="h-px" style={{ background: 'var(--border-primary)' }} />

                {/* AI Settings Section inside Dropdown */}
                <div className="p-3 space-y-3" style={{ background: 'var(--bg-card)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                      <Bot size={14} style={{ color: 'var(--accent)' }} />
                      AI Analysis
                    </span>
                    <div 
                      className="relative w-8 h-4 rounded-full transition-colors duration-300 cursor-pointer"
                      style={{ background: aiEnabled ? 'var(--accent)' : 'var(--bg-input)' }}
                      onClick={() => handleToggleAi()}
                    >
                      <span className={`absolute top-[2px] w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${aiEnabled ? 'translate-x-4' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>

                  <div className={`space-y-3 pt-2 ${!aiEnabled ? 'opacity-40 pointer-events-none' : ''}`} style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Share AI Report</span>
                      <div 
                        className="relative w-8 h-4 rounded-full transition-colors duration-300 cursor-pointer"
                        style={{ background: aiSettings.shareReport ? 'var(--accent)' : 'var(--bg-input)' }}
                        onClick={() => updateConvAiSettings(activeConversation._id, { shareReport: !aiSettings.shareReport })}
                      >
                        <span className={`absolute top-[2px] w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${aiSettings.shareReport ? 'translate-x-4' : 'translate-x-[2px]'}`} />
                      </div>
                    </div>

                    {aiSettings.shareReport && (
                      <div className="pl-2 space-y-2 border-l-2 ml-1" style={{ borderColor: 'var(--border-primary)' }}>
                        {[
                          { key: 'text', label: 'Text', icon: FileText },
                          { key: 'documents', label: 'Docs', icon: File },
                          { key: 'images', label: 'Photos', icon: ImageIcon },
                          { key: 'videos', label: 'Videos', icon: Video }
                        ].map(({ key, label, icon: Icon }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer"
                            style={{ background: 'var(--bg-input)' }}
                            onClick={() => updateConvAiSettings(activeConversation._id, { 
                              filters: { ...aiSettings.filters, [key]: !aiSettings.filters[key] } 
                            })}
                          >
                            <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                              <Icon size={12} style={{ color: aiSettings.filters[key] ? 'var(--accent)' : 'var(--text-muted)' }} />
                              {label}
                            </div>
                            {aiSettings.filters[key] && <Check size={12} style={{ color: 'var(--accent)' }} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Message Feed ───────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
        style={{ ...getBgStyle(), color: 'var(--text-primary)' }}
      >
        {loading ? (
          <Spinner size="lg" className="py-24" />
        ) : (
          <>
            {loadingMore && <Spinner size="sm" className="mb-2" />}
            {activeMessages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                socket={socket}
                partnerPublicKey={getCachedPublicKey(partnerHex)}
                senderPublicKey={getCachedPublicKey(msg.senderId?.hexId || '')}
                aiEnabled={aiEnabled}
              />
            ))}
          </>
        )}

        {/* Typing indicator */}
        {partnerIsTyping && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: 'var(--accent)', animationDelay: `${delay}s` }}
                />
              ))}
            </div>
            <span className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
              {partnerName} is typing...
            </span>
          </div>
        )}
      </div>

      {/* ── Input Bar ──────────────────────────────────────────────────────── */}
      <InputBar
        conversationId={activeConversation._id}
        receiverHexId={partnerHex}
        onSendMessage={handleSendMessage}
        socket={socket}
      />

      {/* ── Full-Screen Overlay Panels ──────────────────────────────────── */}
      {overlay === 'docs' && (
        <DocsPanelFull messages={activeMessages} onClose={() => setOverlay(null)} />
      )}
      {overlay === 'starred' && (
        <StarredPanelFull messages={activeMessages} onClose={() => setOverlay(null)} />
      )}

      {/* Modals */}
      <Modal 
        isOpen={showPartnerQRModal} 
        onClose={() => setShowPartnerQRModal(false)}
        title={`${partner?.username || 'Contact'}'s Identity`}
      >
        <div className="pt-2">
          <QRDisplay hexId={partnerHex} username={partner?.username} />
        </div>
      </Modal>

      <Modal 
        isOpen={showMyIdentityModal} 
        onClose={() => setShowMyIdentityModal(false)}
        title="Your Identity"
      >
        <div className="pt-2">
          <HexCodeCard hexId={user?.hexId} username={user?.username} />
        </div>
      </Modal>
    </div>
  );
}

export default ChatWindow;
