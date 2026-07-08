import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import AnimatedButton from '@/components/design-system/AnimatedButton';
import { DatePicker } from '@/components/ui/date-picker';

const MIN_AGE = 13;
function isOldEnough(dateStr: string): boolean {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
  return d <= cutoff;
}

const schema = z.object({
  username: z.string().min(3, 'At least 3 characters'),
  email: z.string().email('Invalid email'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  birthDate: z.string().min(1, 'Required').refine(isOldEnough, `You must be at least ${MIN_AGE} years old`),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: undefined },
  });

  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({
        username: data.username, email: data.email, password: data.password,
        firstName: data.firstName, lastName: data.lastName, birthDate: data.birthDate,
        phone: data.phone || undefined, gender: data.gender || undefined,
      });
      toast.success(t('auth.register.accountCreated'));
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth.register.registrationFailed');
      toast.error(msg);
    }
  };

  return (
    <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label={t('auth.register.firstName')} placeholder={t('auth.register.firstNamePlaceholder')} error={errors.firstName?.message} {...register('firstName')} />
          <AuthInput label={t('auth.register.lastName')} placeholder={t('auth.register.lastNamePlaceholder')} error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <AuthInput label={t('auth.register.username')} placeholder={t('auth.register.usernamePlaceholder')} error={errors.username?.message} {...register('username')} />
        <AuthInput label={t('auth.register.email')} type="email" placeholder={t('auth.register.emailPlaceholder')} error={errors.email?.message} {...register('email')} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('auth.register.birthDate')}</label>
            <DatePicker value={watch('birthDate')} onChange={(d) => setValue('birthDate', d, { shouldValidate: true })} fromYear={1920} toYear={new Date().getFullYear()} />
            {errors.birthDate?.message && <p className="text-[11px] text-destructive">{errors.birthDate.message}</p>}
          </div>
          <AuthInput label={t('auth.register.phoneOptional')} type="tel" placeholder={t('auth.register.phonePlaceholder')} {...register('phone')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('auth.register.genderOptional')}</label>
            <Select onValueChange={(v) => setValue('gender', v as 'MALE' | 'FEMALE')}>
              <SelectTrigger className="bg-accent/30 border-border rounded-xl text-sm"><SelectValue placeholder={t('auth.register.selectGender')} /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="MALE">{t('auth.register.male')}</SelectItem>
                <SelectItem value="FEMALE">{t('auth.register.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AuthInput
          label={t('auth.register.password')}
          type={showPw ? 'text' : 'password'}
          placeholder={t('auth.register.passwordPlaceholder')}
          error={errors.password?.message}
          showPasswordToggle showPassword={showPw} onTogglePassword={() => setShowPw(!showPw)}
          {...register('password')}
        />
        <PasswordStrength password={password || ''} />
        <AuthInput
          label={t('auth.register.confirmPassword')}
          type={showConfirmPw ? 'text' : 'password'}
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          error={errors.confirmPassword?.message}
          showPasswordToggle showPassword={showConfirmPw} onTogglePassword={() => setShowConfirmPw(!showConfirmPw)}
          {...register('confirmPassword')}
        />
        <p className="text-[10px] text-muted-foreground/40 text-center">
          {t('auth.register.terms')}{' '}
          <a href="#" className="text-primary hover:underline">{t('auth.register.termsLink')}</a>{' '}
          {t('auth.register.and')}{' '}
          <a href="#" className="text-primary hover:underline">{t('auth.register.privacyLink')}</a>
        </p>
        <AnimatedButton
          type="submit"
          loading={isSubmitting}
          className="w-full"
        >
          {t('auth.register.createAccountButton')}
        </AnimatedButton>
      </form>



      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('auth.register.hasAccount')}{' '}
        <Link to="/login" className="text-primary hover:underline font-medium transition-colors">
          {t('auth.register.signIn')}
        </Link>
      </p>
    </AuthLayout>
  );
}
