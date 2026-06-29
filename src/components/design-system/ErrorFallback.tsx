import { useState } from 'react';
import { RefreshCw, Home, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorFallbackProps {
  error?: Error;
  onReload?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export default function ErrorFallback({
  error,
  onReload,
  onGoHome,
  className,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center min-h-[400px] px-6 py-16 text-center', className)}>
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6 ring-1 ring-destructive/20">
        <AlertTriangle size={36} className="text-destructive" />
      </div>
      <h2 id="error-heading" className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        An unexpected error occurred. Please try reloading the page or return to the home page.
      </p>
      <div className="flex items-center gap-3">
        {onReload && (
          <button
            onClick={onReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <RefreshCw size={14} />
            Reload page
          </button>
        )}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
          >
            <Home size={14} />
            Go home
          </button>
        )}
      </div>
      {error && (
        <div className="mt-8 w-full max-w-md">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 mx-auto text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Error details
          </button>
          {showDetails && (
            <pre className="mt-3 p-4 rounded-xl bg-accent/20 border border-border text-xs text-muted-foreground overflow-auto max-h-32 text-left">
              {error.name}: {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
