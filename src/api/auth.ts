import apiClient from './client';
import { AuthResponse, UserResponse } from '../types';

export const authApi = {
  register: (data: { username: string; email: string; password: string; firstName: string; lastName: string; birthDate: string; phone?: string; gender?: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { identifier: string; password: string; deviceId?: string; deviceName?: string; platform?: string }): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data).then((r) => r.data.data || r.data),
  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email?token=${token}`).then((r) => r.data.data || r.data),
  /** Registration email verification OTP — returns AuthResponse, logs user in */
  verifyOtp: (data: { email: string; otp: string }): Promise<AuthResponse> =>
    apiClient.post('/auth/verify-otp', data).then((r) => r.data.data || r.data),
  /** Password-reset OTP verification — returns { resetToken } */
  verifyForgotOtp: (data: { email: string; otp: string }): Promise<{ resetToken: string }> =>
    apiClient.post('/auth/verify-forgot-otp', data).then((r) => r.data.data || r.data),
  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification', { email }),
  refresh: () =>
    apiClient.post('/auth/refresh').then((r) => r.data.data || r.data),
  logout: () =>
    apiClient.post('/auth/logout'),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    apiClient.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
  me: (): Promise<UserResponse> =>
    apiClient.get('/auth/me').then((r) => r.data.data || r.data),
  deleteAccount: (password: string) =>
    apiClient.delete('/auth/account', { data: { password } }),
};
