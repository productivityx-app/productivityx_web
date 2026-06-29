import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import AuthLayout from '../components/auth/AuthLayout';
import AnimatedButton from '@/components/design-system/AnimatedButton';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const { login, setAccessToken } = useAuthStore();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    if (!email) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, email]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    data.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const nextIndex = Math.min(data.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { toast.error(t('auth.verifyOtp.invalidOtp')); return; }
    setSubmitting(true);
    try {
      const authRes = await authApi.verifyOtp({ email, otp: otpStr });
      toast.success(t('auth.verifyOtp.verified'));
      setAccessToken(authRes.accessToken);
      const userData = await authApi.me();
      login({ accessToken: authRes.accessToken, user: userData });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth.verifyOtp.invalidOtp'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (!email) { toast.error(t('auth.verifyOtp.emailFirst')); return; }
    setResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success(t('auth.verifyOtp.resentSuccess'));
      setCountdown(60);
      setCanResend(false);
    } catch {
      toast.error(t('auth.verifyOtp.failedToResend'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title={t('auth.verifyOtp.title')} subtitle={t('auth.verifyOtp.subtitle')}>
      {email && (
        <p className="flex items-center justify-center gap-1 text-sm font-medium text-foreground mb-4 -mt-2">
          <Mail size={12} />
          {email}
        </p>
      )}

      {!email && (
        <div className="mb-4">
          <input
            type="email"
            placeholder={t('auth.verifyOtp.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-accent/30 border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/30 outline-none transition-all"
          />
        </div>
      )}

      <div className="space-y-6">
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 h-12 text-center text-lg font-bold rounded-xl bg-accent/30 border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-foreground outline-none transition-all"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <AnimatedButton
          onClick={onSubmit}
          loading={submitting}
          disabled={otp.join('').length !== 6}
          className="w-full"
        >
          {t('auth.verifyOtp.verifyButton')}
        </AnimatedButton>
      </div>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={resendOtp}
          disabled={resending || !canResend}
          className="text-xs text-primary hover:underline disabled:opacity-40 disabled:no-underline transition-colors"
        >
          {resending
            ? t('auth.verifyOtp.resending')
            : canResend
              ? t('auth.verifyOtp.resendOtp')
              : `${t('auth.verifyOtp.resendIn')} ${countdown}s`
          }
        </button>
      </div>
    </AuthLayout>
  );
}
