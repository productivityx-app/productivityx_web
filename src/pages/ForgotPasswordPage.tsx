import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import AuthLayout from '../components/auth/AuthLayout';
import AnimatedButton from '@/components/design-system/AnimatedButton';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success(t('auth.forgotPassword.resetSent'));
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth.forgotPassword.failedToSend'));
    }
  };

  if (sent) {
    return (
      <AuthLayout title={t('auth.forgotPassword.title')} subtitle="">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
            <CheckCircle size={48} className="text-green-500 mx-auto" />
          </motion.div>
          <p className="text-sm text-muted-foreground">{t('auth.forgotPassword.checkEmail')}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-primary hover:underline transition-colors"
          >
            {t('auth.forgotPassword.backToLogin')}
          </button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            {...register('email')}
            className={`w-full px-3 py-2.5 rounded-xl text-sm bg-accent/30 border transition-all duration-200 text-foreground placeholder:text-muted-foreground/30 outline-none ${
              errors.email
                ? 'border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                : 'border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20'
            }`}
          />
          {errors.email && (
            <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">{errors.email.message}</p>
          )}
        </div>
        <AnimatedButton
          type="submit"
          loading={isSubmitting}
          className="w-full"
        >
          {t('auth.forgotPassword.sendResetLink')}
        </AnimatedButton>
      </form>

      <div className="text-center mt-6">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={12} />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
}
