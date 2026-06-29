/*
 * ── Auth flow request/response sequences ──
 *
 * 1. REGISTER
 *    POST /auth/register  ←  { email, username, password, firstName, lastName, birthDate, phone?, gender? }
 *    → 201 (no body / success message). Navigates to /verify-otp?email=...
 *
 * 2. REGISTRATION EMAIL VERIFICATION (OTP)
 *    POST /auth/verify-otp  ←  { email, otp: "123456" }
 *    → AuthResponse { accessToken, tokenType, expiresIn }. Logs user in, navigates to /.
 *    Re-send: POST /auth/resend-verification  ←  { email }
 *
 * 3. MAGIC-LINK VERIFICATION (verify-email)
 *    GET /auth/verify-email?token=xxx
 *    → AuthResponse. Logs user in, navigates to /.
 *
 * 4. LOGIN
 *    POST /auth/login  ←  { identifier, password, deviceId?, deviceName?, platform? }
 *    → AuthResponse { accessToken, tokenType, expiresIn } + refreshToken HttpOnly cookie.
 *    On 403/EMAIL_NOT_VERIFIED → redirect to /verify-otp?email=...
 *
 * 5. FORGOT PASSWORD
 *    POST /auth/forgot-password  ←  { email }
 *    → 200 (always — no existence leak). Navigates to /verify-reset-otp?email=...
 *
 * 6. PASSWORD-RESET OTP
 *    POST /auth/verify-forgot-otp  ←  { email, otp: "123456" }
 *    → { resetToken: "uuid" }. Navigates to /reset-password?token=<resetToken>
 *    (Re-send triggers forgot-password again — no dedicated resend endpoint.)
 *
 * 7. RESET PASSWORD
 *    POST /auth/reset-password  ←  { token: <resetToken-or-link-token>, newPassword }
 *    → 200. Navigates to /login.
 *    confirmPassword is frontend-only validation — never sent.
 *
 * 8. CHANGE PASSWORD (authenticated)
 *    POST /auth/change-password  ←  { currentPassword, newPassword }
 *    → 200.
 *
 * 9. TOKEN REFRESH
 *    POST /auth/refresh  ←  (reads refreshToken from HttpOnly cookie)
 *    → AuthResponse. Interceptor handles queue + retry transparently.
 *
 * 10. LOGOUT
 *     POST /auth/logout  → clears server-side refresh token.
 *
 * All endpoints return ApiResponse<T>: { success, data: T, message, errorCode, timestamp }.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ToastContainer from '@/components/design-system/ToastContainer';
import OfflineBanner from '@/components/design-system/OfflineBanner';
import ScrollToTop from '@/components/design-system/ScrollToTop';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { useTheme } from '@/hooks/useTheme';
import { useSync } from '@/hooks/useSync';
import { useOnboardingStore } from '@/stores/onboardingStore';
import i18n from './i18n/config';
import { useEffect } from 'react';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const VerifyOtpPage = lazy(() => import('@/pages/VerifyOtpPage'));
const VerifyResetOtpPage = lazy(() => import('@/pages/VerifyResetOtpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteDetailPage = lazy(() => import('@/pages/NoteDetailPage'));
const TrashNotesPage = lazy(() => import('@/pages/TrashNotesPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const TaskDetailPage = lazy(() => import('@/pages/TaskDetailPage'));
const TrashTasksPage = lazy(() => import('@/pages/TrashTasksPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const TrashCalendarPage = lazy(() => import('@/pages/TrashCalendarPage'));
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const PomodoroPage = lazy(() => import('@/pages/PomodoroPage'));
const PomodoroHistoryPage = lazy(() => import('@/pages/PomodoroHistoryPage'));
const AIPage = lazy(() => import('@/pages/AIPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppHooks() {
  useTheme();
  useSync();
  const { onboardingComplete, startOnboarding } = useOnboardingStore();

  useEffect(() => {
    const updateDir = (lng: string) => { document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'; };
    updateDir(i18n.language);
    i18n.on('languageChanged', updateDir);
    return () => { i18n.off('languageChanged', updateDir); };
  }, []);

  useEffect(() => {
    const shown = sessionStorage.getItem('px-onboarding-shown');
    if (!onboardingComplete && !shown) {
      sessionStorage.setItem('px-onboarding-shown', 'true');
      const timer = setTimeout(() => startOnboarding(), 800);
      return () => clearTimeout(timer);
    }
  }, [onboardingComplete, startOnboarding]);

  return null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading page">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <MotionProvider>
      <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={base}>
        <div id="app-announcements" className="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
        <ErrorBoundary>
        <AppHooks />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/notes/trash" element={<TrashNotesPage />} />
                <Route path="/notes/new" element={<NoteDetailPage />} />
                <Route path="/notes/:id" element={<NoteDetailPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/trash" element={<TrashTasksPage />} />
                <Route path="/tasks/new" element={<TaskDetailPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/calendar/trash" element={<TrashCalendarPage />} />
                <Route path="/calendar/events/:id" element={<EventDetailPage />} />
                <Route path="/pomodoro" element={<PomodoroPage />} />
                <Route path="/pomodoro/history" element={<PomodoroHistoryPage />} />
                <Route path="/ai" element={<AIPage />} />
                <Route path="/ai/conversations/:id" element={<AIPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <OnboardingFlow />
        <Toaster position="bottom-right" richColors />
        <ToastContainer />
        <OfflineBanner />
        <ScrollToTop />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
    </MotionProvider>
  );
}
