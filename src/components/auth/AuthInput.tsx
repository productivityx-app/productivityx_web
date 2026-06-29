import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export default function AuthInput({
  label, error, showPasswordToggle, showPassword, onTogglePassword,
  className, id, ...props
}: Props) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className={cn(
          'block text-xs font-medium transition-colors duration-200',
          hasError ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
            'bg-accent/30 border',
            'text-foreground placeholder:text-muted-foreground/30',
            'outline-none',
            hasError
              ? 'border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : 'border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20',
            showPasswordToggle && 'pr-10',
            className,
          )}
          {...props}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {showPasswordToggle ? null : <AlertCircle size={14} className="text-destructive" />}
          </div>
        )}
      </div>
      {hasError && (
        <p className="flex items-center gap-1 text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
          <AlertCircle size={10} />
          {error}
        </p>
      )}
    </div>
  );
}
