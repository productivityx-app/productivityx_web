import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, AlertTriangle, CalendarDays, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { usePomodoroStore } from '@/stores/pomodoroStore';
import { notesApi } from '@/api/notes';
import { tasksApi } from '@/api/tasks';
import { eventsApi } from '@/api/events';
import { pomodoroApi } from '@/api/pomodoro';
import { startOfDay, endOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ErrorState from '@/components/common/ErrorState';
import { stagger, scroll, scrollViewport } from '@/lib/animations';

import HeroSection from '@/components/dashboard/HeroSection';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentNotes from '@/components/dashboard/RecentNotes';
import TasksWidget from '@/components/dashboard/TasksWidget';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import PomodoroWidget from '@/components/dashboard/PomodoroWidget';
import AISuggestionCard from '@/components/dashboard/AISuggestionCard';

export default function DashboardPage() {
  useEffect(() => { document.title = 'Dashboard — ProductivityX'; }, []);
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { activeSession } = usePomodoroStore();
  const { t } = useTranslation();

  const { data: notesData, isError: notesError, refetch: notesRefetch } = useQuery({
    queryKey: ['notes-recent'], queryFn: () => notesApi.list({ size: 5 }), retry: 1,
  });
  const { data: tasksData, isError: tasksError, refetch: tasksRefetch } = useQuery({
    queryKey: ['tasks-all'], queryFn: () => tasksApi.list({ size: 100 }), retry: 1,
  });
  const { data: eventsData, isError: eventsError, refetch: eventsRefetch } = useQuery({
    queryKey: ['events-today'],
    queryFn: () => eventsApi.list({ from: startOfDay(new Date()).toISOString(), to: endOfDay(new Date()).toISOString() }),
    retry: 1,
  });
  const { data: pomStats, isError: pomError, refetch: pomRefetch } = useQuery({
    queryKey: ['pom-stats'], queryFn: pomodoroApi.getTodayStats, retry: 1,
  });

  const tasks = tasksData?.content || [];
  const today = new Date();
  const tasksDueToday = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'DONE').length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE' && t.status !== 'CANCELLED').length;
  const todayEvents = Array.isArray(eventsData) ? eventsData : [];
  const notes = notesData?.content || [];
  const totalFocusMinutes = pomStats?.totalFocusMinutesToday ?? 0;
  const completedSessions = pomStats?.completedFocusSessionsToday ?? 0;

  const hasError = notesError || tasksError || eventsError || pomError;
  const retryAll = () => { notesRefetch(); tasksRefetch(); eventsRefetch(); pomRefetch(); };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {hasError && (
        <div className="mb-4">
          <ErrorState message={t('dashboard.errorMessage')} onRetry={retryAll} />
        </div>
      )}

      <HeroSection />

      <QuickActions />

      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div variants={stagger.item}>
          <StatCard
            icon={CheckSquare}
            label={t('dashboard.tasksDueToday')}
            value={tasksError ? 0 : tasksDueToday}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
            color="#6366f1"
            delay={0}
          />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StatCard
            icon={AlertTriangle}
            label={t('dashboard.overdueTasks')}
            value={tasksError ? 0 : overdue}
            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
            color="#f43f5e"
            delay={0}
          />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StatCard
            icon={CalendarDays}
            label={t('dashboard.todayEvents')}
            value={eventsError ? 0 : todayEvents.length}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
            color="#8b5cf6"
            delay={0}
          />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StatCard
            icon={Timer}
            label={t('dashboard.focusMinutesToday')}
            value={pomError ? 0 : totalFocusMinutes}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            color="#10b981"
            delay={0}
          />
        </motion.div>
      </motion.div>

      <motion.div
        variants={scroll.fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={scrollViewport}
        className="grid lg:grid-cols-2 gap-4 sm:gap-6"
      >
        <RecentNotes notes={notes} />
        <TasksWidget tasks={tasks} />
      </motion.div>

      <motion.div
        variants={scroll.fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={scrollViewport}
        className="grid lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="lg:col-span-1">
          <CalendarWidget events={todayEvents} />
        </div>
        <div className="lg:col-span-1">
          <PomodoroWidget totalFocusMinutesToday={totalFocusMinutes} completedSessionsToday={completedSessions} />
        </div>
        <div className="lg:col-span-1">
          <AISuggestionCard tasksDueToday={tasksDueToday} overdue={overdue} notesCount={notes.length} />
        </div>
      </motion.div>
    </div>
  );
}

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear();
}
