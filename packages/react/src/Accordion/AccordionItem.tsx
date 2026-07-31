import { createContext, forwardRef, useContext, useEffect, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAccordionContext, useAccordionVariant } from './Accordion';

const ItemValueContext = createContext<string | null>(null);
const ItemDisabledContext = createContext(false);
export function useItemValue(): string {
  const v = useContext(ItemValueContext);
  if (v === null) throw new Error('AccordionTrigger/Content must be used within <AccordionItem>');
  return v;
}
export function useItemDisabled(): boolean {
  return useContext(ItemDisabledContext);
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, className, children, ...props }, ref) => {
    const { registerItem, setItemDisabled } = useAccordionContext();
    const variant = useAccordionVariant();

    useEffect(() => registerItem(value, disabled), [registerItem, value, disabled]);
    useEffect(() => setItemDisabled(value, disabled), [setItemDisabled, value, disabled]);

    return (
      <ItemValueContext.Provider value={value}>
        <ItemDisabledContext.Provider value={disabled}>
          <div
            ref={ref}
            data-disabled={disabled || undefined}
            className={twMerge(
              // default/border variants: divide-y on the parent already
              // draws lines between items — nothing extra needed here, and
              // no border ever touches the first item, so its position
              // never shifts regardless of open/closed state.
              variant === 'card' && 'rounded-popover border-border bg-surface border',
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </ItemDisabledContext.Provider>
      </ItemValueContext.Provider>
    );
  },
);
AccordionItem.displayName = 'AccordionItem';
