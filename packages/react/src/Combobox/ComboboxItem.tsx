import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useComboboxContext } from './Combobox';

export interface ComboboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
  textValue?: string;
}

export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  (
    { value, disabled = false, group, icon, textValue, className, children, ...props },
    forwardedRef,
  ) => {
    const { registerItem, updateItemMeta, getItemProps, isMatch, isSelected, highlightedValue } =
      useComboboxContext();
    const innerRef = useRef<HTMLDivElement>(null);
    const label = textValue ?? (typeof children === 'string' ? children : value);

    useLayoutEffect(() => registerItem(value, innerRef), [registerItem, value]);
    useLayoutEffect(
      () => updateItemMeta(value, { disabled, label, group }),
      [updateItemMeta, value, disabled, label, group],
    );

    if (!isMatch(value)) return null;

    const itemProps = getItemProps(value, disabled);
    const selected = isSelected(value);
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
          'menu-item relative flex select-none items-center gap-2 outline-none',
          'text-text-primary',
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
        {selected && (
          <Check aria-hidden="true" size={14} className="shrink-0 text-accent-default" />
        )}
      </div>
    );
  },
);
ComboboxItem.displayName = 'ComboboxItem';
