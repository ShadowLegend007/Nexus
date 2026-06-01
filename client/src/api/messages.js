import API from './api';

export const sendMessage = async (messageData) => {
  const response = await API.post('/api/messages/send', messageData);
  return response.data;
};

export const getMessages = async (conversationId, before = null, limit = 50) => {
  let url = `/api/messages/${conversationId}?limit=${limit}`;
  if (before) {
    url += `&before=${before}`;
  }
  const response = await API.get(url);
  return response.data;
};
