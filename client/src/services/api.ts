import axios from 'axios';
import { useAuthStore } from '../store/auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (data: {
    username: string;
    password: string;
    email: string;
    phone?: string;
    nickname?: string;
  }) => api.post('/auth/register', data),

  getProfile: () => api.get('/v1/users/profile'),

  updateProfile: (data: {
    nickname?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }) => api.put('/v1/users/profile', data),

  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) => api.post('/v1/users/change-password', data),
};

export const projectAPI = {
  list: (page = 1, size = 20) =>
    api.get(`/v1/projects?page=${page}&size=${size}`),

  get: (id: string) => api.get(`/v1/projects/${id}`),

  create: (data: {
    name: string;
    description?: string;
    type: number;
    settings?: string;
  }) => api.post('/v1/projects', data),

  update: (id: string, data: {
    name?: string;
    description?: string;
    settings?: string;
  }) => api.put(`/v1/projects/${id}`, data),

  delete: (id: string) => api.delete(`/v1/projects/${id}`),

  publish: (id: string) => api.post(`/v1/projects/${id}/publish`),

  unpublish: (id: string) => api.post(`/v1/projects/${id}/unpublish`),

  updateQuestions: (id: string, questions: string) =>
    api.post(`/v1/projects/${id}/questions`, { questions }),

  duplicate: (id: string) => api.post(`/v1/projects/${id}/duplicate`),
};

export const questionAPI = {
  list: (projectId: string) =>
    api.get(`/v1/projects/${projectId}/questions`),

  get: (projectId: string, questionId: string) =>
    api.get(`/v1/projects/${projectId}/questions/${questionId}`),

  create: (projectId: string, data: {
    title: string;
    type: number;
    required?: boolean;
    options?: string;
    validation?: string;
    logic?: string;
    settings?: string;
  }) => api.post(`/v1/projects/${projectId}/questions`, data),

  update: (projectId: string, questionId: string, data: {
    title?: string;
    type?: number;
    required?: boolean;
    options?: string;
    validation?: string;
    logic?: string;
    settings?: string;
  }) => api.put(`/v1/projects/${projectId}/questions/${questionId}`, data),

  delete: (projectId: string, questionId: string) =>
    api.delete(`/v1/projects/${projectId}/questions/${questionId}`),

  sort: (projectId: string, questionIds: string[]) =>
    api.post(`/v1/projects/${projectId}/questions/sort`, { questionIds }),

  batchCreate: (projectId: string, questions: any[]) =>
    api.post(`/v1/projects/${projectId}/questions/batch`, { questions }),
};

export const answerAPI = {
  submit: (projectId: string, data: {
    answers: string;
    timeSpent?: number;
  }) => api.post(`/v1/projects/${projectId}/answers`, data),

  list: (projectId: string, page = 1, size = 20) =>
    api.get(`/v1/projects/${projectId}/answers?page=${page}&size=${size}`),

  get: (projectId: string, answerId: string) =>
    api.get(`/v1/projects/${projectId}/answers/${answerId}`),

  statistics: (projectId: string) =>
    api.get(`/v1/projects/${projectId}/answers/statistics`),

  myAnswers: (page = 1, size = 20) =>
    api.get(`/v1/answers?page=${page}&size=${size}`),

  updateScore: (projectId: string, answerId: string, score: number) =>
    api.post(`/v1/projects/${projectId}/answers/${answerId}/score`, { score }),

  export: (projectId: string) =>
    api.get(`/v1/projects/${projectId}/answers/export`, {
      responseType: 'blob',
    }),
};

export const repoAPI = {
  list: (page = 1, size = 50) =>
    api.get(`/v1/repos?page=${page}&size=${size}`),

  get: (id: string) => api.get(`/v1/repos/${id}`),

  create: (data: {
    name: string;
    description?: string;
    type: number;
    content?: string;
    isPublic?: boolean;
  }) => api.post('/v1/repos', data),

  update: (id: string, data: {
    name?: string;
    description?: string;
    content?: string;
    isPublic?: boolean;
  }) => api.put(`/v1/repos/${id}`, data),

  delete: (id: string) => api.delete(`/v1/repos/${id}`),

  import: (id: string, content: string) =>
    api.post(`/v1/repos/${id}/import`, { content }),

  listPublic: (page = 1, size = 20) =>
    api.get(`/v1/repos/public?page=${page}&size=${size}`),
};

export const fileAPI = {
  upload: (formData: FormData) =>
    api.post('/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  list: () => api.get('/v1/files'),

  delete: (id: string) => api.delete(`/v1/files/${id}`),

  download: (filename: string) =>
    api.get(`/v1/files/download/${filename}`, { responseType: 'blob' }),
};

export const notificationAPI = {
  list: (page = 1, size = 20) =>
    api.get(`/v1/notifications?page=${page}&size=${size}`),

  markAsRead: (id: string) => api.post(`/v1/notifications/${id}/read`),

  markAllAsRead: () => api.post('/v1/notifications/read-all'),

  unreadCount: () => api.get('/v1/notifications/unread-count'),

  delete: (id: string) => api.delete(`/v1/notifications/${id}`),
};

export const systemAPI = {
  health: () => api.get('/health'),

  info: () => api.get('/info'),

  stats: () => api.get('/stats'),

  config: () => api.get('/config'),
};

export default api;