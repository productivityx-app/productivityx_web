import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, FileText, CheckSquare, CalendarDays, Timer, BrainCircuit,
  Sun, Moon, Monitor, User, Globe, Hash, Layout, Palette, ArrowRight,
  Lightbulb, Zap, BookOpen, ListTodo, Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { cn } from '@/lib/utils';
import OnboardingStep from './OnboardingStep';

const STEPS = [
  { title: 'Welcome', subtitle: 'Let\'s get you set up' },
  { title: 'Your Profile', subtitle: 'Help us personalize your experience' },
  { title: 'Preferences', subtitle: 'Configure your workspace' },
  { title: 'Quick Tour', subtitle: 'See what you can do' },
  { title: 'First Action', subtitle: 'Take your first step' },
];

const features = [
  { icon: FileText, label: 'Notes', desc: 'Capture thoughts, ideas, and meeting notes', color: 'from-violet-500/20 to-primary/20', path: '/notes' },
  { icon: CheckSquare, label: 'Tasks', desc: 'Stay on top of your to-do list', color: 'from-emerald-500/20 to-primary/20', path: '/tasks' },
  { icon: CalendarDays, label: 'Calendar', desc: 'Schedule and manage your events', color: 'from-blue-500/20 to-primary/20', path: '/calendar' },
  { icon: Timer, label: 'Pomodoro', desc: 'Focus with timed work sessions', color: 'from-rose-500/20 to-amber-500/20', path: '/pomodoro' },
  { icon: BrainCircuit, label: 'AI Assistant', desc: 'Chat, generate, and automate', color: 'from-primary/20 to-transparent', path: '/ai' },
];

const timezones = Intl.supportedValuesOf?.('timeZone') || [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata',
  'Australia/Sydney', 'Pacific/Auckland', 'Africa/Casablanca', 'Africa/Cairo',
];

const tipItems = [
  { icon: Zap, label: 'Keyboard Shortcuts', desc: 'Press Ctrl+K to open the command palette from anywhere' },
  { icon: Lightbulb, label: 'Smart Suggestions', desc: 'AI suggests relevant notes and tasks based on your activity' },
  { icon: Layout, label: 'Customizable Views', desc: 'Switch between grid, list, and board views for notes and tasks' },
  { icon: BookOpen, label: 'Rich Notes', desc: 'Write with markdown, add tags, pin important notes' },
];

const themeOptions = [
  { value: 'DARK', icon: Moon, label: 'Dark' },
  { value: 'LIGHT', icon: Sun, label: 'Light' },
  { value: 'SYSTEM', icon: Monitor, label: 'System' },
] as const;

const defaultViews = [
  { key: 'defaultTaskView', label: 'Task View', options: ['LIST', 'KANBAN', 'CALENDAR'] },
  { key: 'defaultCalendarView', label: 'Calendar View', options: ['MONTH', 'WEEK', 'DAY', 'AGENDA'] },
];

export default function OnboardingFlow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, preferences, updateProfile, updatePreferences } = useAuthStore();
  const { showOnboarding, currentStep, startOnboarding, nextStep, prevStep, skipOnboarding, completeOnboarding, closeOnboarding, goToStep } = useOnboardingStore();

  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [timezone, setTimezone] = useState(profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [theme, setTheme] = useState<'DARK' | 'LIGHT' | 'SYSTEM'>((profile?.theme as any) || 'DARK');
  const [taskView, setTaskView] = useState(preferences?.defaultTaskView || 'LIST');
  const [calView, setCalView] = useState(preferences?.defaultCalendarView || 'MONTH');
  const [tourStep, setTourStep] = useState(0);

  if (!showOnboarding) return null;

  const handleComplete = () => {
    if (firstName && lastName && profile) {
      updateProfile({ ...profile, firstName, lastName, timezone, theme: theme as any });
    }
    completeOnboarding();
  };

  const handleNext = () => {
    if (currentStep === 0) {
      nextStep();
    } else if (currentStep === 1) {
      nextStep();
    } else if (currentStep === 2) {
      nextStep();
    } else if (currentStep === 3) {
      if (tourStep < tipItems.length - 1) {
        setTourStep((s) => s + 1);
      } else {
        setTourStep(0);
        nextStep();
      }
    } else if (currentStep === 4) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 3 && tourStep > 0) {
      setTourStep((s) => s - 1);
    } else {
      setTourStep(0);
      prevStep();
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  const canGoNext = currentStep === 1 ? firstName.trim().length > 0 : true;

  const firstActionChoices = [
    {
      icon: FileText,
      label: 'Create your first note',
      desc: 'Start writing your thoughts and ideas',
      color: 'from-violet-500/20 to-primary/20',
      onClick: () => { handleComplete(); navigate('/notes/new'); },
    },
    {
      icon: CheckSquare,
      label: 'Add a task',
      desc: 'Plan your work and stay organized',
      color: 'from-emerald-500/20 to-primary/20',
      onClick: () => { handleComplete(); navigate('/tasks/new'); },
    },
    {
      icon: BrainCircuit,
      label: 'Explore AI',
      desc: 'Chat with your AI assistant',
      color: 'from-primary/20 to-transparent',
      onClick: () => { handleComplete(); navigate('/ai'); },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnboarding}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <OnboardingStep
              key="step-0"
              step={0}
              totalSteps={5}
              title="Welcome to ProductivityX"
              subtitle="Your all-in-one productivity workspace. Let's get you set up in less than a minute."
              onNext={handleNext}
              onSkip={handleSkip}
              hideBack
            >
              <div className="flex items-center justify-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-violet-500/20 flex items-center justify-center relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: 'conic-gradient(from 0deg, hsl(var(--primary)), transparent, hsl(var(--primary)), transparent, hsl(var(--primary)))',
                      animation: 'spin 4s linear infinite',
                    }}
                  />
                  <Sparkles size={40} className="text-primary relative z-10" />
                </motion.div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Zap, label: 'Fast', desc: 'Lightning quick' },
                  { icon: Layout, label: 'Flexible', desc: 'Your way' },
                  { icon: BrainCircuit, label: 'Smart', desc: 'AI-powered' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex flex-col items-center p-3 rounded-xl bg-muted/30 border border-border/50">
                    <Icon size={18} className="text-primary mb-1" />
                    <span className="text-xs font-semibold text-foreground">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </OnboardingStep>
          )}

          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <OnboardingStep
              key="step-1"
              step={1}
              totalSteps={5}
              title="Tell us about yourself"
              subtitle="This helps us personalize your experience across the app."
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              canGoNext={canGoNext}
            >
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/20 flex items-center justify-center">
                    {firstName || lastName ? (
                      <span className="text-xl font-bold text-primary">
                        {(firstName?.[0] || '')}{(lastName?.[0] || '')}
                      </span>
                    ) : (
                      <User size={28} className="text-primary/40" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">First name</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full bg-accent/30 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Last name</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-accent/30 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-accent/30 border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors appearance-none"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </OnboardingStep>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <OnboardingStep
              key="step-2"
              step={2}
              totalSteps={5}
              title="Choose your preferences"
              subtitle="Set up your workspace the way you like it."
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
            >
              <div className="space-y-5 mt-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Palette size={12} /> Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                          theme === value
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-accent/20 border-border text-muted-foreground hover:border-primary/20 hover:text-foreground',
                        )}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Layout size={12} /> Default views
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Task view</span>
                      <div className="flex gap-1 bg-accent/30 rounded-lg p-0.5">
                        {['LIST', 'KANBAN', 'CALENDAR'].map((v) => (
                          <button
                            key={v}
                            onClick={() => setTaskView(v)}
                            className={cn(
                              'px-3 py-1 rounded text-xs font-medium transition-all',
                              taskView === v ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {v.charAt(0) + v.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Calendar view</span>
                      <div className="flex gap-1 bg-accent/30 rounded-lg p-0.5">
                        {['MONTH', 'WEEK', 'DAY', 'AGENDA'].map((v) => (
                          <button
                            key={v}
                            onClick={() => setCalView(v)}
                            className={cn(
                              'px-2.5 py-1 rounded text-xs font-medium transition-all',
                              calView === v ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {v.charAt(0) + v.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </OnboardingStep>
          )}

          {/* Step 3: Quick Tour */}
          {currentStep === 3 && (
            <OnboardingStep
              key="step-3"
              step={3}
              totalSteps={5}
              title="Quick Tour"
              subtitle={tourStep < tipItems.length - 1 ? `Tip ${tourStep + 1} of ${tipItems.length}` : 'Last tip!'}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              hideBack={tourStep === 0}
            >
              <div className="py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tourStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className={cn(
                      'w-20 h-20 rounded-2xl flex items-center justify-center mb-5',
                      tipItems[tourStep].icon === Zap ? 'bg-amber-500/10' :
                      tipItems[tourStep].icon === Lightbulb ? 'bg-primary/10' :
                      tipItems[tourStep].icon === Layout ? 'bg-blue-500/10' : 'bg-violet-500/10',
                    )}>
                      {(() => {
                        const Icon = tipItems[tourStep].icon;
                        return <Icon size={32} className={
                          tipItems[tourStep].icon === Zap ? 'text-amber-500' :
                          tipItems[tourStep].icon === Lightbulb ? 'text-primary' :
                          tipItems[tourStep].icon === Layout ? 'text-blue-500' : 'text-violet-500'
                        } />;
                      })()}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{tipItems[tourStep].label}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{tipItems[tourStep].desc}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-center gap-1.5 mt-6">
                  {tipItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTourStep(i)}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-all',
                        i === tourStep ? 'w-4 bg-primary' : 'bg-border hover:bg-muted-foreground/30',
                      )}
                    />
                  ))}
                </div>
              </div>
            </OnboardingStep>
          )}

          {/* Step 4: First Action */}
          {currentStep === 4 && (
            <OnboardingStep
              key="step-4"
              step={4}
              totalSteps={5}
              title="Ready to get started?"
              subtitle="Pick your first action and dive right in."
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              hideSkip
              isLast
              nextLabel="Explore on my own"
            >
              <div className="space-y-3 mt-2">
                {firstActionChoices.map(({ icon: Icon, label, desc, color, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-accent/20 border border-border hover:border-primary/30 hover:bg-accent/40 transition-all text-left group"
                  >
                    <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', color)}>
                      <Icon size={20} className="text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </OnboardingStep>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
