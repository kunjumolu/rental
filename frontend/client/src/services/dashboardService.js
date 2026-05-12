import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get('/dashboard/activity');
  return response.data;
};

// Health check as per your checklist
export const checkBackendHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};