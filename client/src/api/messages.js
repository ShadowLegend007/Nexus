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

export const deleteMessageForMe = (messageId) => {
  return API.delete(`/api/messages/${messageId}/me`).then(r => r.data);
};

export const deleteMessageForEveryone = (messageId) => {
  return API.delete(`/api/messages/${messageId}/everyone`).then(r => r.data);
};

export const starMessage = (messageId) => {
  return API.put(`/api/messages/${messageId}/star`).then(r => r.data);
};

export const getStarredMessages = () => {
  return API.get('/api/messages/starred').then(r => r.data);
};

export const submitAiReport = (messageId, report) => {
  return API.post(`/api/messages/${messageId}/ai-report`, { report }).then(r => r.data);
};

export const shareAiReport = (messageId) => {
  return API.post(`/api/messages/${messageId}/share-ai-report`).then(r => r.data);
};

export const updateConvAiSetting = (conversationId, enabled) => {
  return API.put(`/api/conversations/${conversationId}/ai-setting`, { enabled }).then(r => r.data);
};

export const getConversationDocuments = (conversationId) => {
  return API.get(`/api/messages/${conversationId}?limit=500`).then(r =>
    r.data.filter(m => m.fileUrl && ['pdf', 'word', 'excel', 'ppt', 'image', 'video', 'audio', 'other'].includes(m.contentType))
  );
};

