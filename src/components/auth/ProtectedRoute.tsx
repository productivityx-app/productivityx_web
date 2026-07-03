import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import { Loader2 } from 'lucide-react';
import i18n from '../../i18n/config';

export default function ProtectedRoute() {
  const { isAuthenticated, accessToken, login, setLoading, isLoading, profile } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (profile?.language) { i18n.changeLanguage(profile.language.toLowerCase()); }
  }, [profile]);

  useEffect(() => {
    async function checkAuth() {
      if (!accessToken) { setLoading(false); setChecked(true); return; }
      if (isAuthenticated) { setLoading(false); setChecked(true); return; }
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
      }
    }
    checkAuth();
  }, []);

  if (!checked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
