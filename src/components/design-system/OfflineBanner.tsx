import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineBannerProps {
  className?: string;
}

export default function OfflineBanner({ className }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
      setWasOffline(false);
    };
    const onOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed top-0 left-0 right-0 z-[60] px-4 py-2 text-xs font-medium text-center transition-all duration-500',
        showReconnected
          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-b border-green-500/20'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b border-amber-500/20',
        className,
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {showReconnected ? (
          <>
            <CheckCircle2 size={14} />
            <span>Back online — changes are being synced</span>
          </>
        ) : (
          <>
            <WifiOff size={14} />
            <span>You're offline — changes will be saved when you reconnect</span>
          </>
        )}
      </div>
    </div>
  );
}
