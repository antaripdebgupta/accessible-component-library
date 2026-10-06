import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useTabsContext } from './Tabs';

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, scrollable = false, children, ...props }, ref) => {
    const { listProps, orientation, selectedValue } = useTabsContext();
    const listRef = useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = useState({ start: 0, size: 0 });

    useEffect(() => {
      const list = listRef.current;
      if (!list) return;
      const activeEl = list.querySelector<HTMLElement>('[data-state="active"]');
      if (!activeEl) return;

      if (orientation === 'horizontal') {
        setIndicator({ start: activeEl.offsetLeft, size: activeEl.offsetWidth });
      } else {
        setIndicator({ start: activeEl.offsetTop, size: activeEl.offsetHeight });
      }
    }, [selectedValue, orientation]);

    return (
      <div
        ref={(node) => {
          listRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...listProps}
        className={twMerge(
          'relative flex gap-1 border-border',
          orientation === 'horizontal' ? 'flex-row border-b' : 'shrink-0 flex-col border-r pr-2',
          scrollable &&
            orientation === 'horizontal' &&
            'scrollbar-thin overflow-x-auto scroll-smooth',
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className={twMerge(
            'absolute bg-accent-default transition-[left,width,top,height] duration-base ease-out-soft motion-reduce:transition-none',
            orientation === 'horizontal' ? 'bottom-0 h-0.5' : 'right-0 w-0.5',
          )}
          style={
            orientation === 'horizontal'
              ? { left: indicator.start, width: indicator.size }
              : { top: indicator.start, height: indicator.size }
          }
        />
      </div>
    );
  },
);
TabsList.displayName = 'TabsList';
