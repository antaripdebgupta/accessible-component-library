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
        'relative flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 focus-within:after:absolute focus-within:after:bottom-0 focus-within:after:left-0 focus-within:after:right-0 focus-within:after:h-[2px] focus-within:after:bg-focus-ring',
        className,
      )}
    >
      <Search size={16} aria-hidden="true" className="shrink-0 text-text-secondary" />
      <input
        {...inputProps}
        ref={inputRef}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => inputProps.onChange(e)}
        className="flex-1 bg-transparent text-base text-text-primary outline-none placeholder:text-text-secondary"
      />
    </div>
  );
}
CommandInput.displayName = 'CommandInput';
