import { useTranslation } from 'react-i18next';
import { Monitor, Smartphone, Laptop, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import LoadingSkeleton from '@/components/design-system/LoadingSkeleton';
import Badge from '@/components/design-system/Badge';
import { cn } from '@/lib/utils';

interface Device {
  id: string;
  deviceId: string;
  deviceName: string | null;
  platform: string | null;
  lastSeenAt: string;
  current?: boolean;
}

interface Props {
  devices: Device[];
  loading: boolean;
  onRevoke: (deviceId: string) => void;
}

const platformIcon: Record<string, React.ElementType> = {
  DESKTOP: Monitor,
  WEB: Monitor,
  LAPTOP: Laptop,
  MOBILE: Smartphone,
  TABLET: Smartphone,
  IOS: Smartphone,
  ANDROID: Smartphone,
};

export default function DeviceList({ devices, loading, onRevoke }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
            <LoadingSkeleton className="h-5 w-5" />
            <div className="flex-1 space-y-1">
              <LoadingSkeleton className="h-3.5 w-28" />
              <LoadingSkeleton className="h-3 w-36" />
            </div>
            <LoadingSkeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return <p className="text-xs text-muted-foreground/50 text-center py-8">{t('settings.noDevices')}</p>;
  }

  return (
    <div className="space-y-1.5">
      {devices.map((device) => {
        const Icon = platformIcon[device.platform || ''] || Monitor;
        return (
          <div
            key={device.id}
            className={cn(
              'flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors',
              device.current ? 'bg-primary/[0.04] border border-primary/10' : 'bg-accent/20 hover:bg-accent/30',
            )}
          >
            <Icon size={16} className="text-muted-foreground/60 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{device.deviceName || t('settings.unknownDevice')}</span>
                {device.current && (
                  <Badge color="success" size="sm">{t('settings.currentDevice')}</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/50">
                {device.platform ? t(`settings.platforms.${device.platform}`, device.platform) : ''}
                {device.platform ? ' · ' : ''}
                {t('settings.lastSeen', { time: formatDistanceToNow(new Date(device.lastSeenAt), { addSuffix: true, locale: getDateFnsLocale() }) })}
              </p>
            </div>
            {!device.current && (
              <button
                onClick={() => onRevoke(device.deviceId)}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                title={t('settings.revokeDevice')}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
