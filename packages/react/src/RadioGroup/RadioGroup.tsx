import {
  createContext,
  useContext,
  useMemo,
  type FieldsetHTMLAttributes,
  type ReactNode,
} from 'react';
import { useRadioGroup, type UseRadioGroupReturn } from '@acl/primitives';
import { twMerge } from 'tailwind-merge';

interface RadioGroupContextValue extends UseRadioGroupReturn {}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext() {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroup subcomponents must be used within <RadioGroup>');
  }
  return context;
}

export interface RadioGroupProps extends Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'onChange'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  responsive?: boolean;
  label?: ReactNode;
}

export function RadioGroup({
  children,
  className,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
  orientation = 'vertical',
  dir = 'ltr',
  responsive = false,
  label,
  ...props
}: RadioGroupProps) {
  const radioGroup = useRadioGroup({
    value,
    defaultValue,
    onValueChange,
    disabled,
    name,
    orientation,
    dir,
  });

  const contextValue = useMemo(() => radioGroup, [radioGroup]);

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <fieldset
        role="radiogroup"
        {...props}
        className={twMerge(
          'm-0 flex gap-4 border-none p-0',
          orientation === 'vertical'
            ? 'flex-col'
            : responsive
              ? 'flex-col sm:flex-row sm:items-center'
              : 'flex-row items-center',
          className,
        )}
      >
        {label && (
          <legend className="text-text-primary mb-2 text-sm font-semibold select-none">
            {label}
          </legend>
        )}
        {children}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}
RadioGroup.displayName = 'RadioGroup';
