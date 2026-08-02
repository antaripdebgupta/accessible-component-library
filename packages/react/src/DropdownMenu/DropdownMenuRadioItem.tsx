import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Circle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDropdownMenuContext } from './DropdownMenu';
import { useRadioGroupContext } from './DropdownMenuRadioGroup';

export interface DropdownMenuRadioItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  textValue?: string;
}

export const DropdownMenuRadioItem = forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ value, disabled = false, icon, textValue, className, children, ...props }, forwardedRef) => {
    const { registerItem, updateItemMeta, getItemProps } = useDropdownMenuContext();
    const { value: groupValue, onValueChange } = useRadioGroupContext();
    const innerRef = useRef<HTMLDivElement>(null);
    const label = textValue ?? (typeof children === 'string' ? children : value);
    const checked = groupValue === value;

    useLayoutEffect(() => registerItem(value, innerRef), [registerItem, value]);
    useLayoutEffect(
      () =>
        updateItemMeta(value, {
          disabled,
          label,
          onSelect: () => onValueChange(value),
          closeOnSelect: false,
        }),
      [updateItemMeta, value, disabled, label, onValueChange],
    );

    const itemProps = getItemProps(value, disabled, 'menuitemradio');

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        {...itemProps}
        aria-checked={checked}
        data-active={itemProps.tabIndex === 0 || undefined}
        className={twMerge(
          'rounded-control relative flex cursor-pointer items-center gap-2 py-1.5 pr-2 pl-8 text-sm outline-none select-none',
          'text-text-primary data-[active=true]:bg-surface-raised',
          'aria-disabled:pointer-events-none aria-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
          {checked && <Circle aria-hidden="true" size={8} className="fill-current" />}
        </span>
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
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
