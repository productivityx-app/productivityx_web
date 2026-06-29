import { ReactNode } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Props {
  icon?: ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}

export default function SettingsToggle({ icon, label, description, checked, onCheckedChange, disabled }: Props) {
  return (
    <div className={cn('flex items-start gap-3 py-0.5', disabled && 'opacity-50')}>
      {icon && <div className="mt-0.5 text-muted-foreground/50">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground/50 mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
