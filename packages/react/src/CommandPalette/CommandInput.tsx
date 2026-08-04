import { type ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useCommandPaletteContext } from './CommandPalette';

export interface CommandInputProps {
  placeholder?: string;
  className?: string;
}

export function CommandInput({
  placeholder = 'Type a command or search...',
  className,
}: CommandInputProps) {
  const { getInputProps, inputRef } = useCommandPaletteContext();
  const inputProps = getInputProps();

  return (
    <div
      className={twMerge(
        'border-border flex shrink-0 items-center gap-2 border-b px-4 py-3',
        className,
      )}
    >
      <Search size={16} aria-hidden="true" className="text-text-secondary shrink-0" />
      <input
        {...inputProps}
        ref={inputRef}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => inputProps.onChange(e)}
        className="text-text-primary placeholder:text-text-secondary flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}
CommandInput.displayName = 'CommandInput';
