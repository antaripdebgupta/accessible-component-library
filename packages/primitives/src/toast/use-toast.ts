import { useState, useCallback, useRef } from "react";

export type ToastVariant = "info" | "success" | "warning" | "danger";
export type ToastPlacement = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface ToastItem {
    id: string;
    title?: string;
    description: string;
    variant?: ToastVariant;
    /** ms; 0 = never auto-dismiss. Default 4500 (matches Ant Design's default). */
    duration?: number;
}

const DEFAULT_DURATION = 4500;

export function useToastQueue() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) clearTimeout(timer);
        timers.current.delete(id);
    }, []);

    const push = useCallback((toast: Omit<ToastItem, "id">) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, duration: DEFAULT_DURATION, ...toast }]);
        return id;
    }, []);

    /** Called by the Toast component itself so pausing/resuming is per-item. */
    const scheduleDismiss = useCallback(
        (id: string, ms: number) => {
            const existing = timers.current.get(id);
            if (existing) clearTimeout(existing);
            if (ms <= 0) return; // 0 = never auto-dismiss
            timers.current.set(id, setTimeout(() => dismiss(id), ms));
        },
        [dismiss]
    );

    const pause = useCallback((id: string) => {
        const existing = timers.current.get(id);
        if (existing) clearTimeout(existing);
    }, []);

    return { toasts, push, dismiss, scheduleDismiss, pause };
}