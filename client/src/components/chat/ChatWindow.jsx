import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useUiStore } from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { getMessages, sendMessage as apiSendMessage } from '../../api/messages';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import Spinner from '../ui/Spinner';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import QRDisplay from '../contacts/QRDisplay';
import { formatHexId } from '../../utils/hexGenerator';
import { Shield, MessageSquare, QrCode, Sparkles, ArrowLeft } from 'lucide-react';

export function ChatWindow({ socket }) {
  const { user } = useAuthStore();
  const { activeConversation, activeMessages, setActiveMessages, addMessage, onlineUsers, setActiveConversation } = useChatStore();
  const { getTypingUsersForConversation } = useUiStore();
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const scrollRef = useRef(null);

  // Identify chat partner
  const partner = activeConversation?.participants.find((p) => (p._id || p) !== user?._id);
  const partnerHex = partner?.hexId || '';
  const partnerOnline = onlineUsers.has(partnerHex);

  // Typing indicators
  const typingHexList = getTypingUsersForConversation(activeConversation?._id || '');
  const partnerIsTyping = typingHexList.some((hex) => hex === partnerHex);

  // Fetch initial messages on chat active toggle
  useEffect(() => {
    if (!activeConversation) return;

    const fetchInitial = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const history = await getMessages(activeConversation._id, null, 40);
        setActiveMessages(history);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch message history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [activeConversation, setActiveMessages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Prepend historical messages on scrolling to top
  const handleScroll = async (e) => {
    if (loadingMore || !hasMore || !activeConversation || activeMessages.length === 0) return;

    const element = e.target;
    // When scroll reaches top 5%
    if (element.scrollTop < 50) {
      setLoadingMore(true);
      const firstMessageId = activeMessages[0]._id;
      const scrollHeightBefore = element.scrollHeight;

      try {
        const olderHistory = await getMessages(activeConversation._id, firstMessageId, 40);
        if (olderHistory.length < 40) {
          setHasMore(false);
        }

        if (olderHistory.length > 0) {
          setActiveMessages([...olderHistory, ...activeMessages]);
          // Maintain scroll offset position
          setTimeout(() => {
            element.scrollTop = element.scrollHeight - scrollHeightBefore;
          }, 50);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const handleSendMessage = async (msgData) => {
    // Send REST request
    // Note: The message is saved as SCANNING, socket message:new is fired inside,
    // and mlService starts scanning. Once scanned, socket emits message:status!
    try {
      const response = await apiSendMessage(msgData);
      addMessage(response);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Scroll down on new messages automatically
  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, partnerIsTyping]);

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 bg-surface-dark text-text-secondaryDark text-center dark:bg-surface-dark dark:text-text-secondaryDark light:bg-surface-light light:text-text-secondaryLight">
        <div className="max-w-md space-y-6">
          <div className="inline-flex p-4 bg-primary/10 text-primary border border-primary/20 rounded-full animate-bounce">
            <Shield size={44} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-primaryDark dark:text-text-primaryDark light:text-text-primaryLight flex items-center justify-center gap-1.5">
              SecureChat <Sparkles size={20} className="text-primary animate-pulse" />
            </h2>
            <p className="text-sm text-text-secondaryDark dark:text-text-secondaryDark light:text-text-secondaryLight leading-relaxed">
              Experience absolute privacy and security. Select an existing contact or click "+" to exchange identity Hex keys and start chatting.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left pt-6">
            <div className="p-4 bg-surface-dark2 border border-border-dark rounded-xl space-y-2 dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light">
              <div className="text-xs font-bold text-text-primaryDark uppercase tracking-wider dark:text-text-primaryDark light:text-text-primaryLight">
                🛡️ Threat Scanning
              </div>
              <p className="text-[10px] text-text-secondaryDark dark:text-text-secondaryDark light:text-text-secondaryLight">
                Dynamic 2-Tier AI inspection of files, images, PDFs and text snippets.
              </p>
            </div>
            
            <div className="p-4 bg-surface-dark2 border border-border-dark rounded-xl space-y-2 dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light">
              <div className="text-xs font-bold text-text-primaryDark uppercase tracking-wider dark:text-text-primaryDark light:text-text-primaryLight">
                🔑 Hex Address ID
              </div>
              <p className="text-[10px] text-text-secondaryDark dark:text-text-secondaryDark light:text-text-secondaryLight">
                Complete pseudonymity. Identity bound strictly to a unique 12-character Hex code.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-surface-dark dark:bg-surface-dark light:bg-surface-light relative overflow-hidden">
      {/* Active Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark dark:border-border-dark light:border-border-light bg-surface-dark/95 dark:bg-surface-dark/95 light:bg-surface-light/95 z-10 backdrop-blur">
        <div className="flex items-center space-x-3 text-left">
          {/* Mobile view Back Navigation Arrow */}
          <button 
            onClick={() => setActiveConversation(null)}
            className="md:hidden p-2 -ml-2 mr-1 rounded-xl bg-surface-dark2 border border-border-dark text-text-secondaryDark hover:text-primary dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light transition-all outline-none"
          >
            <ArrowLeft size={16} />
          </button>

          <Avatar 
            src={partner?.avatar} 
            name={partner?.username} 
            status={partnerOnline ? 'online' : 'offline'}
            size="md" 
          />
          <div>
            <h3 className="text-sm font-bold text-text-primaryDark dark:text-text-primaryDark light:text-text-primaryLight">
              {partner?.username || 'Partner'}
            </h3>
            <span className="font-mono text-[10px] text-text-secondaryDark block mt-0.5">
              {formatHexId(partnerHex)}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowQRModal(true)}
          className="p-2.5 rounded-xl bg-surface-dark2 border border-border-dark text-text-secondaryDark hover:text-primary transition-all dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light outline-none"
        >
          <QrCode size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4"
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
              />
            ))}
          </>
        )}

        {/* Live typing indicator inside chat frame */}
        {partnerIsTyping && (
          <div className="flex items-center space-x-2 text-text-secondaryDark animate-pulse justify-start mb-2 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0.4s' }} />
            <span className="text-[10px] italic font-semibold font-sans ml-1 text-primary">
              {partner?.username || 'Partner'} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Input composition section */}
      <InputBar
        conversationId={activeConversation._id}
        receiverHexId={partnerHex}
        onSendMessage={handleSendMessage}
        socket={socket}
      />

      {/* QR Code Presentation Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`${partner?.username || 'Partner'}'s Secure Identity`}
      >
        <div className="flex justify-center">
          <QRDisplay hexId={partnerHex} username={partner?.username} />
        </div>
      </Modal>
    </div>
  );
}

export default ChatWindow;
