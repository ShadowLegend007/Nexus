import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  activeMessages: [],
  starredMessages: [],
  messageScanStatuses: new Map(),
  onlineUsers: new Set(),
  publicKeys: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversation) => {
    set({
      activeConversation: conversation,
      activeMessages: [],
    });
  },

  setActiveMessages: (messages) => {
    const statusMap = new Map(get().messageScanStatuses);
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
    if (activeConversation && message.conversationId === activeConversation._id) {
      const exists = activeMessages.some((msg) => msg._id === message._id);
      if (!exists) {
        const updatedMessages = [...activeMessages, message];
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

  updateMessageAiReport: (messageId, aiReport, sharedWith) => {
    set((state) => {
      const updatedMessages = state.activeMessages.map((msg) => {
        if (msg._id === messageId) {
          return {
            ...msg,
            aiReport,
            aiAnalyzed: true,
            aiReportSharedWith: sharedWith || msg.aiReportSharedWith,
          };
        }
        return msg;
      });
      return { activeMessages: updatedMessages };
    });
  },

  toggleStarInStore: (messageId, starred) => {
    set((state) => {
      const updatedMessages = state.activeMessages.map((msg) => {
        if (msg._id === messageId) {
          return { ...msg, _clientStarred: starred };
        }
        return msg;
      });
      return { activeMessages: updatedMessages };
    });
  },

  setStarredMessages: (messages) => set({ starredMessages: messages }),

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
        if (msg._id === messageId) return { ...msg, readAt };
        return msg;
      });
      const updatedConvs = state.conversations.map((conv) => {
        if (conv.lastMessage && conv.lastMessage._id === messageId) {
          return { ...conv, lastMessage: { ...conv.lastMessage, readAt } };
        }
        return conv;
      });
      let updatedActiveConv = state.activeConversation;
      if (updatedActiveConv && updatedActiveConv.lastMessage && updatedActiveConv.lastMessage._id === messageId) {
        updatedActiveConv = { ...updatedActiveConv, lastMessage: { ...updatedActiveConv.lastMessage, readAt } };
      }
      return { activeMessages: updatedMessages, conversations: updatedConvs, activeConversation: updatedActiveConv };
    });
  },

  markMessageDeliveredInStore: (messageId, deliveredAt) => {
    set((state) => {
      const updatedMessages = state.activeMessages.map((msg) => {
        if (msg._id === messageId) return { ...msg, deliveredAt };
        return msg;
      });
      return { activeMessages: updatedMessages };
    });
  },

  deleteMessageInStore: (messageId, isDeletedForEveryone) => {
    set((state) => {
      const updatedMessages = state.activeMessages.map((msg) => {
        if (msg._id === messageId) {
          return isDeletedForEveryone
            ? { ...msg, isDeletedForEveryone: true, textContent: null, fileUrl: null, fileName: null }
            : { ...msg, deletedForMe: true };
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
  },

  cachePublicKey: (hexId, publicKey) => {
    set((state) => ({
      publicKeys: { ...state.publicKeys, [hexId]: publicKey }
    }));
  },

  getCachedPublicKey: (hexId) => {
    return get().publicKeys[hexId] || null;
  },
}));

export default useChatStore;
