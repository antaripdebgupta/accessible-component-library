import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useDropdownMenuContext } from './DropdownMenu';

export interface DropdownMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
  textValue?: string;
  onSelect?: () => void;
}

let itemCounter = 0;

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  (
    {
      disabled = false,
      destructive = false,
      icon,
      textValue,
      onSelect,
      className,
      children,
      ...props
    },
    forwardedRef,
  ) => {
    const { registerItem, updateItemMeta, getItemProps } = useDropdownMenuContext();
    const innerRef = useRef<HTMLDivElement>(null);
    const value = useRef(`item-${++itemCounter}`).current;
    const label = textValue ?? (typeof children === 'string' ? children : value);

    useLayoutEffect(() => registerItem(value, innerRef), [registerItem, value]);
    useLayoutEffect(
      () =>
        updateItemMeta(value, {
          disabled,
          label,
          onSelect: () => onSelect?.(),
          closeOnSelect: true,
        }),
      [updateItemMeta, value, disabled, label, onSelect],
    );

    const itemProps = getItemProps(value, disabled, 'menuitem');

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        {...itemProps}
        data-active={itemProps.tabIndex === 0 || undefined}
        className={twMerge(
          'rounded-control relative flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm outline-none select-none',
          'text-text-primary duration-fast transition-colors motion-reduce:transition-none',
          'hover:bg-surface-raised focus-visible:bg-surface-raised data-[active=true]:bg-surface-raised',
          destructive &&
            'text-danger-default hover:bg-danger-subtle focus-visible:bg-danger-subtle data-[active=true]:bg-danger-subtle',
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
        {children}
      </div>
    );
  },
);
DropdownMenuItem.displayName = 'DropdownMenuItem';
