const rawApi = import.meta.env.VITE_API_URL;
const devFallback = import.meta.env.DEV ? '/api/v1' : 'https://productivityx-backend.onrender.com/api/v1';

export const API_BASE_URL = rawApi || devFallback;

export const OAUTH_BASE_URL = (() => {
  const apiUrl = rawApi || devFallback;
  return apiUrl.startsWith('http')
    ? apiUrl.replace('/api/v1', '')
    : 'https://productivityx-backend.onrender.com';
})();
