import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2, Key, Check, Undo2, Monitor,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { profileApi, preferencesApi } from '../api/profile';
import { devicesApi } from '../api/devices';
import { authApi } from '../api/auth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AnimatedButton from '@/components/design-system/AnimatedButton';
import GlassCard from '@/components/design-system/GlassCard';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import { useOnboardingStore } from '../stores/onboardingStore';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsToggle from '../components/settings/SettingsToggle';
import SettingsSelect from '../components/settings/SettingsSelect';
import SettingsSlider from '../components/settings/SettingsSlider';
import ThemePreview from '../components/settings/ThemePreview';
import AccentColorPicker from '../components/settings/AccentColorPicker';
import DangerZone from '../components/settings/DangerZone';
import DeviceList from '../components/settings/DeviceList';

type Theme = 'DARK' | 'LIGHT' | 'SYSTEM';

interface ProfileForm {
  firstName: string; lastName: string; bio: string;
  avatarUrl: string; timezone: string;
  language: 'EN' | 'FR' | 'AR'; theme: Theme;
}

interface PrefForm {
  pomodoroFocusMinutes: number; pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number; pomodoroCyclesBeforeLongBreak: number;
  pomodoroAutoStartBreaks: boolean; pomodoroAutoStartFocus: boolean;
  pomodoroSoundEnabled: boolean;
  notifyTaskReminders: boolean; notifyEventReminders: boolean;
  notifyPomodoroEnd: boolean; notifyDailySummary: boolean;
  defaultTaskView: string; defaultTaskSort: string; showCompletedTasks: boolean;
  defaultCalendarView: string; weekStartsOn: string;
  aiContextEnabled: boolean; aiModel: string; compactMode: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const timezones = Intl.supportedValuesOf?.('timeZone') || [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata',
  'Australia/Sydney', 'Pacific/Auckland', 'Africa/Casablanca', 'Africa/Cairo',
];

export default function SettingsPage() {
  useEffect(() => { document.title = 'Settings — ProductivityX'; }, []);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { profile, preferences, updateProfile, updatePreferences, logout, user } = useAuthStore();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('general');

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: '', lastName: '', bio: '', avatarUrl: '',
    timezone: 'UTC', language: 'EN', theme: 'DARK',
  });
  const [prefForm, setPrefForm] = useState<PrefForm>({
    pomodoroFocusMinutes: 25, pomodoroShortBreakMinutes: 5, pomodoroLongBreakMinutes: 15,
    pomodoroCyclesBeforeLongBreak: 4, pomodoroAutoStartBreaks: false, pomodoroAutoStartFocus: false,
    pomodoroSoundEnabled: true, notifyTaskReminders: true, notifyEventReminders: true,
    notifyPomodoroEnd: true, notifyDailySummary: false, defaultTaskView: 'LIST',
    defaultTaskSort: 'updatedAt', showCompletedTasks: true, defaultCalendarView: 'WEEK',
    weekStartsOn: 'MONDAY', aiContextEnabled: true, aiModel: 'default', compactMode: false,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('px-accent') || 'blue');
  const [density, setDensity] = useState(() => localStorage.getItem('px-density') || 'comfortable');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('px-font-size') || 'default');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('px-reduced-motion') === 'true');

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (profile) setProfileForm({
      firstName: profile.firstName || '', lastName: profile.lastName || '', bio: profile.bio || '',
      avatarUrl: profile.avatarUrl || '', timezone: profile.timezone || 'UTC',
      language: (profile.language || 'EN') as 'EN'|'FR'|'AR',
      theme: (profile.theme || 'DARK') as Theme,
    });
  }, [profile]);

  useEffect(() => {
    if (preferences) setPrefForm((p) => ({ ...p, ...preferences }));
  }, [preferences]);

  const debouncedPrefs = useDebounce(prefForm, 1500);

  const updatePrefMutation = useMutation({
    mutationFn: (data: Partial<PrefForm>) => preferencesApi.update(data),
    onSuccess: (updated) => {
      updatePreferences(updated);
      toast.success(t('settings.preferencesSaved'), { id: 'pref-save', duration: 3000 });
    },
    onError: () => toast.error(t('settings.failedToSavePrefs'), { id: 'pref-save' }),
  });

  useEffect(() => {
    autoSaveTimer.current = setTimeout(() => {
      updatePrefMutation.mutate(debouncedPrefs);
    }, 1500);
    return () => clearTimeout(autoSaveTimer.current);
  }, [debouncedPrefs]);

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'], queryFn: devicesApi.list,
  });

  const updateProfileMutation = useMutation({
    mutationFn: () => profileApi.update(profileForm),
    onSuccess: (updated) => {
      updateProfile(updated);
      i18n.changeLanguage(updated.language.toLowerCase());
      toast.success(t('settings.profileSaved'), { duration: 5000, action: { label: t('common.undo'), onClick: () => {} } });
    },
    onError: () => toast.error(t('settings.failedToSaveProfile')),
  });

  const revokeDeviceMutation = useMutation({
    mutationFn: (id: string) => devicesApi.revoke(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['devices'] }); toast.success(t('settings.deviceRevoked')); },
  });

  const changePwMutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    onSuccess: () => { toast.success(t('settings.passwordChanged')); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: () => toast.error(t('settings.failedToChangePassword')),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (pw: string) => authApi.deleteAccount(pw),
    onSuccess: () => { logout(); navigate('/login'); toast.success(t('settings.accountDeleted')); },
    onError: () => toast.error(t('settings.failedToDeleteAccount')),
  });

  const handleLogout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleThemeChange = (v: Theme) => setProfileForm((f) => ({ ...f, theme: v }));

  const handleAccentColor = (id: string) => {
    setAccentColor(id);
    localStorage.setItem('px-accent', id);
  };

  const handleDensity = (v: string) => {
    setDensity(v);
    localStorage.setItem('px-density', v);
    if (v === 'compact') setPrefForm((f) => ({ ...f, compactMode: true }));
    else if (v === 'spacious') setPrefForm((f) => ({ ...f, compactMode: false }));
  };

  const handleFontSize = (v: string) => {
    setFontSize(v);
    localStorage.setItem('px-font-size', v);
  };

  const handleReducedMotion = (v: boolean) => {
    setReducedMotion(v);
    localStorage.setItem('px-reduced-motion', String(v));
  };

  const section = (id: string, title: string, desc: string | undefined, children: React.ReactNode) => (
    <div style={{ display: activeCategory === id ? 'block' : 'none' }}>
      <SettingsSection title={title} description={desc}>{children}</SettingsSection>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <SettingsSidebar active={activeCategory} onSelect={setActiveCategory} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-foreground">{t('settings.title')}</h1>
            {updatePrefMutation.isPending && (
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                <Loader2 size={10} className="animate-spin" />
                {t('common.saving')}
              </span>
            )}
          </div>

          {/* General */}
          {section('general', t('settings.categories.general'), undefined,
            <>
              <ThemePreview value={profileForm.theme} onChange={handleThemeChange} />
              <Separator className="bg-border/50" />
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t('settings.accentColor')}</label>
                <AccentColorPicker value={accentColor} onChange={handleAccentColor} />
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t('settings.density')}</label>
                <div className="flex gap-2">
                  {['compact', 'comfortable', 'spacious'].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDensity(d)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        density === d
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-accent/30 text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      {t(`settings.densityOptions.${d}`)}
                    </button>
                  ))}
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t('settings.fontSize')}</label>
                <div className="flex gap-2">
                  {['small', 'default', 'large'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleFontSize(s)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        fontSize === s
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-accent/30 text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      {t(`settings.fontSizeOptions.${s}`)}
                    </button>
                  ))}
                </div>
              </div>
              <Separator className="bg-border/50" />
              <SettingsToggle
                icon={<Monitor size={14} />}
                label={t('settings.reducedMotion')}
                checked={reducedMotion}
                onCheckedChange={handleReducedMotion}
              />
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Onboarding</p>
                  <p className="text-[10px] text-muted-foreground/50">Re-play the getting started tour</p>
                </div>
                <button
                  onClick={() => useOnboardingStore.getState().startOnboarding()}
                  className="px-3 py-1.5 rounded-lg bg-accent/30 border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  Show onboarding
                </button>
              </div>
            </>
          )}

          {/* Profile */}
          {section('profile', t('settings.categories.profile'), t('settings.profileDesc'),
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/50 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profileForm.avatarUrl ? (
                    <img src={profileForm.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground/50">
                      {profileForm.firstName?.[0] || profileForm.lastName?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{profileForm.firstName} {profileForm.lastName}</p>
                  <p className="text-xs text-muted-foreground/50">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('settings.firstName')}</label>
                  <Input value={profileForm.firstName} onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))} className="bg-accent/30 border-border h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('settings.lastName')}</label>
                  <Input value={profileForm.lastName} onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))} className="bg-accent/30 border-border h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('settings.bio')}
                  <span className="text-[10px] text-muted-foreground/40 ml-1">({profileForm.bio.length}/160)</span>
                </label>
                <Textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value.slice(0, 160) }))}
                  className="bg-accent/30 border-border min-h-[60px] text-sm resize-none"
                  placeholder={t('settings.bioPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SettingsSelect
                  label={t('settings.language')}
                  value={profileForm.language}
                  onValueChange={(v) => setProfileForm((f) => ({ ...f, language: v as 'EN'|'FR'|'AR' }))}
                  options={[
                    { value: 'EN', label: '🇬🇧 English' },
                    { value: 'FR', label: '🇫🇷 Français' },
                    { value: 'AR', label: '🇸🇦 العربية' },
                  ]}
                />
                <SettingsSelect
                  label={t('settings.timezone')}
                  value={profileForm.timezone}
                  onValueChange={(v) => setProfileForm((f) => ({ ...f, timezone: v }))}
                  options={timezones.map((tz) => ({ value: tz, label: tz }))}
                />
              </div>
              <div className="flex justify-end pt-1">
                <AnimatedButton
                  onClick={() => updateProfileMutation.mutate()}
                  loading={updateProfileMutation.isPending}
                  size="sm"
                  icon={<Check size={12} />}
                >
                  {t('settings.saveProfile')}
                </AnimatedButton>
              </div>
            </>
          )}

          {/* Appearance */}
          {section('appearance', t('settings.categories.appearance'), t('settings.appearanceDesc'),
            <>
              <ThemePreview value={profileForm.theme} onChange={handleThemeChange} />
              <Separator className="bg-border/50" />
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t('settings.accentColor')}</label>
                <AccentColorPicker value={accentColor} onChange={handleAccentColor} />
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('settings.density')}</label>
                  <div className="flex gap-2">
                    {['compact', 'comfortable', 'spacious'].map((d) => (
                      <button
                        key={d}
                        onClick={() => handleDensity(d)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          density === d
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-accent/30 text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {t(`settings.densityOptions.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('settings.fontSize')}</label>
                  <div className="flex gap-2">
                    {['small', 'default', 'large'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleFontSize(s)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          fontSize === s
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-accent/30 text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {t(`settings.fontSizeOptions.${s}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <SettingsToggle
                icon={<Monitor size={14} />}
                label={t('settings.reducedMotion')}
                checked={reducedMotion}
                onCheckedChange={handleReducedMotion}
              />
            </>
          )}

          {/* Notifications */}
          {section('notifications', t('settings.categories.notifications'), t('settings.notificationsDesc'),
            <>
              <SettingsToggle label={t('settings.notifyTaskReminders')} checked={prefForm.notifyTaskReminders} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, notifyTaskReminders: v }))} />
              <SettingsToggle label={t('settings.notifyEventReminders')} checked={prefForm.notifyEventReminders} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, notifyEventReminders: v }))} />
              <SettingsToggle label={t('settings.notifyPomodoroEnd')} checked={prefForm.notifyPomodoroEnd} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, notifyPomodoroEnd: v }))} />
              <SettingsToggle label={t('settings.notifyDailySummary')} checked={prefForm.notifyDailySummary} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, notifyDailySummary: v }))} />
              <Separator className="bg-border/50" />
              <SettingsToggle label={t('settings.pomodoroSoundEnabled')} checked={prefForm.pomodoroSoundEnabled} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, pomodoroSoundEnabled: v }))} />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('settings.quietHoursStart')}</label>
                  <Input type="time" defaultValue="22:00" className="bg-accent/30 border-border h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('settings.quietHoursEnd')}</label>
                  <Input type="time" defaultValue="07:00" className="bg-accent/30 border-border h-9 text-sm" />
                </div>
              </div>
            </>
          )}

          {/* Pomodoro */}
          {section('pomodoro', t('settings.categories.pomodoro'), t('settings.pomodoroDesc'),
            <>
              <SettingsSlider
                label={t('settings.focusMinutes')}
                value={prefForm.pomodoroFocusMinutes}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, pomodoroFocusMinutes: v }))}
                min={5} max={120} step={5}
                formatValue={(v) => `${v}m`}
              />
              <SettingsSlider
                label={t('settings.shortBreakMinutes')}
                value={prefForm.pomodoroShortBreakMinutes}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, pomodoroShortBreakMinutes: v }))}
                min={1} max={30} step={1}
                formatValue={(v) => `${v}m`}
              />
              <SettingsSlider
                label={t('settings.longBreakMinutes')}
                value={prefForm.pomodoroLongBreakMinutes}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, pomodoroLongBreakMinutes: v }))}
                min={5} max={60} step={5}
                formatValue={(v) => `${v}m`}
              />
              <SettingsSlider
                label={t('settings.cyclesBeforeLongBreak')}
                value={prefForm.pomodoroCyclesBeforeLongBreak}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, pomodoroCyclesBeforeLongBreak: v }))}
                min={1} max={8} step={1}
                formatValue={(v) => `${v}x`}
              />
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground/60 bg-accent/20 rounded-full px-4 py-2">
                  <span className="font-semibold text-foreground">{prefForm.pomodoroFocusMinutes}m</span>
                  <span className="text-muted-foreground/30">→</span>
                  <span>{prefForm.pomodoroShortBreakMinutes}m</span>
                  <span className="text-muted-foreground/30">×{prefForm.pomodoroCyclesBeforeLongBreak}</span>
                  <span className="text-muted-foreground/30">→</span>
                  <span>{prefForm.pomodoroLongBreakMinutes}m</span>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <SettingsToggle label={t('settings.autoStartBreaks')} checked={prefForm.pomodoroAutoStartBreaks} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, pomodoroAutoStartBreaks: v }))} />
              <SettingsToggle label={t('settings.autoStartFocus')} checked={prefForm.pomodoroAutoStartFocus} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, pomodoroAutoStartFocus: v }))} />
              <SettingsToggle label={t('settings.pomodoroSoundEnabled')} checked={prefForm.pomodoroSoundEnabled} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, pomodoroSoundEnabled: v }))} />
            </>
          )}

          {/* Tasks */}
          {section('tasks', t('settings.categories.tasks'), t('settings.tasksDesc'),
            <>
              <SettingsSelect
                label={t('settings.defaultTaskView')}
                value={prefForm.defaultTaskView}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, defaultTaskView: v }))}
                options={[
                  { value: 'LIST', label: t('settings.list') },
                  { value: 'KANBAN', label: t('settings.kanban') },
                  { value: 'CALENDAR', label: t('settings.calendarView') },
                ]}
              />
              <SettingsSelect
                label={t('settings.defaultTaskSort')}
                value={prefForm.defaultTaskSort}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, defaultTaskSort: v }))}
                options={[
                  { value: 'updatedAt', label: t('settings.sortUpdated') },
                  { value: 'createdAt', label: t('settings.sortCreated') },
                  { value: 'dueDate', label: t('settings.sortDueDate') },
                  { value: 'priority', label: t('settings.sortPriority') },
                  { value: 'title', label: t('settings.sortTitle') },
                ]}
              />
              <SettingsToggle label={t('settings.showCompletedTasks')} checked={prefForm.showCompletedTasks} onCheckedChange={(v) => setPrefForm((f) => ({ ...f, showCompletedTasks: v }))} />
            </>
          )}

          {/* Calendar */}
          {section('calendar', t('settings.categories.calendar'), t('settings.calendarDesc'),
            <>
              <SettingsSelect
                label={t('settings.defaultCalendarView')}
                value={prefForm.defaultCalendarView}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, defaultCalendarView: v }))}
                options={[
                  { value: 'MONTH', label: t('settings.month') },
                  { value: 'WEEK', label: t('settings.week') },
                  { value: 'DAY', label: t('settings.day') },
                  { value: 'AGENDA', label: t('settings.agenda') },
                ]}
              />
              <SettingsSelect
                label={t('settings.firstDayOfWeek')}
                value={prefForm.weekStartsOn}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, weekStartsOn: v }))}
                options={[
                  { value: 'MONDAY', label: t('settings.monday') },
                  { value: 'SUNDAY', label: t('settings.sunday') },
                  { value: 'SATURDAY', label: t('settings.saturday') },
                ]}
              />
              <SettingsSelect
                label={t('settings.timeFormat')}
                value="24h"
                onValueChange={() => {}}
                options={[
                  { value: '12h', label: t('settings.time12h') },
                  { value: '24h', label: t('settings.time24h') },
                ]}
              />
              <SettingsSlider
                label={t('settings.defaultEventDuration')}
                value={30}
                onValueChange={() => {}}
                min={5} max={180} step={5}
                formatValue={(v) => `${v}min`}
              />
            </>
          )}

          {/* AI */}
          {section('ai', t('settings.categories.ai'), t('settings.aiDesc'),
            <>
              <SettingsSelect
                label={t('settings.aiModel')}
                value={prefForm.aiModel}
                onValueChange={(v) => setPrefForm((f) => ({ ...f, aiModel: v }))}
                options={[
                  { value: 'default', label: t('settings.aiModelDefault') },
                  { value: 'fast', label: t('settings.aiModelFast') },
                  { value: 'reasoning', label: t('settings.aiModelReasoning') },
                ]}
              />
              <SettingsToggle
                label={t('settings.aiContextEnabled')}
                checked={prefForm.aiContextEnabled}
                onCheckedChange={(v) => setPrefForm((f) => ({ ...f, aiContextEnabled: v }))}
              />
              <AnimatedButton
                onClick={() => {
                  localStorage.removeItem('px-ai-conversations');
                  toast.success(t('settings.aiHistoryCleared'));
                }}
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive"
              >
                {t('settings.clearAiHistory')}
              </AnimatedButton>
            </>
          )}

          {/* Devices */}
          {section('devices', t('settings.categories.devices'), t('settings.devicesDesc'),
            <>
              <DeviceList
                devices={devices}
                loading={devicesLoading}
                onRevoke={(id) => revokeDeviceMutation.mutate(id)}
              />
            </>
          )}

          {/* Account */}
          {section('account', t('settings.categories.account'), t('settings.accountDesc'),
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('settings.email')}</label>
                <div className="bg-accent/30 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground">
                  {user?.email || ''}
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Key size={12} /> {t('settings.changePassword')}
                </p>
                <Input type="password" placeholder={t('settings.currentPassword')} value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} className="bg-accent/30 border-border h-9 text-sm" />
                <Input type="password" placeholder={t('settings.newPassword')} value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} className="bg-accent/30 border-border h-9 text-sm" />
                <Input type="password" placeholder={t('settings.confirmNewPassword')} value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} className="bg-accent/30 border-border h-9 text-sm" />
                <AnimatedButton
                  onClick={() => changePwMutation.mutate()}
                  loading={changePwMutation.isPending}
                  disabled={!pwForm.currentPassword || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirmPassword}
                  size="sm"
                >
                  {t('settings.changePasswordButton')}
                </AnimatedButton>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <AnimatedButton
                  onClick={() => toast.success(t('settings.dataExported'))}
                  variant="outline"
                  size="sm"
                >
                  {t('settings.exportData')}
                </AnimatedButton>
              </div>
              <Separator className="bg-border/50" />
              <DangerZone onLogout={handleLogout} onDelete={(pw) => deleteAccountMutation.mutate(pw)} isDeleting={deleteAccountMutation.isPending} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
