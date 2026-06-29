import { AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('notFound.description')}</p>
      </div>
    </div>
  );
}
