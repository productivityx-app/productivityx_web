import { cn } from '@/lib/utils';

const colors = [
  { id: 'blue', class: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'purple', class: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'green', class: 'bg-green-500', ring: 'ring-green-500' },
  { id: 'orange', class: 'bg-orange-500', ring: 'ring-orange-500' },
  { id: 'red', class: 'bg-red-500', ring: 'ring-red-500' },
  { id: 'pink', class: 'bg-pink-500', ring: 'ring-pink-500' },
  { id: 'teal', class: 'bg-teal-500', ring: 'ring-teal-500' },
  { id: 'indigo', class: 'bg-indigo-500', ring: 'ring-indigo-500' },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function AccentColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2.5">
      {colors.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={cn(
            'w-8 h-8 rounded-full transition-all',
            c.class,
            value === c.id ? 'ring-2 ring-offset-2 ring-offset-card scale-110' : 'ring-0 opacity-60 hover:opacity-100',
          )}
        />
      ))}
    </div>
  );
}
