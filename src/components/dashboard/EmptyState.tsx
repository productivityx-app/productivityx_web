import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-10 px-4 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[200px]">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-xs font-medium text-primary hover:text-primary/80 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-2 py-1"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
