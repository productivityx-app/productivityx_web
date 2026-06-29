import apiClient from './client';
import { DeviceResponse } from '../types';

export const devicesApi = {
  list: (): Promise<DeviceResponse[]> =>
    apiClient.get('/devices').then((r) => r.data.data || r.data),
  revoke: (deviceId: string) =>
    apiClient.delete(`/devices/${deviceId}`),
  updatePushToken: (deviceId: string, pushToken: string) =>
    apiClient.patch(`/devices/${deviceId}/push-token`, { pushToken }),
};
