import axios from 'axios';
import type { DynamicJobInfo, HealthStatus } from '../types';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: VITE_API_URL,
});

export const uploadApk = async (file: File, onProgress: (pct: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const total = progressEvent.total || file.size;
      const pct = Math.round((progressEvent.loaded * 100) / total);
      onProgress(pct);
    }
  });

  return response.data;
};

export const pollJobResult = async (jobId: string) => {
  const response = await apiClient.get<DynamicJobInfo>(`/result/${jobId}`);
  return response.data;
};

export const getHealth = async () => {
  const response = await apiClient.get<HealthStatus>('/health');
  return response.data;
};
