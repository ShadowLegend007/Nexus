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
