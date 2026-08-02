import { createContext, useContext, type HTMLAttributes, type ReactNode } from 'react';

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext(): RadioGroupContextValue {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error('DropdownMenuRadioItem must be used within <DropdownMenuRadioGroup>');
  return ctx;
}

export interface DropdownMenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
  ...props
}: DropdownMenuRadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div role="group" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
