import apiClient from './client';
import { SearchResponse } from '../types';

export const searchApi = {
  search: (query: string, types?: string, limit = 20): Promise<SearchResponse> =>
    apiClient.get('/search', { params: { q: query, types, limit } }).then((r) => r.data.data || r.data),
};
