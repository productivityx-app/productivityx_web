import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Modal from '@/components/design-system/Modal';
import AnimatedButton from '@/components/design-system/AnimatedButton';

interface Props {
  onLogout: () => void;
  onDelete: (password: string) => void;
  isDeleting?: boolean;
}

export default function DangerZone({ onLogout, onDelete, isDeleting }: Props) {
  const { t } = useTranslation();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState('');

  const handleDelete = () => {
    if (deletePw) { onDelete(deletePw); setDeleteOpen(false); setDeletePw(''); }
  };

  return (
    <>
      <div className="rounded-xl border border-destructive/20 bg-destructive/[0.03] p-4 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle size={14} />
          <span className="text-xs font-semibold">{t('settings.dangerZone')}</span>
        </div>
        <div className="flex gap-2">
          <AnimatedButton
            onClick={() => setLogoutOpen(true)}
            variant="secondary"
            size="sm"
            icon={<LogOut size={13} />}
          >
            {t('settings.signOut')}
          </AnimatedButton>
          <AnimatedButton
            onClick={() => setDeleteOpen(true)}
            variant="destructive"
            size="sm"
            icon={<Trash2 size={13} />}
          >
            {t('settings.deleteAccount')}
          </AnimatedButton>
        </div>
      </div>

      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title={t('settings.signOutConfirmTitle')} size="sm">
        <p className="text-xs text-muted-foreground">{t('settings.signOutConfirmDesc')}</p>
        <div className="mt-4">
          <AnimatedButton
            onClick={() => { onLogout(); setLogoutOpen(false); }}
            className="w-full"
            size="sm"
          >
            {t('settings.signOutConfirmText')}
          </AnimatedButton>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t('settings.deleteAccountConfirmTitle')} size="sm">
        <p className="text-xs text-muted-foreground mb-3">{t('settings.deleteAccountConfirmDesc')}</p>
        <Input
          type="password"
          placeholder={t('settings.deletePasswordPlaceholder')}
          value={deletePw}
          onChange={(e) => setDeletePw(e.target.value)}
          className="bg-accent/30 border-border text-sm"
        />
        <div className="flex gap-2 mt-4">
          <AnimatedButton onClick={() => setDeleteOpen(false)} variant="outline" className="flex-1" size="sm">
            {t('common.cancel')}
          </AnimatedButton>
          <AnimatedButton
            onClick={handleDelete}
            loading={isDeleting}
            disabled={!deletePw}
            variant="destructive"
            className="flex-1"
            size="sm"
          >
            {t('settings.deleteAccountConfirmText')}
          </AnimatedButton>
        </div>
      </Modal>
    </>
  );
}
