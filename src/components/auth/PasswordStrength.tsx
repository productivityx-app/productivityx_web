import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  password: string;
}

function getStrength(pw: string): { score: number; label: string; color: string; bg: string } {
  if (!pw) return { score: 0, label: '', color: '', bg: 'bg-accent/30' };

  let score = 0;
  if (pw.length >= 8) score += 25;
  if (pw.length >= 12) score += 10;
  if (/[A-Z]/.test(pw)) score += 20;
  if (/[a-z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 15;

  if (score < 30) return { score, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
  if (score < 60) return { score, label: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500' };
  if (score < 80) return { score, label: 'Good', color: 'text-yellow-500', bg: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'text-green-500', bg: 'bg-green-500' };
}

export default function PasswordStrength({ password }: Props) {
  const { score, label, color, bg } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1 rounded-full flex-1 transition-all duration-300',
              score >= segment * 25 ? bg : 'bg-accent/30',
            )}
          />
        ))}
      </div>
      <p className={cn('text-[10px] font-medium', color)}>{label}</p>
    </motion.div>
  );
}
