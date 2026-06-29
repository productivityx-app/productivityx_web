import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Timer } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { pomodoroApi } from '../api/pomodoro';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '../i18n/dateLocales';
import LoadingSkeleton from '@/components/design-system/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '@/components/design-system/EmptyState';
import PomodoroStats from '../components/pomodoro/PomodoroStats';
import WeeklyHeatmap from '../components/pomodoro/WeeklyHeatmap';
import AchievementGrid from '../components/pomodoro/AchievementGrid';
import SessionLog from '../components/pomodoro/SessionLog';

const PIE_COLORS = ['#EF4444', '#22C55E', '#3B82F6'];

export default function PomodoroHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['pom-stats-today'],
    queryFn: pomodoroApi.getTodayStats,
  });
  const { data: sessionsData, isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useQuery({
    queryKey: ['pom-sessions'],
    queryFn: () => pomodoroApi.list({ size: 100 }),
  });

  const sessions = sessionsData?.content || [];
  const isLoading = statsLoading || sessionsLoading;
  const isError = (statsError || sessionsError) && !isLoading;

  // Weekly trend data (7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const label = format(d, 'EEE', { locale: getDateFnsLocale() });
    const daySessions = sessions.filter(
      (s) => s.type === 'FOCUS' && s.completed && format(new Date(s.startedAt), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'),
    );
    const minutes = daySessions.reduce((acc, s) => acc + (s.actualMinutes || Math.floor(s.plannedDurationSeconds / 60)), 0);
    return { label, minutes };
  });

  // Donut chart data by session type
  const focusCount = sessions.filter((s) => s.type === 'FOCUS').length;
  const shortBreakCount = sessions.filter((s) => s.type === 'SHORT_BREAK').length;
  const longBreakCount = sessions.filter((s) => s.type === 'LONG_BREAK').length;
  const pieData = [
    { name: t('pomodoro.focus'), value: focusCount },
    { name: t('pomodoro.shortBreak'), value: shortBreakCount },
    { name: t('pomodoro.longBreak'), value: longBreakCount },
  ].filter((d) => d.value > 0);

  // Heatmap data from sessions
  const heatmapData = sessions
    .filter((s) => s.type === 'FOCUS' && s.completed)
    .reduce<Record<string, number>>((acc, s) => {
      const date = format(new Date(s.startedAt), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  const heatmapArray = Object.entries(heatmapData).map(([date, count]) => ({ date, count }));

  // Stats for PomodoroStats component
  const totalFocusSessions = sessions.filter((s) => s.type === 'FOCUS' && s.completed).length;
  const totalFocusMs = sessions
    .filter((s) => s.type === 'FOCUS')
    .reduce((acc, s) => acc + (s.actualDurationSeconds || s.plannedDurationSeconds) * 1000, 0);
  const completionRate = sessions.filter((s) => s.type === 'FOCUS').length > 0
    ? (sessions.filter((s) => s.type === 'FOCUS' && s.completed).length / sessions.filter((s) => s.type === 'FOCUS').length) * 100
    : 0;
  const currentStreak = (() => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = format(d, 'yyyy-MM-dd');
      if (heatmapData[key]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  })();

  // Achievements
  const achievements = [
    { id: 'first', key: 'pomodoro.achievementFirst', icon: 'trophy' as const, unlocked: totalFocusSessions >= 1 },
    { id: 'streak3', key: 'pomodoro.achievementStreak3', icon: 'flame' as const, unlocked: currentStreak >= 3, progress: Math.min(currentStreak, 3), maxProgress: 3 },
    { id: 'streak7', key: 'pomodoro.achievementStreak7', icon: 'flame' as const, unlocked: currentStreak >= 7, progress: Math.min(currentStreak, 7), maxProgress: 7 },
    { id: 'streak30', key: 'pomodoro.achievementStreak30', icon: 'flame' as const, unlocked: currentStreak >= 30, progress: Math.min(currentStreak, 30), maxProgress: 30 },
    { id: 'sessions10', key: 'pomodoro.achievementSessions10', icon: 'target' as const, unlocked: totalFocusSessions >= 10, progress: Math.min(totalFocusSessions, 10), maxProgress: 10 },
    { id: 'sessions50', key: 'pomodoro.achievementSessions50', icon: 'target' as const, unlocked: totalFocusSessions >= 50, progress: Math.min(totalFocusSessions, 50), maxProgress: 50 },
    { id: 'sessions100', key: 'pomodoro.achievementSessions100', icon: 'star' as const, unlocked: totalFocusSessions >= 100, progress: Math.min(totalFocusSessions, 100), maxProgress: 100 },
    { id: 'hours5', key: 'pomodoro.achievementHours5', icon: 'clock' as const, unlocked: totalFocusMs >= 5 * 3600000, progress: Math.min(totalFocusMs / 3600000, 5), maxProgress: 5 },
    { id: 'hours10', key: 'pomodoro.achievementHours10', icon: 'clock' as const, unlocked: totalFocusMs >= 10 * 3600000, progress: Math.min(totalFocusMs / 3600000, 10), maxProgress: 10 },
    { id: 'ninja', key: 'pomodoro.achievementNinja', icon: 'zap' as const, unlocked: currentStreak >= 7 && totalFocusSessions >= 50 },
  ];

  if (isError) {
    return <ErrorState onRetry={() => { refetchStats(); refetchSessions(); }} />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pomodoro')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('pomodoroHistory.title')}</h1>
      </div>

      {/* Stats cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} card />)}
        </div>
      ) : (
        <PomodoroStats stats={{ totalSessions: stats?.completedFocusSessionsToday ?? 0, totalFocusMs: (stats?.totalFocusMinutesToday ?? 0) * 60000, completionRate, currentStreak }} />
      )}

      {/* Bar chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('pomodoroHistory.focusTrend')}</h2>
          {isLoading ? (
            <LoadingSkeleton className="h-40" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" fill="url(#focusGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('pomodoroHistory.sessionBreakdown')}</h2>
          {isLoading ? (
            <LoadingSkeleton className="h-40" />
          ) : focusCount + shortBreakCount + longBreakCount === 0 ? (
            <EmptyState icon={Timer} title={t('pomodoroHistory.noSessionsYet')} description="" />
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          {isLoading ? <LoadingSkeleton className="h-32" /> : <WeeklyHeatmap data={heatmapArray} />}
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          {isLoading ? <LoadingSkeleton className="h-32" /> : <AchievementGrid achievements={achievements} />}
        </div>
      </div>

      {/* Session Log */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t('pomodoroHistory.sessionHistory')}</h2>
        {isLoading ? (
          <LoadingSkeleton className="h-48" />
        ) : sessions.length === 0 ? (
          <EmptyState icon={Timer} title={t('pomodoroHistory.noSessionsYet')} description="" />
        ) : (
          <SessionLog sessions={sessions} />
        )}
      </div>
    </div>
  );
}
