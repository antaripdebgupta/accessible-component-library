import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { useCombobox, type UseComboboxReturn } from '@acl/primitives';

interface ComboboxContextValue extends UseComboboxReturn {
  inputRef: RefObject<HTMLInputElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

export function useComboboxContext(): ComboboxContextValue {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error('Combobox subcomponents must be used within <Combobox>');
  return ctx;
}

export interface ComboboxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoHighlight?: boolean;
  filter?: (label: string, query: string) => boolean;
  id?: string;
  children: ReactNode;
}

export function Combobox({
  value,
  defaultValue,
  onValueChange,
  multiple,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  disabled,
  invalid,
  autoHighlight,
  filter,
  id,
  className,
  children,
  ...props
}: ComboboxProps) {
  const combobox = useCombobox({
    value,
    defaultValue,
    onValueChange,
    multiple,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    disabled,
    invalid,
    autoHighlight,
    filter,
    id,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const contextValue = useMemo<ComboboxContextValue>(
    () => ({ ...combobox, inputRef, contentRef }),
    [combobox],
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      <div className={twMerge('relative', className)} {...props}>
        {children}
      </div>
    </ComboboxContext.Provider>
  );
}
Combobox.displayName = 'Combobox';
