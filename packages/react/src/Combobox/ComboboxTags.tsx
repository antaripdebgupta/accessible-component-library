import { X } from 'lucide-react';
import { useComboboxContext } from './Combobox';

export interface ComboboxTagsProps {
  getLabel?: (value: string) => string;
}

export function ComboboxTags({ getLabel }: ComboboxTagsProps) {
  const { value, multiple, removeValue, disabled } = useComboboxContext();
  if (!multiple || !Array.isArray(value) || value.length === 0) return null;

  return (
    <>
      {value.map((v) => (
        <span
          key={v}
          className="flex shrink-0 items-center gap-1 rounded-control bg-surface-raised px-2 py-0.5 text-xs text-text-primary"
        >
          {getLabel?.(v) ?? v}
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove ${getLabel?.(v) ?? v}`}
              onClick={() => removeValue(v)}
              className="relative flex h-4 w-4 items-center justify-center rounded-control text-text-secondary transition-colors duration-fast before:absolute before:-inset-1 before:content-[''] hover:text-text-primary motion-reduce:transition-none"
            >
              <X size={12} aria-hidden="true" />
            </button>
          )}
        </span>
      ))}
    </>
  );
}
ComboboxTags.displayName = 'ComboboxTags';
