import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAccordionContext } from './Accordion';
import { useItemValue, useItemDisabled } from './AccordionItem';

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * Renders the heading + trigger button per APG guidance:
 * <h3><button aria-expanded aria-controls>...</button></h3>
 */
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { getTriggerProps, isOpen } = useAccordionContext();
    const value = useItemValue();
    const disabled = useItemDisabled();
    const triggerProps = getTriggerProps(value, disabled);
    const open = isOpen(value);

    return (
      <h3 className="m-0">
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          className={twMerge(
            'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium',
            'rounded-control outline-none focus-ring-safe',
            'text-text-primary transition-colors duration-fast hover:bg-surface-raised motion-reduce:transition-none',
            'disabled:pointer-events-none disabled:opacity-50',
            'aria-disabled:pointer-events-none aria-disabled:opacity-50',
            className,
          )}
          {...triggerProps}
          {...props}
        >
          <span>{children}</span>
          <ChevronDown
            aria-hidden="true"
            size={16}
            className={twMerge(
              'shrink-0 text-text-secondary transition-transform duration-base ease-out-soft motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        </button>
      </h3>
    );
  },
);
AccordionTrigger.displayName = 'AccordionTrigger';
