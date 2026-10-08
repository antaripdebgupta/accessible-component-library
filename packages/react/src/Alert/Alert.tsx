import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useAlert } from '@antarip/primitives';

const ALERT_EXIT_MS = 160;

const alertStyles = cva(['relative flex w-full items-start gap-3', 'border p-4 text-sm'], {
  variants: {
    variant: {
      success: ['border-success-default/30', 'bg-success-subtle', 'text-text-primary'],
      info: ['border-info-default/30', 'bg-info-subtle', 'text-text-primary'],
      warning: ['border-warning-default/30', 'bg-warning-subtle', 'text-text-primary'],
      danger: ['border-danger-default/30', 'bg-danger-subtle', 'text-text-primary'],
    },

    banner: {
      true: ['rounded-none', 'border-x-0', 'border-t-0'],
      false: ['rounded-popover'],
    },
  },

  defaultVariants: {
    variant: 'info',
    banner: false,
  },
});

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
} as const;

const ICON_STYLES = {
  success: 'text-success-default',
  info: 'text-info-default',
  warning: 'text-warning-default',
  danger: 'text-danger-default',
} as const;

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertStyles> {
  title?: string;
  urgency?: 'polite' | 'assertive' | 'off';
  closable?: boolean;
  onClose?: () => void;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'info',
      banner = false,
      title,
      urgency = 'assertive',
      closable = false,
      onClose,
      children,
      ...props
    },
    ref,
  ) => {
    const { visible, close, alertProps } = useAlert({
      urgency,
      closable,
      onClose,
    });
    const [mounted, setMounted] = useState(visible);

    useEffect(() => {
      if (visible) {
        setMounted(true);
        return;
      }
      const t = setTimeout(() => setMounted(false), ALERT_EXIT_MS);
      return () => clearTimeout(t);
    }, [visible]);

    const Icon = ICONS[variant ?? 'info'];

    if (!visible && !mounted) {
      return null;
    }
    const closing = !visible;

    return (
      <div
        data-state={closing ? 'closed' : 'open'}
        inert={closing || undefined}
        aria-hidden={closing || undefined}
        className={twMerge(
          'grid w-full transition-[grid-template-rows,opacity] motion-reduce:transition-none',
          closing
            ? 'grid-rows-[0fr] opacity-0 duration-fast ease-in-quick'
            : 'grid-rows-[1fr] opacity-100 duration-base ease-out-soft',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            ref={ref}
            className={twMerge(
              alertStyles({
                variant,
                banner,
              }),
              'motion-safe:animate-rise motion-reduce:animate-none',
              'transition-[translate] motion-reduce:transition-none',
              closing
                ? '-translate-y-1 duration-fast ease-in-quick'
                : 'duration-base ease-out-soft',
              className,
            )}
            {...alertProps}
            {...props}
          >
            <div
              className={twMerge(
                'flex shrink-0 items-center justify-center pt-0.5',
                ICON_STYLES[variant ?? 'info'],
              )}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              {title && <p className="font-semibold leading-5 tracking-tight">{title}</p>}

              {children && (
                <div className={twMerge('leading-6 text-text-secondary', title && 'mt-1')}>
                  {children}
                </div>
              )}
            </div>

            {closable && (
              <button
                type="button"
                aria-label="Close alert"
                onClick={close}
                className={[
                  'focus-ring-safe',
                  'flex size-8 shrink-0 items-center justify-center',
                  'rounded-control',
                  'text-text-secondary',
                  'transition-colors duration-fast',
                  'hover:bg-surface-raised hover:text-text-primary',
                  'active:bg-surface-sunken',
                  'motion-reduce:transition-none',
                ].join(' ')}
              >
                <X aria-hidden="true" size={17} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Alert.displayName = 'Alert';
