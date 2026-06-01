import API from './api';

export const getConversations = async () => {
  const response = await API.get('/api/conversations');
  return response.data;
};

export const startConversation = async (hexId) => {
  const response = await API.post('/api/conversations/start', { hexId });
  return response.data;
};
