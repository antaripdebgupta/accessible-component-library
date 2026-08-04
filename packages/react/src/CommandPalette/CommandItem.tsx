import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCommandPaletteContext } from './CommandPalette';

export interface CommandItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  textValue?: string;
  onSelect?: () => void;
}

export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  (
    { value, disabled = false, icon, textValue, onSelect, className, children, ...props },
    forwardedRef,
  ) => {
    const { registerItem, updateItemMeta, getItemProps, highlightedValue } =
      useCommandPaletteContext();
    const innerRef = useRef<HTMLDivElement>(null);
    const label = textValue ?? (typeof children === 'string' ? children : value);

    useLayoutEffect(() => registerItem(value, innerRef), [registerItem, value]);
    useLayoutEffect(
      () => updateItemMeta(value, { disabled, label, onSelect: () => onSelect?.() }),
      [updateItemMeta, value, disabled, label, onSelect],
    );

    const itemProps = getItemProps(value, disabled);
    const highlighted = highlightedValue === value;

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        {...itemProps}
        data-highlighted={highlighted || undefined}
        className={twMerge(
          'rounded-control flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm outline-none select-none',
          'text-text-primary duration-fast transition-colors motion-reduce:transition-none',
          'hover:bg-surface-raised data-[highlighted=true]:bg-surface-raised',
          'aria-disabled:pointer-events-none aria-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )}
        <span className="flex-1">{children}</span>
      </div>
    );
  },
);
CommandItem.displayName = 'CommandItem';
