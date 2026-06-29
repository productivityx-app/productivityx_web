import apiClient from './client';
import { CalendarEvent, PagedResponse } from '../types';

export const eventsApi = {
  create: (data: Partial<CalendarEvent>): Promise<CalendarEvent> =>
    apiClient.post('/events', data).then((r) => r.data.data || r.data),
  list: (params?: { from?: string; to?: string; page?: number; size?: number }): Promise<CalendarEvent[]> =>
    apiClient.get('/events', { params }).then((r) => {
      const d = r.data.data || r.data;
      return Array.isArray(d) ? d : d.content || [];
    }),
  listTrash: (params?: { page?: number; size?: number }): Promise<PagedResponse<CalendarEvent>> =>
    apiClient.get('/events/trash', { params }).then((r) => r.data.data || r.data),
  get: (id: string): Promise<CalendarEvent> =>
    apiClient.get(`/events/${id}`).then((r) => r.data.data || r.data),
  update: (id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> =>
    apiClient.put(`/events/${id}`, data).then((r) => r.data.data || r.data),
  softDelete: (id: string) =>
    apiClient.delete(`/events/${id}`),
  restore: (id: string) =>
    apiClient.patch(`/events/${id}/restore`),
  hardDelete: (id: string) =>
    apiClient.delete(`/events/${id}/permanent`),
  deleteSeries: (id: string) =>
    apiClient.delete(`/events/${id}/series`),
};
