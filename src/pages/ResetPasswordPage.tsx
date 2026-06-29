import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import AnimatedButton from '@/components/design-system/AnimatedButton';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.resetPassword({ token, newPassword: data.password });
      toast.success(t('auth.resetPassword.success'));
      navigate('/login');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth.resetPassword.failed'));
    }
  };

  return (
    <AuthLayout title={t('auth.resetPassword.title')} subtitle="">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label={t('auth.resetPassword.newPasswordLabel')}
          type={showPw ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          showPasswordToggle showPassword={showPw} onTogglePassword={() => setShowPw(!showPw)}
          {...register('password')}
        />
        <PasswordStrength password={password || ''} />
        <AuthInput
          label={t('auth.resetPassword.confirmPasswordLabel')}
          type={showConfirmPw ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          showPasswordToggle showPassword={showConfirmPw} onTogglePassword={() => setShowConfirmPw(!showConfirmPw)}
          {...register('confirmPassword')}
        />
        <AnimatedButton
          type="submit"
          loading={isSubmitting}
          disabled={!token}
          className="w-full"
        >
          {t('auth.resetPassword.resetButton')}
        </AnimatedButton>
      </form>

      <div className="text-center mt-6">
        <a onClick={() => navigate('/login')} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ArrowLeft size={12} />
          {t('auth.resetPassword.backToLogin')}
        </a>
      </div>
    </AuthLayout>
  );
}
