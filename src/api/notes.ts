import apiClient from './client';
import { Note, PagedResponse } from '../types';

export const notesApi = {
  create: (data: { title: string; content?: string }): Promise<Note> =>
    apiClient.post('/notes', data).then((r) => r.data.data || r.data),
  get: (id: string): Promise<Note> =>
    apiClient.get(`/notes/${id}`).then((r) => r.data.data || r.data),
  list: (params?: { page?: number; size?: number; tagId?: string; pinned?: boolean; search?: string; sort?: string }): Promise<PagedResponse<Note>> =>
    apiClient.get('/notes', { params }).then((r) => r.data.data || r.data),
  listTrash: (params?: { page?: number; size?: number }): Promise<PagedResponse<Note>> =>
    apiClient.get('/notes/trash', { params }).then((r) => r.data.data || r.data),
  update: (id: string, data: { title?: string; content?: string; knownVersion: number }): Promise<Note> =>
    apiClient.put(`/notes/${id}`, data).then((r) => r.data.data || r.data),
  pin: (id: string): Promise<Note> =>
    apiClient.patch(`/notes/${id}/pin`).then((r) => r.data.data || r.data),
  unpin: (id: string): Promise<Note> =>
    apiClient.patch(`/notes/${id}/unpin`).then((r) => r.data.data || r.data),
  softDelete: (id: string): Promise<Note> =>
    apiClient.delete(`/notes/${id}`).then((r) => r.data.data || r.data),
  restore: (id: string): Promise<Note> =>
    apiClient.post(`/notes/${id}/restore`).then((r) => r.data.data || r.data),
  hardDelete: (id: string) =>
    apiClient.delete(`/notes/${id}/permanent`),
  addTag: (id: string, tagId: string): Promise<Note> =>
    apiClient.post(`/notes/${id}/tags`, { tagId }).then((r) => r.data.data || r.data),
  removeTag: (id: string, tagId: string): Promise<Note> =>
    apiClient.delete(`/notes/${id}/tags/${tagId}`).then((r) => r.data.data || r.data),
};
