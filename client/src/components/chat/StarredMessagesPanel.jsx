import React, { useEffect, useState } from 'react';
import { getStarredMessages } from '../../api/messages';
import useChatStore from '../../store/chatStore';
import { Star, MessageSquare, X, FileText, Image as ImageIcon, Video, Music, File } from 'lucide-react';
import { formatBytes } from '../../utils/fileValidator';

const typeIcon = (type) => {
  const cls = 'w-4 h-4 flex-shrink-0';
  if (type === 'image') return <ImageIcon size={16} className={`text-blue-400 ${cls}`} />;
  if (type === 'video') return <Video size={16} className={`text-pink-400 ${cls}`} />;
  if (type === 'audio') return <Music size={16} className={`text-green-400 ${cls}`} />;
  if (type === 'pdf' || type === 'word' || type === 'ppt' || type === 'excel') return <FileText size={16} className={`text-orange-400 ${cls}`} />;
  return <File size={16} className={`text-purple-400 ${cls}`} />;
};

export function StarredMessagesPanel({ onClose, onJumpToConversation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { conversations, activeConversation } = useChatStore();

  useEffect(() => {
    setLoading(true);
    getStarredMessages()
      .then(data => setMessages(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const getConvName = (msg) => {
    const convId = msg.conversationId?._id || msg.conversationId;
    const conv = conversations.find(c => c._id === convId);
    return conv ? 'Conversation' : 'Unknown Chat';
  };

  const filteredMessages = messages.filter(msg => {
    if (!activeConversation) return true;
    const convId = msg.conversationId?._id || msg.conversationId;
    return convId === activeConversation._id;
  });

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h2 className="text-base font-bold flex items-center gap-2">
          <Star size={18} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
          Starred Messages
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Star size={36} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No starred messages yet in this chat.</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Long-press or right-click a message to star it.</p>
          </div>
        ) : (
          filteredMessages.map(msg => (
            <button
              key={msg._id}
              onClick={() => onJumpToConversation && onJumpToConversation(msg.conversationId)}
              className="w-full text-left p-3 rounded-xl transition-all group"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--bg-input)' }}
                >
                  {msg.contentType === 'text'
                    ? <MessageSquare size={14} style={{ color: 'var(--accent)' }} />
                    : typeIcon(msg.contentType)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold truncate" style={{ color: 'var(--accent)' }}>
                      {msg.senderId?.username || 'User'}
                    </span>
                    <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>{fmt(msg.createdAt)}</span>
                  </div>
                  {msg.contentType === 'text' ? (
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{msg.textContent}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      {typeIcon(msg.contentType)}
                      <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{msg.fileName || 'Attachment'}</span>
                      {msg.fileSize && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatBytes(msg.fileSize)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default StarredMessagesPanel;
