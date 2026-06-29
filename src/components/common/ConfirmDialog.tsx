import { useTranslation } from 'react-i18next';
import Modal from '@/components/design-system/Modal';
import AnimatedButton from '@/components/design-system/AnimatedButton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void;
  destructive?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmText, onConfirm, destructive = false, children }: Props) {
  const { t } = useTranslation();
  const confirmLabel = confirmText || t('common.confirmText');
  const titleId = 'confirm-dialog-title';
  const descId = 'confirm-dialog-description';
  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={title} titleId={titleId} size="sm">
      <div role="alertdialog" aria-labelledby={titleId} aria-describedby={descId}>
      <p id={descId} className="text-xs text-muted-foreground">{description}</p>
      {children}
      <div className="flex justify-end gap-2 mt-4">
        <AnimatedButton onClick={() => onOpenChange(false)} variant="outline" size="sm">
          {t('common.cancel')}
        </AnimatedButton>
        <AnimatedButton
          onClick={onConfirm}
          variant={destructive ? 'destructive' : 'primary'}
          size="sm"
        >
          {confirmLabel}
        </AnimatedButton>
      </div>
      </div>
    </Modal>
  );
}
