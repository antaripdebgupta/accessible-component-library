import { createContext, forwardRef, useContext, useMemo, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { useAccordion, type UseAccordionReturn, type AccordionType } from '@acl/primitives';
import { useDirection } from '@acl/utils';

const AccordionContext = createContext<UseAccordionReturn | null>(null);
export function useAccordionContext(): UseAccordionReturn {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion subcomponents must be used within <Accordion>');
  return ctx;
}

const AccordionVariantContext = createContext<'default' | 'border' | 'card'>('default');
export function useAccordionVariant() {
  return useContext(AccordionVariantContext);
}

const accordionStyles = cva('w-full flow-root', {
  variants: {
    variant: {
      default: 'divide-y divide-border ',
      border: 'divide-y divide-border rounded-popover border border-border',
      card: 'flex flex-col gap-2',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface AccordionProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof accordionStyles> {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  dir?: 'ltr' | 'rtl';
  id?: string;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = 'single',
      value,
      defaultValue,
      onValueChange,
      collapsible = true,
      variant = 'default',
      dir: dirProp,
      id,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const accordion = useAccordion({ type, value, defaultValue, onValueChange, collapsible, id });
    const contextValue = useMemo(() => accordion, [accordion]);
    const detectedDir = useDirection();
    const dir = dirProp ?? detectedDir;

    return (
      <AccordionContext.Provider value={contextValue}>
        <AccordionVariantContext.Provider value={variant ?? 'default'}>
          <div
            ref={ref}
            dir={dir}
            className={twMerge(accordionStyles({ variant }), className)}
            {...props}
          >
            {children}
          </div>
        </AccordionVariantContext.Provider>
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = 'Accordion';
