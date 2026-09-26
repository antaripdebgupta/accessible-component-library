import { useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import type { ToastItem } from '@antarip/primitives';

const toastStyles = cva(
  [
    'flex items-start gap-3 rounded-popover border p-control-md shadow-lg w-full',
    'animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        info: 'bg-surface border-border',
        success: 'bg-surface border-success-default/30',
        warning: 'bg-surface border-warning-default/30',
        danger: 'bg-surface border-danger-default/30',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const;

const ICON_COLOR = {
  info: 'text-accent-default',
  success: 'text-success-default',
  warning: 'text-warning-default',
  danger: 'text-danger-default',
} as const;

interface ToastProps {
  toast: ToastItem;
  onDismiss: () => void;
  onScheduleDismiss: (ms: number) => void;
  onPause: () => void;
}

export function Toast({ toast, onDismiss, onScheduleDismiss, onPause }: ToastProps) {
  const variant = toast.variant ?? 'info';
  const Icon = ICONS[variant];
  const duration = toast.duration ?? 4500;

  useEffect(() => {
    onScheduleDismiss(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="status"
      aria-atomic="true"
      className={twMerge(toastStyles({ variant }))}
      onMouseEnter={onPause}
      onMouseLeave={() => onScheduleDismiss(duration)}
      onFocus={onPause}
      onBlur={() => onScheduleDismiss(duration)}
    >
      <Icon
        aria-hidden="true"
        size={18}
        className={twMerge('mt-0.5 shrink-0', ICON_COLOR[variant])}
      />

      <div className="min-w-0 flex-1 text-sm">
        {toast.title && <p className="font-medium leading-5 text-text-primary">{toast.title}</p>}
        <p className="mt-0.5 text-text-secondary">{toast.description}</p>
      </div>

      {/* Always present — auto-dismiss must never be the only way to close it. */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="shrink-0 rounded-control p-0.5 text-text-secondary focus-ring-safe hover:text-text-primary"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
