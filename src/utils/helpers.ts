import { AxiosError } from 'axios';

export function extractApiError(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>;
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.error && typeof data.error === 'string') return data.error;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}
