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
        'field-surface flex h-ctl-md w-full items-center gap-1.5 px-2.5 text-sm',
        className,
      )}
    >
      {leading && (
        <span aria-hidden="true" className="shrink-0 text-text-secondary">
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
        className="min-w-[4rem] flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-secondary"
      />
      {showClear && (
        <button
          {...clearButtonProps}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
ComboboxInput.displayName = 'ComboboxInput';
