import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDropdownMenuContext } from './DropdownMenu';

export interface DropdownMenuCheckboxItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect' | 'onChange'
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: ReactNode;
  textValue?: string;
}

let checkboxCounter = 0;

export const DropdownMenuCheckboxItem = forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  (
    { checked, onCheckedChange, disabled = false, icon, textValue, className, children, ...props },
    forwardedRef,
  ) => {
    const { registerItem, updateItemMeta, getItemProps } = useDropdownMenuContext();
    const innerRef = useRef<HTMLDivElement>(null);
    const value = useRef(`checkbox-${++checkboxCounter}`).current;
    const label = textValue ?? (typeof children === 'string' ? children : value);

    useLayoutEffect(() => registerItem(value, innerRef), [registerItem, value]);
    useLayoutEffect(
      () =>
        updateItemMeta(value, {
          disabled,
          label,
          onSelect: () => onCheckedChange(!checked),
          closeOnSelect: false,
        }),
      [updateItemMeta, value, disabled, label, onCheckedChange, checked],
    );

    const itemProps = getItemProps(value, disabled, 'menuitemcheckbox');

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
          {checked && <Check aria-hidden="true" size={14} />}
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
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
