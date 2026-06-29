import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { micro, microTransition } from '@/lib/animations';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    const duration = 800;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

const sparklineData = Array.from({ length: 8 }, (_, i) => ({
  v: 10 + Math.sin(i * 0.8) * 20 + Math.random() * 15,
}));

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  gradient: string;
  color: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, gradient, color, delay = 0 }: Props) {
  const isNumber = typeof value === 'number';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={micro.cardHover}
      className="bg-card border border-border rounded-xl p-4 relative overflow-hidden group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="h-10 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad-${label})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">
        {isNumber ? <AnimatedNumber value={value} /> : value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent group-hover:ring-primary/10 transition-all duration-300" />
    </motion.div>
  );
}
