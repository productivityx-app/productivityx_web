import apiClient from './client';
import { Profile, UserPreferences } from '../types';

export const profileApi = {
  get: (): Promise<Profile> =>
    apiClient.get('/profile').then((r) => r.data.data || r.data),
  update: (data: Partial<Profile>) =>
    apiClient.put('/profile', data).then((r) => r.data.data || r.data),
  updateAvatar: (avatarUrl: string) =>
    apiClient.patch('/profile/avatar', { avatarUrl }).then((r) => r.data.data || r.data),
};

export const preferencesApi = {
  get: (): Promise<UserPreferences> =>
    apiClient.get('/preferences').then((r) => r.data.data || r.data),
  update: (data: Partial<UserPreferences>) =>
    apiClient.put('/preferences', data).then((r) => r.data.data || r.data),
};
