import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'dashboard-focus-of-day';

export default function FocusOfDay() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setText(saved);
  }, []);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = (val: string) => {
    setText(val);
    localStorage.setItem(STORAGE_KEY, val);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {t('dashboard.focusOfDay')}:
      </span>
      {editing ? (
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => save(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); }}
          placeholder={t('dashboard.focusPlaceholder')}
          className="flex-1 bg-transparent text-sm text-foreground border-b border-border outline-none focus:border-primary min-w-0"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-foreground truncate hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1"
        >
          {text || (
            <span className="text-muted-foreground italic">{t('dashboard.focusPlaceholder')}</span>
          )}
        </button>
      )}
    </div>
  );
}
