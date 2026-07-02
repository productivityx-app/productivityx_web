import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AnimatedButton from '@/components/design-system/AnimatedButton';

const schema = z.object({
  identifier: z.string().min(1, 'Email or username required'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

function getDeviceInfo() {
  let deviceId = localStorage.getItem('px-device-id');
  if (!deviceId) { deviceId = crypto.randomUUID(); localStorage.setItem('px-device-id', deviceId); }
  return { deviceId, deviceName: 'Web Browser', platform: 'WEB' };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setAccessToken } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const { t } = useTranslation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const deviceInfo = getDeviceInfo();
      const authRes = await authApi.login({ identifier: data.identifier, password: data.password, ...deviceInfo });
      setAccessToken(authRes.accessToken);
      const userData = await authApi.me();
      login({ accessToken: authRes.accessToken, user: userData });
      navigate('/');
    } catch (err: unknown) {
      const errResp = (err as { response?: { status?: number; data?: Record<string, unknown> } })?.response;
      const errData = errResp?.data || {};
      const errorCode = (errData.errorCode || errData.code || '') as string;
      const msg = (errData.message || t('auth.login.loginFailed')) as string;
      const isUnverified = errorCode === 'EMAIL_NOT_VERIFIED' || msg.toLowerCase().includes('verify') || errResp?.status === 403;
      if (isUnverified) {
        window.location.href = `/verify-otp?email=${encodeURIComponent(data.identifier.includes('@') ? data.identifier : '')}`;
        return;
      }
      toast.error(msg);
    }
  };

  return (
    <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label={t('auth.login.emailLabel')}
          placeholder={t('auth.login.emailPlaceholder')}
          error={errors.identifier?.message}
          {...register('identifier')}
          data-testid="input-identifier"
        />
        <AuthInput
          label={t('auth.login.passwordLabel')}
          type={showPw ? 'text' : 'password'}
          placeholder={t('auth.login.passwordPlaceholder')}
          error={errors.password?.message}
          showPasswordToggle
          showPassword={showPw}
          onTogglePassword={() => setShowPw(!showPw)}
          {...register('password')}
          data-testid="input-password"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <input type="checkbox" className="rounded border-border" />
            {t('auth.login.rememberMe')}
          </label>
          <Link to="/forgot-password" className="text-xs text-primary hover:underline transition-colors">
            {t('auth.login.forgotPassword')}
          </Link>
        </div>
        <AnimatedButton
          type="submit"
          loading={isSubmitting}
          className="w-full"
          data-testid="button-submit"
        >
          {t('auth.login.signInButton')}
        </AnimatedButton>
      </form>



      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="text-primary hover:underline font-medium transition-colors">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  );
}
