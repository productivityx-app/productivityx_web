import { useMemo } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';

function getStoredFormat(): '12h' | '24h' {
  if (typeof window === 'undefined') return '24h';
  return (localStorage.getItem('px-time-format') as '12h' | '24h') || '24h';
}

function getStoredWeekStartsOn(): 0 | 1 | 6 {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem('px-week-starts-on');
  if (val === '1') return 1;
  if (val === '6') return 6;
  return 0;
}

export function useTimeFormat() {
  const profile = useAuthStore((s) => s.profile);

  return useMemo(() => {
    const timeFormat = getStoredFormat();
    const use24Hour = timeFormat === '24h';
    const weekStartsOn = getStoredWeekStartsOn();

    const formatTime = (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      return use24Hour ? format(d, 'HH:mm') : format(d, 'h:mm a');
    };

    const formatTimeShort = (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      return use24Hour ? format(d, 'HH:mm') : format(d, 'h:mm a');
    };

    const formatDateTime = (date: Date | string | number) => {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      return use24Hour ? format(d, 'MMM d, yyyy HH:mm') : format(d, 'MMM d, yyyy h:mm a');
    };

    const formatHour = (hour24: number): string => {
      if (use24Hour) return hour24.toString().padStart(2, '0');
      const h = hour24 % 12 || 12;
      return h.toString();
    };

    const formatAmPm = (hour24: number): string => {
      if (use24Hour) return '';
      return hour24 >= 12 ? 'PM' : 'AM';
    };

    const to12Hour = (hour24: number): { hour: number; amPm: 'AM' | 'PM' } => ({
      hour: hour24 % 12 || 12,
      amPm: hour24 >= 12 ? 'PM' : 'AM',
    });

    const to24Hour = (hour: number, amPm: 'AM' | 'PM'): number => {
      if (amPm === 'PM' && hour !== 12) return hour + 12;
      if (amPm === 'AM' && hour === 12) return 0;
      return hour;
    };

    return {
      use24Hour,
      timeFormat,
      weekStartsOn,
      formatTime,
      formatTimeShort,
      formatDateTime,
      formatHour,
      formatAmPm,
      to12Hour,
      to24Hour,
    };
  }, [profile?.timezone]);
}

export type TimeFormatHelpers = ReturnType<typeof useTimeFormat>;
