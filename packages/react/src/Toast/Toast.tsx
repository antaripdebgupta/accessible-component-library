import { useEffect } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import type { ToastItem } from "@acl/primitives";

const toastStyles = cva(
    [
        "flex items-start gap-3 rounded-popover border p-control-md shadow-lg w-full",
        "animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none motion-reduce:transition-none",
    ],
    {
        variants: {
            variant: {
                info: "bg-surface border-border",
                success: "bg-surface border-success-default/30",
                warning: "bg-surface border-warning-default/30",
                danger: "bg-surface border-danger-default/30",
            },
        },
        defaultVariants: { variant: "info" },
    }
);

const ICONS = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: XCircle,
} as const;

const ICON_COLOR = {
    info: "text-accent-default",
    success: "text-success-default",
    warning: "text-warning-default",
    danger: "text-danger-default",
} as const;

interface ToastProps {
    toast: ToastItem;
    onDismiss: () => void;
    onScheduleDismiss: (ms: number) => void;
    onPause: () => void;
}

export function Toast({ toast, onDismiss, onScheduleDismiss, onPause }: ToastProps) {
    const variant = toast.variant ?? "info";
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
            <Icon aria-hidden="true" size={18} className={twMerge("shrink-0 mt-0.5", ICON_COLOR[variant])} />

            <div className="flex-1 min-w-0 text-sm">
                {toast.title && <p className="font-medium leading-5 text-text-primary">{toast.title}</p>}
                <p className="text-text-secondary mt-0.5">{toast.description}</p>
            </div>

            {/* Always present — auto-dismiss must never be the only way to close it. */}
            <button
                type="button"
                aria-label="Dismiss notification"
                onClick={onDismiss}
                className="focus-ring-safe shrink-0 rounded-control text-text-secondary hover:text-text-primary p-0.5"
            >
                <X aria-hidden="true" size={16} />
            </button>
        </div>
    );
}