import axios from 'axios';

const api = axios.create({
  // This looks for VITE_API_URL in your .env file
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;