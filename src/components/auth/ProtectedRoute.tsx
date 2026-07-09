import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import { Loader2 } from 'lucide-react';
import i18n from '../../i18n/config';

export default function ProtectedRoute() {
  const { isAuthenticated, accessToken, login, setLoading, isLoading, profile } = useAuthStore();
  const [checked, setChecked] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (profile?.language) { i18n.changeLanguage(profile.language.toLowerCase()); }
  }, [profile]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!checked) {
        setTimedOut(true);
        setLoading(false);
        setChecked(true);
      }
    }, 25_000);

    async function checkAuth() {
      if (!accessToken) { setLoading(false); setChecked(true); clearTimeout(fallbackTimer); return; }
      if (isAuthenticated) { setLoading(false); setChecked(true); clearTimeout(fallbackTimer); return; }
      setLoading(true);
      try {
        const userData = await authApi.me();
        login({ accessToken, user: userData });
        if (userData.language) { i18n.changeLanguage(userData.language.toLowerCase()); }
      } catch {
        useAuthStore.getState().logout();
      } finally {
        setLoading(false);
        setChecked(true);
        clearTimeout(fallbackTimer);
      }
    }
    checkAuth();

    return () => clearTimeout(fallbackTimer);
  }, []);

  if (!checked || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        {timedOut && <p className="text-muted-foreground text-sm">Connection lost. Redirecting to login...</p>}
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
