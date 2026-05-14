import axios from 'axios';
import { useAuthStore } from '../store/auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
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
};

export default api;