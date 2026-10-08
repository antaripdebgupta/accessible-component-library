import { useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import type { ToastItem } from '@antarip/primitives';

const toastStyles = cva([
  'flex items-start gap-3 rounded-popover border border-border bg-surface p-4 shadow-md w-full',
  'motion-safe:animate-rise motion-reduce:animate-none',
]);

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const;

const ICON_COLOR = {
  info: 'text-info-default',
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
  }, []);

  return (
    <div
      role="status"
      aria-atomic="true"
      className={twMerge(toastStyles())}
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

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-text-secondary outline-none transition-[color,background-color,border-color,box-shadow,scale] duration-fast ease-out-soft focus-ring-safe hover:bg-surface-raised hover:text-text-primary active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
