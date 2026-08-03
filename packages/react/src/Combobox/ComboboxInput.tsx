import { type ChangeEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useComboboxContext } from './Combobox';
import { ComboboxTags } from './ComboboxTags';

export interface ComboboxInputProps {
  placeholder?: string;
  className?: string;
  leading?: ReactNode;
  showClearButton?: boolean;
  getTagLabel?: (value: string) => string;
}

export function ComboboxInput({
  placeholder,
  className,
  leading,
  showClearButton = true,
  getTagLabel,
}: ComboboxInputProps) {
  const {
    getInputProps,
    getClearButtonProps,
    inputRef,
    value,
    inputValue,
    multiple,
    disabled,
    invalid,
    close,
  } = useComboboxContext();

  const inputProps = getInputProps();
  const clearButtonProps = getClearButtonProps();

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : Boolean(value ?? inputValue);
  const showClear = showClearButton && hasValue && !disabled;

  return (
    <div
      className={twMerge(
        'rounded-control bg-surface flex min-h-9 w-full flex-wrap items-center gap-1.5 border px-2.5 py-1.5 text-sm',
        'focus-within:ring-accent-default/40 focus-within:ring-2',
        invalid ? 'border-danger-default' : 'border-border',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {leading && (
        <span aria-hidden="true" className="text-text-secondary shrink-0">
          {leading}
        </span>
      )}
      {multiple && <ComboboxTags getLabel={getTagLabel} />}
      <input
        {...inputProps}
        ref={inputRef}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => inputProps.onChange(e)}
        onBlur={() => {
          setTimeout(() => close(), 120);
        }}
        className="text-text-primary placeholder:text-text-secondary min-w-[4rem] flex-1 bg-transparent outline-none"
      />
      {showClear && (
        <button
          {...clearButtonProps}
          className="rounded-control text-text-secondary hover:bg-surface-raised hover:text-text-primary shrink-0 p-0.5 transition-colors"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
ComboboxInput.displayName = 'ComboboxInput';
