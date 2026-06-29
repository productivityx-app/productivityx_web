import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import AuthLayout from '../components/auth/AuthLayout';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!token) return;
    setStatus('loading');
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout title="" subtitle="">
      <div className="text-center py-4">
        {!token ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl">
              <Zap size={22} className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{t('auth.verifyEmail.checkEmail')}</h1>
            <p className="text-sm text-muted-foreground">{t('auth.verifyEmail.checkEmailDesc')}</p>
            <Link to="/login" className="inline-block text-sm text-primary hover:underline mt-4">{t('auth.verifyEmail.backToLogin')}</Link>
          </motion.div>
        ) : status === 'loading' ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">{t('auth.verifyEmail.verifying')}</p>
          </div>
        ) : status === 'success' ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle size={48} className="text-green-500 mx-auto" />
            </motion.div>
            <h1 className="text-xl font-bold text-foreground">{t('auth.verifyEmail.emailVerified')}</h1>
            <Link to="/login" className="inline-block text-sm text-primary hover:underline">{t('auth.verifyEmail.signInNow')}</Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <XCircle size={48} className="text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">{t('auth.verifyEmail.verificationFailed')}</h1>
            <p className="text-sm text-muted-foreground">{t('auth.verifyEmail.verificationFailedDesc')}</p>
            <Link to="/login" className="inline-block text-sm text-primary hover:underline">{t('auth.verifyEmail.backToLogin')}</Link>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
