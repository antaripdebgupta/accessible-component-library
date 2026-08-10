import type { ReactNode } from 'react';
import { Avatar, type AvatarProps } from './Avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '../DropdownMenu';

export interface AvatarDropdownProps extends AvatarProps {
  children: ReactNode; // DropdownMenuItem elements
  /** Accessible label for the trigger button, since the avatar itself is decorative inside it. */
  triggerLabel: string;
}

/**
 * An avatar that opens a menu on click — the common "account menu" pattern.
 * DropdownMenuTrigger expects exactly one child element and clones its own
 * trigger props (onClick, aria-expanded, aria-haspopup, ref, etc.) onto it —
 * so the actual <button> must be authored here, not passed as props to
 * DropdownMenuTrigger itself.
 */
export function AvatarDropdown({ children, triggerLabel, ...avatarProps }: AvatarDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          type="button"
          aria-label={triggerLabel}
          className="focus-ring-safe duration-fast rounded-full transition-transform outline-none hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <Avatar {...avatarProps} aria-hidden="true" role="presentation" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
AvatarDropdown.displayName = 'AvatarDropdown';
