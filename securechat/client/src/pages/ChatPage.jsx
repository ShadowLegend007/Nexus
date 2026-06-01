import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useUiStore from '../store/uiStore';
import useSocket from '../hooks/useSocket';
import { getConversations } from '../api/conversations';
import ChatWindow from '../components/chat/ChatWindow';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { formatHexId } from '../utils/hexGenerator';
import { 
  Shield, LogOut, Settings, UserPlus, Search, 
  Moon, Sun, Radio, MessageSquare, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ChatPage() {
  const { user, logout } = useAuthStore();
  const { conversations, setConversations, activeConversation, setActiveConversation, onlineUsers, setOnlineUsers } = useChatStore();
  const { theme, toggleTheme, initTheme } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Instantiate the background Socket connection hook
  const socket = useSocket();

  useEffect(() => {
    initTheme();
    
    const fetchConversationsList = async () => {
      setLoading(true);
      try {
        const list = await getConversations();
        setConversations(list);

        // Map initial active user list from online list
        // Note: Socket triggers online/offline status pushes dynamically.
        // We initialize the list by parsing participants of conversations
        // who might be active, or wait for socket indicators.
      } catch (err) {
        toast.error('Failed to load conversation logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversationsList();
  }, [setConversations]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
  };

  // Filter conversations by partner's username or Hex ID
  const filteredConversations = conversations.filter((conv) => {
    const partner = conv.participants.find((p) => (p._id || p) !== user?._id);
    if (!partner) return false;

    const query = searchQuery.toLowerCase();
    return (
      partner.username.toLowerCase().includes(query) ||
      partner.hexId.toLowerCase().includes(query)
    );
  });

  // Calculate unread badge count preview
  const getUnreadCount = (conv) => {
    // Unread logic can be mapped here: if lastMessage readAt is null and sender isn't me
    if (
      conv.lastMessage && 
      !conv.lastMessage.readAt && 
      conv.lastMessage.senderId !== user?._id &&
      conv.lastMessage.senderId?._id !== user?._id
    ) {
      return 1;
    }
    return 0;
  };

  const formatLastActivity = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderConversationItem = (conv) => {
    const partner = conv.participants.find((p) => (p._id || p) !== user?._id);
    if (!partner) return null;

    const isSelected = activeConversation?._id === conv._id;
    const isOnline = onlineUsers.has(partner.hexId);
    const unread = getUnreadCount(conv);
    
    // Formatting preview snippet
    const lastMsg = conv.lastMessage;
    let snippet = 'No messages yet';
    if (lastMsg) {
      if (lastMsg.isQuarantined) {
        snippet = '🚫 Quarantined message';
      } else if (lastMsg.contentType === 'text') {
        snippet = lastMsg.textContent;
      } else {
        snippet = `📎 Attachment [${lastMsg.contentType}]`;
      }
    }

    return (
      <div
        key={conv._id}
        onClick={() => handleSelectConversation(conv)}
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' 
            : 'bg-surface-dark2/45 hover:bg-surface-dark2 border-border-dark dark:bg-surface-dark2/45 dark:hover:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2/45 light:hover:bg-surface-light2 light:border-border-light'
        }`}
      >
        <div className="flex items-center space-x-3 overflow-hidden text-left">
          <Avatar 
            src={partner.avatar} 
            name={partner.username} 
            status={isOnline ? 'online' : 'offline'}
            size="md" 
          />
          <div className="overflow-hidden">
            <div className="flex items-center space-x-1.5">
              <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-text-primaryDark dark:text-text-primaryDark light:text-text-primaryLight'}`}>
                {partner.username}
              </span>
            </div>
            
            <p className={`text-xs truncate max-w-[150px] ${isSelected ? 'text-white/80' : 'text-text-secondaryDark font-medium'}`}>
              {snippet}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-9 flex-shrink-0 text-right">
          <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-text-secondaryDark'}`}>
            {formatLastActivity(conv.lastActivity)}
          </span>
          
          {unread > 0 && (
            <span className={`inline-flex items-center justify-center min-w-4 h-4 rounded-full text-[9px] font-black px-1.5 ${
              isSelected ? 'bg-white text-primary' : 'bg-primary text-white'
            }`}>
              {unread}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background-dark text-text-primaryDark overflow-hidden font-sans dark:bg-background-dark dark:text-text-primaryDark light:bg-background-light light:text-text-primaryLight animate-fade-in">
      {/* 1. LEFT SIDEBAR PANEL */}
      <aside className="w-full md:w-[350px] h-full flex flex-col border-r border-border-dark bg-surface-dark/95 backdrop-blur dark:border-border-dark dark:bg-surface-dark/95 light:border-border-light light:bg-surface-light/95 flex-shrink-0 z-20">
        
        {/* User Summary Header */}
        <div className="p-4 border-b border-border-dark flex items-center justify-between dark:border-border-dark light:border-border-light bg-surface-dark dark:bg-surface-dark light:bg-surface-light">
          <div className="flex items-center space-x-3 cursor-pointer text-left" onClick={() => navigate('/profile')}>
            <Avatar src={user?.avatar} name={user?.username} size="sm" className="border border-primary/45" />
            <div className="overflow-hidden">
              <h4 className="text-xs font-black tracking-tight text-text-primaryDark truncate w-24 dark:text-text-primaryDark light:text-text-primaryLight">
                {user?.username || 'Guest'}
              </h4>
              <span className="font-mono text-[9px] text-text-secondaryDark block truncate w-24">
                {formatHexId(user?.hexId)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface-dark2 border border-border-dark hover:bg-border-dark text-text-secondaryDark hover:text-primary dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light transition-all outline-none"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg bg-surface-dark2 border border-border-dark hover:bg-border-dark text-text-secondaryDark hover:text-primary dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light transition-all outline-none"
            >
              <Settings size={14} />
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-surface-dark2 border border-border-dark hover:bg-danger/10 text-text-secondaryDark hover:text-danger dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light transition-all outline-none"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Search & Add contacts composition bar */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-secondaryDark uppercase tracking-wider flex items-center">
              <MessageSquare size={14} className="mr-1.5" />
              Secure Rooms
            </h3>
            
            <button 
              onClick={() => navigate('/add-contact')}
              className="flex items-center space-x-1 text-xs font-bold text-primary hover:underline outline-none"
            >
              <UserPlus size={14} className="mr-1" />
              <span>Add</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search chatrooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
            />
            <Search size={14} className="absolute left-3.5 top-2.5 text-text-secondaryDark" />
          </div>
        </div>

        {/* Conversation List logs */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? (
            <Spinner size="md" className="py-24" />
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <Radio size={36} className="mx-auto text-text-mutedDark pulse-primary" />
              <div className="text-xs text-text-secondaryDark leading-relaxed px-6">
                No active secure rooms found. Add a contact using their Hex ID to open a session!
              </div>
            </div>
          ) : (
            filteredConversations.map(renderConversationItem)
          )}
        </div>
      </aside>

      {/* 2. RIGHT CHAT WINDOW FRAME */}
      <main className="flex-1 h-full">
        <ChatWindow socket={socket} />
      </main>
    </div>
  );
}

export default ChatPage;
