import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToastQueue, type ToastItem, type ToastPlacement } from '@antarip/primitives';
import { Toast } from './Toast';
import { twMerge } from 'tailwind-merge';

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return ctx;
}

const PLACEMENT_STYLES: Record<ToastPlacement, string> = {
  'top-left': 'top-4 left-4 items-start',
  'top-right': 'top-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
};

const TOAST_EXIT_MS = 160;

function ToastEntry({ leaving, children }: { leaving: boolean; children: ReactNode }) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 260);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      data-state={leaving ? 'closed' : 'open'}
      inert={leaving || undefined}
      aria-hidden={leaving || undefined}
      className={twMerge(
        'grid w-full transition-[grid-template-rows,opacity] motion-reduce:transition-none',
        'motion-safe:animate-expand-in',
        leaving
          ? 'grid-rows-[0fr] opacity-0 duration-fast ease-in-quick'
          : 'grid-rows-[1fr] opacity-100 duration-base ease-out-soft',
      )}
    >
      <div className={twMerge('min-h-0', (!settled || leaving) && 'overflow-hidden')}>
        <div className="pb-2">{children}</div>
      </div>
    </div>
  );
}

interface ToastProviderProps {
  children: ReactNode;
  placement?: ToastPlacement;
}

export function ToastProvider({ children, placement = 'bottom-right' }: ToastProviderProps) {
  const { toasts, push, dismiss, scheduleDismiss, pause } = useToastQueue();
  const key = toasts.map((t) => t.id).join('|');
  const [snap, setSnap] = useState({ key, toasts });
  const [leaving, setLeaving] = useState<Map<string, { toast: ToastItem; index: number }>>(
    () => new Map(),
  );

  if (snap.key !== key) {
    const ids = new Set(toasts.map((t) => t.id));
    const removed = snap.toasts
      .map((toast, index) => ({ toast, index }))
      .filter(({ toast }) => !ids.has(toast.id));
    setSnap({ key, toasts });
    if (removed.length) {
      setLeaving((m) => {
        const n = new Map(m);
        removed.forEach((r) => n.set(r.toast.id, r));
        return n;
      });
    }
  }

  useEffect(() => {
    if (!leaving.size) return;
    const t = setTimeout(() => setLeaving(new Map()), TOAST_EXIT_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  const rendered = toasts.map((toast) => ({ toast, leaving: false }));
  [...leaving.values()]
    .sort((a, b) => a.index - b.index)
    .forEach(({ toast, index }) =>
      rendered.splice(Math.min(index, rendered.length), 0, { toast, leaving: true }),
    );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}

      <div
        role="region"
        aria-label="Notifications"
        className={twMerge('fixed z-50 flex w-80 flex-col', PLACEMENT_STYLES[placement])}
      >
        {rendered.map(({ toast, leaving: isLeaving }) => (
          <ToastEntry key={toast.id} leaving={isLeaving}>
            <Toast
              toast={toast}
              onDismiss={() => dismiss(toast.id)}
              onScheduleDismiss={(ms) => scheduleDismiss(toast.id, ms)}
              onPause={() => pause(toast.id)}
            />
          </ToastEntry>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
