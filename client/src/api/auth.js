import API from './api';

export const register = async (username, email, password) => {
  const response = await API.post('/api/auth/register', { username, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await API.post('/api/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/api/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await API.put('/api/auth/profile', data);
  return response.data;
};

export const storePublicKey = async (publicKey, encryptedPrivateKey) => {
  const response = await API.post('/api/auth/public-key', { publicKey, encryptedPrivateKey });
  return response.data;
};

export const getPublicKey = async (hexId) => {
  const response = await API.get(`/api/auth/public-key/${hexId}`);
  return response.data;
};

export const updatePreferences = async (preferences) => {
  const response = await API.put('/api/auth/preferences', { preferences });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await API.post('/api/auth/verify-otp', { email, otp });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await API.post('/api/auth/reset-password', { email, otp, newPassword });
  return response.data;
};
