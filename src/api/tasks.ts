import apiClient from './client';
import { Task, PagedResponse } from '../types';

function clean<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    out[k as keyof T] = v as T[keyof T];
  }
  return out;
}

export const tasksApi = {
  create: (data: Record<string, unknown>): Promise<Task> =>
    apiClient.post('/tasks', clean(data)).then((r) => r.data.data || r.data),
  list: (params?: { page?: number; size?: number; status?: string; priority?: string; parentId?: string }): Promise<PagedResponse<Task>> =>
    apiClient.get('/tasks', { params }).then((r) => r.data.data || r.data),
  listTrash: (params?: { page?: number; size?: number }): Promise<PagedResponse<Task>> =>
    apiClient.get('/tasks/trash', { params }).then((r) => r.data.data || r.data),
  get: (id: string): Promise<Task> =>
    apiClient.get(`/tasks/${id}`).then((r) => r.data.data || r.data),
  update: (id: string, data: Record<string, unknown>): Promise<Task> =>
    apiClient.put(`/tasks/${id}`, clean(data)).then((r) => r.data.data || r.data),
  updateStatus: (id: string, status: string): Promise<Task> =>
    apiClient.patch(`/tasks/${id}/status`, { status }).then((r) => r.data.data || r.data),
  reorder: (items: { id: string; position: number }[]) =>
    apiClient.patch('/tasks/reorder', { items }),
  softDelete: (id: string): Promise<Task> =>
    apiClient.delete(`/tasks/${id}`).then((r) => r.data.data || r.data),
  restore: (id: string): Promise<Task> =>
    apiClient.patch(`/tasks/${id}/restore`).then((r) => r.data.data || r.data),
  hardDelete: (id: string) =>
    apiClient.delete(`/tasks/${id}/permanent`),
};
