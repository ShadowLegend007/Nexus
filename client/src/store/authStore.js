import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, getMe as apiGetMe, forgotPassword as apiForgotPassword, verifyOtp as apiVerifyOtp, resetPassword as apiResetPassword } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('nexus_token') || null,
  hexId: localStorage.getItem('nexus_hexId') || null,
  isAuthenticated: !!localStorage.getItem('nexus_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem('nexus_token', data.token);
      localStorage.setItem('nexus_hexId', data.hexId);
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
      localStorage.setItem('nexus_token', data.token);
      localStorage.setItem('nexus_hexId', data.hexId);
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
    const token = localStorage.getItem('nexus_token');
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
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_hexId');
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
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_hexId');
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
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const data = await apiForgotPassword(email);
      set({ loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const data = await apiVerifyOtp(email, otp);
      set({ loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to verify OTP';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    set({ loading: true, error: null });
    try {
      const data = await apiResetPassword(email, otp, newPassword);
      set({ loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  }
}));

export default useAuthStore;
