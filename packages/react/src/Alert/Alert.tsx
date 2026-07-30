import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    XCircle,
} from 'lucide-react';
import { useAlert } from '@acl/primitives';

const alertStyles = cva(
    [
        'relative flex w-full items-start gap-3',
        'border p-4 text-sm',
        'shadow-sm',
        'transition-all duration-200',
        'motion-reduce:transition-none',
    ],
    {
        variants: {
            variant: {
                success: [
                    'border-success-default/30',
                    'bg-success-subtle',
                    'text-text-primary',
                ],
                info: [
                    'border-accent-default/30',
                    'bg-accent-subtle',
                    'text-text-primary',
                ],
                warning: [
                    'border-warning-default/30',
                    'bg-warning-subtle',
                    'text-text-primary',
                ],
                danger: [
                    'border-danger-default/30',
                    'bg-danger-subtle',
                    'text-text-primary',
                ],
            },

            banner: {
                true: [
                    'rounded-none',
                    'border-x-0',
                    'border-t-0',
                    'shadow-sm',
                ],
                false: [
                    'rounded-lg',
                ],
            },
        },

        defaultVariants: {
            variant: 'info',
            banner: false,
        },
    },

);

const ICONS = {
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
    danger: XCircle,
} as const;

const ICON_STYLES = {
    success: 'bg-success-default/10 text-success-default',
    info: 'bg-accent-default/10 text-accent-default',
    warning: 'bg-warning-default/10 text-warning-default',
    danger: 'bg-danger-default/10 text-danger-default',
} as const;

export interface AlertProps
    extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertStyles> {
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
        const Icon = ICONS[variant ?? 'info'];

        if (!visible) {
            return null;
        }

        return (
            <div
                ref={ref}
                className={twMerge(
                    alertStyles({
                        variant,
                        banner,
                    }),
                    className,
                )}
                {...alertProps}
                {...props}
            >
                {/* Icon */}
                <div
                    className={twMerge(
                        [
                            'flex size-9 shrink-0 items-center justify-center',
                            'rounded-md',
                        ],
                        ICON_STYLES[variant ?? 'info'],
                    )}
                >
                    <Icon
                        aria-hidden="true"
                        size={18}
                        strokeWidth={2}
                    />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                    {title && (
                        <p className="font-semibold leading-5 tracking-tight">
                            {title}
                        </p>
                    )}

                    {children && (
                        <div
                            className={twMerge(
                                'leading-6 text-text-secondary',
                                title && 'mt-1',
                            )}
                        >
                            {children}
                        </div>
                    )}
                </div>

                {/* Close button */}
                {closable && (
                    <button
                        type="button"
                        aria-label="Close alert"
                        onClick={close}
                        className={[
                            'focus-ring-safe',
                            'flex size-8 shrink-0 items-center justify-center',
                            'rounded-md',
                            'text-text-secondary',
                            'transition-colors',
                            'hover:bg-black/5 dark:hover:bg-white/10 hover:text-text-primary',
                            'active:bg-black/10 dark:active:bg-white/15',
                            'motion-reduce:transition-none',
                        ].join(' ')}
                    >
                        <X
                            aria-hidden="true"
                            size={17}
                            strokeWidth={2}
                        />
                    </button>
                )}
            </div>
        );
    },

);

Alert.displayName = 'Alert';
