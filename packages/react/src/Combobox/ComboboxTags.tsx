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
          className="rounded-control bg-surface-raised text-text-primary flex shrink-0 items-center gap-1 px-2 py-0.5 text-xs"
        >
          {getLabel?.(v) ?? v}
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove ${getLabel?.(v) ?? v}`}
              onClick={() => removeValue(v)}
              className="rounded-control text-text-secondary hover:text-text-primary"
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
