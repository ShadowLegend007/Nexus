import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('172.17.180.222')) {
    return envUrl.replace('localhost', window.location.hostname);
  }
  return `http://${window.location.hostname || 'localhost'}:5000`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

// Interceptor to inject JWT from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
