import { createContext, useContext, type ReactNode } from "react";
import {
    useToastQueue,
    type ToastItem,
    type ToastPlacement,
} from "@acl/primitives";
import { Toast } from "./Toast";
import { twMerge } from "tailwind-merge";

interface ToastContextValue {
    push: (toast: Omit<ToastItem, "id">) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);

    if (!ctx) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return ctx;
}

const PLACEMENT_STYLES: Record<ToastPlacement, string> = {
    "top-left": "top-4 left-4 items-start",
    "top-right": "top-4 right-4 items-end",
    "bottom-left": "bottom-4 left-4 items-start",
    "bottom-right": "bottom-4 right-4 items-end",
};

interface ToastProviderProps {
    children: ReactNode;
    placement?: ToastPlacement;
}

export function ToastProvider({
    children,
    placement = "bottom-right",
}: ToastProviderProps) {
    const { toasts, push, dismiss, scheduleDismiss, pause } = useToastQueue();

    return (
        <ToastContext.Provider value={{ push }}>
            {children}

            <div
                role="region"
                aria-label="Notifications"
                className={twMerge(
                    "fixed z-50 flex w-80 flex-col gap-2",
                    PLACEMENT_STYLES[placement]
                )}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onDismiss={() => dismiss(toast.id)}
                        onScheduleDismiss={(ms) => scheduleDismiss(toast.id, ms)}
                        onPause={() => pause(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}