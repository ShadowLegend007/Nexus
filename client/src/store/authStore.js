import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, getMe as apiGetMe } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('securechat_token') || null,
  hexId: localStorage.getItem('securechat_hexId') || null,
  isAuthenticated: !!localStorage.getItem('securechat_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem('securechat_token', data.token);
      localStorage.setItem('securechat_hexId', data.hexId);
      set({
        user: data.user,
        token: data.token,
        hexId: data.hexId,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRegister(username, email, password);
      localStorage.setItem('securechat_token', data.token);
      localStorage.setItem('securechat_hexId', data.hexId);
      set({
        user: data.user,
        token: data.token,
        hexId: data.hexId,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('securechat_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ loading: true });
    try {
      const user = await apiGetMe();
      set({
        user,
        hexId: user.hexId,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      localStorage.removeItem('securechat_token');
      localStorage.removeItem('securechat_hexId');
      set({
        user: null,
        token: null,
        hexId: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('securechat_token');
    localStorage.removeItem('securechat_hexId');
    set({
      user: null,
      token: null,
      hexId: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateUserAvatar: (newAvatarUrl) => {
    set((state) => ({
      user: state.user ? { ...state.user, avatar: newAvatarUrl } : null,
    }));
  }
}));

export default useAuthStore;
