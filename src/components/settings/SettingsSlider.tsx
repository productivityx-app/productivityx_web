import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (v: number) => string;
}

export default function SettingsSlider({ label, value, onValueChange, min, max, step = 1, formatValue }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onValueChange(v)}
        min={min}
        max={max}
        step={step}
        className={cn('[&_[role=slider]]:h-4 [&_[role=slider]]:w-4')}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/40">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}
