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
            'py-control-md px-control-md flex w-full items-center justify-between gap-3 text-left text-sm font-medium',
            'focus-ring-safe rounded-control outline-none',
            'text-text-primary hover:bg-surface-raised duration-fast transition-colors motion-reduce:transition-none',
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
            size={18}
            className={twMerge(
              'text-text-secondary duration-base ease-out-soft shrink-0 transition-transform motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        </button>
      </h3>
    );
  },
);
AccordionTrigger.displayName = 'AccordionTrigger';
