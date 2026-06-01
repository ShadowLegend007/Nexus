import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  activeMessages: [],
  // Map of messageId -> scanStatus metadata (scanStatus, threatType, threatConfidence, tier)
  messageScanStatuses: new Map(),
  onlineUsers: new Set(), // Set of online user hexIds

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (conversation) => {
    set({ 
      activeConversation: conversation,
      activeMessages: [], // Reset active messages on switch
    });
  },

  setActiveMessages: (messages) => {
    const statusMap = new Map(get().messageScanStatuses);
    // Initialize the status map with loaded message statuses
    messages.forEach((msg) => {
      statusMap.set(msg._id, {
        scanStatus: msg.scanStatus,
        threatType: msg.threatType,
        threatConfidence: msg.threatConfidence,
        tier: msg.scanTier,
      });
    });

    set({ 
      activeMessages: messages,
      messageScanStatuses: statusMap,
    });
  },

  addMessage: (message) => {
    const { activeConversation, activeMessages, messageScanStatuses } = get();
    
    // Only append to activeMessages if it belongs to the current conversation
    if (activeConversation && message.conversationId === activeConversation._id) {
      // Check if message is already in list to avoid socket duplicate emissions
      const exists = activeMessages.some((msg) => msg._id === message._id);
      if (!exists) {
        const updatedMessages = [...activeMessages, message];
        
        // Initialize status map for the new message
        const statusMap = new Map(messageScanStatuses);
        statusMap.set(message._id, {
          scanStatus: message.scanStatus,
          threatType: message.threatType,
          threatConfidence: message.threatConfidence,
          tier: message.scanTier,
        });

        set({ 
          activeMessages: updatedMessages,
          messageScanStatuses: statusMap,
        });
      }
    }

    // Update conversation lastMessage preview in conversations list
    set((state) => {
      const updatedConvs = state.conversations.map((conv) => {
        if (conv._id === message.conversationId) {
          return {
            ...conv,
            lastMessage: message,
            lastActivity: message.createdAt || new Date(),
          };
        }
        return conv;
      });

      // Sort conversations so the active one goes to the top
      updatedConvs.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

      return { conversations: updatedConvs };
    });
  },

  updateMessageStatus: (messageId, statusPayload) => {
    set((state) => {
      const newMap = new Map(state.messageScanStatuses);
      newMap.set(messageId, {
        scanStatus: statusPayload.scanStatus,
        threatType: statusPayload.threatType,
        threatConfidence: statusPayload.threatConfidence,
        tier: statusPayload.tier,
      });

      // Also update isQuarantined flag if payload is MALWARE
      let updatedMessages = [...state.activeMessages];
      const msgIndex = updatedMessages.findIndex((msg) => msg._id === messageId);
      if (msgIndex !== -1) {
        updatedMessages[msgIndex] = {
          ...updatedMessages[msgIndex],
          scanStatus: statusPayload.scanStatus,
          threatType: statusPayload.threatType,
          threatConfidence: statusPayload.threatConfidence,
          scanTier: statusPayload.tier,
          isQuarantined: statusPayload.scanStatus === 'MALWARE',
        };
      }

      return { 
        messageScanStatuses: newMap,
        activeMessages: updatedMessages
      };
    });
  },

  getMessageLiveStatus: (message) => {
    const { messageScanStatuses } = get();
    if (messageScanStatuses.has(message._id)) {
      return messageScanStatuses.get(message._id);
    }
    return {
      scanStatus: message.scanStatus,
      threatType: message.threatType,
      threatConfidence: message.threatConfidence,
      tier: message.scanTier,
    };
  },

  markMessageReadInStore: (messageId, readAt) => {
    set((state) => {
      const updatedMessages = state.activeMessages.map((msg) => {
        if (msg._id === messageId) {
          return { ...msg, readAt };
        }
        return msg;
      });
      return { activeMessages: updatedMessages };
    });
  },

  setOnlineUsers: (onlineHexList) => {
    set({ onlineUsers: new Set(onlineHexList) });
  },

  addUserOnline: (hexId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(hexId);
      return { onlineUsers: newSet };
    });
  },

  removeUserOffline: (hexId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(hexId);
      return { onlineUsers: newSet };
    });
  }
}));

export default useChatStore;
