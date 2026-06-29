import { Volume2, VolumeX, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type SoundType = 'none' | 'rain' | 'coffee' | 'whiteNoise' | 'loFi';

const SOUNDS: { key: SoundType; labelKey: string; icon: string }[] = [
  { key: 'none', labelKey: 'pomodoro.soundNone', icon: '🔇' },
  { key: 'rain', labelKey: 'pomodoro.soundRain', icon: '🌧️' },
  { key: 'coffee', labelKey: 'pomodoro.soundCoffee', icon: '☕' },
  { key: 'whiteNoise', labelKey: 'pomodoro.soundWhiteNoise', icon: '🌊' },
  { key: 'loFi', labelKey: 'pomodoro.soundLoFi', icon: '🎵' },
];

interface Props {
  selected: SoundType;
  onSelect: (sound: SoundType) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
}

export default function SoundSelector({ selected, onSelect, volume, onVolumeChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Music size={12} /> {t('pomodoro.backgroundSounds')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onVolumeChange(volume === 0 ? 50 : 0)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        {SOUNDS.map((s) => (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs transition-all',
              selected === s.key ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            <span className="text-sm">{s.icon}</span>
            <span className="text-[10px]">{t(s.labelKey)}</span>
          </button>
        ))}
      </div>
      {selected !== 'none' && (
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full h-1 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary cursor-pointer"
        />
      )}
    </div>
  );
}
