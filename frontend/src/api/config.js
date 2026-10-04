import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://mindgraph.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60000, // 60s timeout for cold start requests and file uploads
});

export default api;
