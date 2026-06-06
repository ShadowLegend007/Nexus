import { create } from 'zustand';
import { updatePreferences } from '../api/auth';

// ── Helpers ────────────────────────────────────────────────────────────────────
const loadPref = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const savePref = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// Apply theme data-attribute to <html> so CSS vars take effect
const applyTheme = (themeId) => {
  document.documentElement.setAttribute('data-theme', themeId);
  // Tailwind dark compatibility
  // dark, deep-night, monochrome = dark class; light, warm-light, inverted = no dark class
  const isDark = themeId === 'dark' || themeId === 'deep-night' || themeId === 'monochrome';
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Apply layout data-attribute to <html>
const applyLayout = (layoutId) => {
  document.documentElement.setAttribute('data-layout', layoutId);
};

// ── Store ──────────────────────────────────────────────────────────────────────
export const useUiStore = create((set, get) => ({
  activeModal: null,

  // Theme: 'dark' | 'deep-night' | 'light' | 'warm-light'
  theme: loadPref('nexus_theme', 'dark'),

  // Chat background: preset id or 'custom'
  chatBg: loadPref('nexus_chatBg', 'default'),
  customBgUrl: loadPref('nexus_customBgUrl', ''),

  // Layout: 'default' | 'compact' | 'bubble'
  chatLayout: loadPref('nexus_chatLayout', 'default'),

  // Per-conversation AI analysis setting { [convId]: boolean }
  convAiSettings: loadPref('nexus_convAiSettings', {}),

  // Active sidebar tab: 'chats' | 'starred'
  sidebarTab: 'chats',

  // Map of conversationId -> Set of hexIds typing
  typingUsers: new Map(),

  // ── Initialization ───────────────────────────────────────────────────────────
  initTheme: () => {
    const { theme, chatLayout } = get();
    applyTheme(theme);
    applyLayout(chatLayout);
  },

  // ── Theme Control ────────────────────────────────────────────────────────────
  setTheme: (themeId) => {
    savePref('nexus_theme', themeId);
    // Reset background to default when theme changes so background natively updates with the theme
    savePref('nexus_chatBg', 'default');
    savePref('nexus_customBgUrl', '');
    applyTheme(themeId);
    set({ theme: themeId, chatBg: 'default', customBgUrl: '' });
    updatePreferences({ theme: themeId, chatBg: 'default' }).catch(() => {});
  },

  // Legacy toggle (kept for back-compat with any remaining usages)
  toggleTheme: () => {
    const { theme } = get();
    const next = (theme === 'dark' || theme === 'deep-night') ? 'light' : 'dark';
    get().setTheme(next);
  },

  // ── Chat Background ──────────────────────────────────────────────────────────
  setChatBg: (bgId) => {
    savePref('nexus_chatBg', bgId);
    set({ chatBg: bgId });
    updatePreferences({ chatBg: bgId }).catch(() => {});
  },

  setCustomBgUrl: (url) => {
    savePref('nexus_customBgUrl', url);
    savePref('nexus_chatBg', 'custom');
    set({ customBgUrl: url, chatBg: 'custom' });
  },

  // ── Layout ───────────────────────────────────────────────────────────────────
  setChatLayout: (layout) => {
    savePref('nexus_chatLayout', layout);
    applyLayout(layout);
    set({ chatLayout: layout });
    updatePreferences({ layout }).catch(() => {});
  },

  // ── Per-contact AI ───────────────────────────────────────────────────────────
  getConvAiSettings: (convId) => {
    const { convAiSettings } = get();
    const val = convAiSettings[convId];
    // Default structure
    const defaultSettings = {
      enabled: true,
      shareReport: false,
      filters: { text: true, documents: true, images: true, videos: false }
    };
    
    if (val === undefined) return defaultSettings;
    // Backward compatibility for when it was just a boolean
    if (typeof val === 'boolean') {
      return { ...defaultSettings, enabled: val };
    }
    return { ...defaultSettings, ...val };
  },

  updateConvAiSettings: (convId, newSettings) => {
    set(state => {
      const current = get().getConvAiSettings(convId);
      const updated = { ...state.convAiSettings, [convId]: { ...current, ...newSettings } };
      savePref('nexus_convAiSettings', updated);
      return { convAiSettings: updated };
    });
  },

  setConvAiEnabled: (convId, enabled) => {
    get().updateConvAiSettings(convId, { enabled });
  },

  getConvAiEnabled: (convId) => {
    return get().getConvAiSettings(convId).enabled;
  },

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // ── Modals ───────────────────────────────────────────────────────────────────
  setActiveModal: (modalName) => set({ activeModal: modalName }),

  // ── Typing Indicators ────────────────────────────────────────────────────────
  setTyping: (conversationId, senderHexId, isTyping) => {
    set((state) => {
      const newMap = new Map(state.typingUsers);
      if (!newMap.has(conversationId)) newMap.set(conversationId, new Set());
      const setForConv = newMap.get(conversationId);
      if (isTyping) setForConv.add(senderHexId);
      else setForConv.delete(senderHexId);
      return { typingUsers: newMap };
    });
  },

  getTypingUsersForConversation: (conversationId) => {
    const { typingUsers } = get();
    const typingSet = typingUsers.get(conversationId);
    return typingSet ? Array.from(typingSet) : [];
  },
}));

export default useUiStore;
