import API from './api';

export const addContact = async (hexId) => {
  const response = await API.post('/api/contacts/add', { hexId });
  return response.data;
};

export const addSelfAsContact = async () => {
  const response = await API.post('/api/contacts/add-self');
  return response.data;
};

export const getContacts = async () => {
  const response = await API.get('/api/contacts');
  return response.data;
};

export const resolveHexId = async (hexId) => {
  const response = await API.get(`/api/contacts/resolve/${hexId}`);
  return response.data;
};

