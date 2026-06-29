import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation();

  return (
    <div role="alert" className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{t('errorState.somethingWentWrong')}</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">{message || t('errorState.somethingWentWrong')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={14} />
          {t('errorState.tryAgain')}
        </button>
      )}
    </div>
  );
}
