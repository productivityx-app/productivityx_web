import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option { value: string; label: string; }

interface Props {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}

export default function SettingsSelect({ label, value, onValueChange, options, placeholder }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-accent/30 border-border rounded-lg text-sm h-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
