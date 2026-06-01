import { create } from 'zustand';

export const useUiStore = create((set, get) => ({
  activeModal: null, // 'addContact' | 'profile' | 'qrScanner' | etc.
  theme: localStorage.getItem('securechat_theme') || 'dark',
  // Map of conversationId -> Set of hexIds typing
  typingUsers: new Map(),

  setActiveModal: (modalName) => set({ activeModal: modalName }),
  
  initTheme: () => {
    const currentTheme = get().theme;
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('securechat_theme', nextTheme);
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    set({ theme: nextTheme });
  },

  setTyping: (conversationId, senderHexId, isTyping) => {
    set((state) => {
      const newMap = new Map(state.typingUsers);
      if (!newMap.has(conversationId)) {
        newMap.set(conversationId, new Set());
      }
      
      const setForConv = newMap.get(conversationId);
      if (isTyping) {
        setForConv.add(senderHexId);
      } else {
        setForConv.delete(senderHexId);
      }
      
      return { typingUsers: newMap };
    });
  },

  getTypingUsersForConversation: (conversationId) => {
    const { typingUsers } = get();
    const typingSet = typingUsers.get(conversationId);
    return typingSet ? Array.from(typingSet) : [];
  }
}));

export default useUiStore;
