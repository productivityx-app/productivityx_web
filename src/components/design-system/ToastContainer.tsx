'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const icons = {
  success: <CheckCircle size={18} className="text-green-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

export default function ToastContainer(props: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={icons}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-muted-foreground text-xs',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs',
          error: 'group-[.toaster]:border-red-500/20',
          success: 'group-[.toaster]:border-green-500/20',
          warning: 'group-[.toaster]:border-amber-500/20',
          info: 'group-[.toaster]:border-blue-500/20',
        },
      }}
      duration={4000}
      closeButton
      visibleToasts={5}
      {...props}
    />
  );
}

export { icons as toastIcons };
