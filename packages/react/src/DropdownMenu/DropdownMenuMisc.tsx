import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={twMerge('bg-border my-1 h-px', className)}
      {...props}
    />
  );
}
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export function DropdownMenuLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge('text-text-secondary px-2 py-1.5 text-xs font-semibold', className)}
      {...props}
    />
  );
}
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export function DropdownMenuShortcut({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={twMerge('text-text-secondary ml-auto pl-4 text-xs tracking-widest', className)}
      {...props}
    />
  );
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export function DropdownMenuGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="group" className={className} {...props} />;
}
DropdownMenuGroup.displayName = 'DropdownMenuGroup';
