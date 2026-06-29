import apiClient from './client';
import { Tag } from '../types';

export const tagsApi = {
  list: (): Promise<Tag[]> =>
    apiClient.get('/tags').then((r) => r.data.data || r.data),
  create: (data: { name: string; color: string }): Promise<Tag> =>
    apiClient.post('/tags', data).then((r) => r.data.data || r.data),
  update: (id: string, data: { name?: string; color?: string }): Promise<Tag> =>
    apiClient.put(`/tags/${id}`, data).then((r) => r.data.data || r.data),
  delete: (id: string) =>
    apiClient.delete(`/tags/${id}`),
};
