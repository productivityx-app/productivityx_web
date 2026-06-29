import { useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ value, onChange, onSend, disabled, placeholder }: Props) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      const lineHeight = 24;
      const maxHeight = lineHeight * 8;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
  }, []);

  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div
          className={cn(
            'flex items-end gap-2 bg-card border rounded-2xl px-4 py-2.5 transition-all',
            disabled ? 'border-border/50 opacity-60' : 'border-border focus-within:border-primary/40 focus-within:shadow-[0_0_0_1px] focus-within:shadow-primary/20',
          )}
        >
          <button
            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-all flex-shrink-0"
            title={t('ai.attachFile')}
          >
            <Paperclip size={16} />
          </button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('ai.placeholder')}
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none max-h-48 disabled:cursor-not-allowed leading-6"
          />
          <button
            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-all flex-shrink-0"
            title={t('ai.voiceInput')}
          >
            <Mic size={16} />
          </button>
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5">
          {t('ai.enterToSend')}
        </p>
      </div>
    </div>
  );
}
