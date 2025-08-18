import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Remove token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);