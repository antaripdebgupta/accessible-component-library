import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDropdownMenuContext } from './DropdownMenu';
import { useDropdownMenuSubContext } from './DropdownMenuSub';

export interface DropdownMenuSubTriggerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  disabled?: boolean;
  icon?: ReactNode;
  textValue?: string;
}

let subTriggerCounter = 0;

export const DropdownMenuSubTrigger = forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ disabled = false, icon, textValue, className, children, ...props }, forwardedRef) => {
    const parent = useDropdownMenuContext();
    const sub = useDropdownMenuSubContext();
    const innerRef = useRef<HTMLDivElement>(null);
    const value = useRef(`submenu-${++subTriggerCounter}`).current;
    const label = textValue ?? (typeof children === 'string' ? children : value);

    useLayoutEffect(() => parent.registerItem(value, innerRef), [parent, value]);
    useLayoutEffect(
      () =>
        parent.updateItemMeta(value, {
          disabled,
          label,
          onSelect: () => sub.setOpen(true),
          closeOnSelect: false,
        }),
      [parent, sub, value, disabled, label],
    );

    const itemProps = parent.getItemProps(value, disabled, 'menuitem');

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          sub.triggerRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        {...itemProps}
        aria-haspopup="menu"
        aria-expanded={sub.open}
        data-active={itemProps.tabIndex === 0 || undefined}
        className={twMerge(
          'rounded-control relative flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm outline-none select-none',
          'text-text-primary duration-fast transition-colors motion-reduce:transition-none',
          'hover:bg-surface-raised focus-visible:bg-surface-raised data-[active=true]:bg-surface-raised',
          'aria-disabled:pointer-events-none aria-disabled:opacity-50',
          className,
        )}
        onClick={(e: MouseEvent) => {
          //console.log("SubTrigger onClick, disabled:", disabled, "sub.open before:", sub.open);
          itemProps.onClick();
          sub.setOpen(true);
          //console.log("SubTrigger onClick, sub.open after setOpen call:", sub.open);
        }}
        onKeyDown={(e: KeyboardEvent) => {
          itemProps.onKeyDown(e);
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            sub.setOpen(true);
          }
        }}
        onMouseEnter={(e: MouseEvent) => {
          itemProps.onMouseEnter(e);
          if (!disabled && (e.movementX !== 0 || e.movementY !== 0)) {
            sub.setOpen(true);
          }
        }}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )}
        {children}
        <ChevronRight aria-hidden="true" size={14} className="ml-auto shrink-0" />
      </div>
    );
  },
);
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';
