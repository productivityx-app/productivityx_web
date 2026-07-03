import { useEffect, useRef } from 'react';
import { SoundType } from '@/components/pomodoro/SoundSelector';

const SOUND_MAP: Record<string, string> = {
  rain: '/sounds/rain.mp3',
  coffee: '/sounds/coffee.mp3',
  whiteNoise: '/sounds/white-noise.mp3',
  loFi: '/sounds/nature.mp3',
};

export function useBackgroundSound(sound: SoundType, volume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const src = SOUND_MAP[sound];
    if (!src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume / 100;
    audio.play().catch(() => {});
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [sound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
}
