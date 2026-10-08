import { forwardRef, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAccordionContext } from './Accordion';
import { useItemValue } from './AccordionItem';

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { getPanelProps, isOpen } = useAccordionContext();
    const value = useItemValue();
    const panelProps = getPanelProps(value);
    const open = isOpen(value);

    return (
      <div
        ref={ref}
        {...panelProps}
        // grid-rows animates from 0fr -> 1fr smoothly without a fixed height,
        // and content stays in the DOM (readable by AT) while collapsed —
        // rather than unmounting, which would break aria-controls targeting.
        className={twMerge(
          'grid transition-[grid-template-rows] duration-base ease-out-soft motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          className,
        )}
        hidden={false}
        {...props}
      >
        <div
          className={twMerge(
            'overflow-hidden transition-opacity duration-base motion-reduce:transition-none',
            open ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="px-control-md pb-control-md text-sm text-text-secondary">{children}</div>
        </div>
      </div>
    );
  },
);
AccordionContent.displayName = 'AccordionContent';
