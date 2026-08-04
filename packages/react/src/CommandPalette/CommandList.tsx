import { forwardRef, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCommandPaletteContext } from './CommandPalette';

export interface CommandListProps extends HTMLAttributes<HTMLDivElement> {}

export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, ...props }, ref) => {
    const { getListProps } = useCommandPaletteContext();
    const listProps = getListProps();

    return (
      <div
        ref={ref}
        {...listProps}
        className={twMerge('flex-1 overflow-y-auto p-1', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandList.displayName = 'CommandList';
