import apiClient from './client';
import { DeltaSyncResponse } from '../types';

export const syncApi = {
  delta: (since: string, cursor?: string, limit = 100): Promise<DeltaSyncResponse> =>
    apiClient.get('/sync/delta', { params: { since, cursor, limit } }).then((r) => r.data.data || r.data),
};
