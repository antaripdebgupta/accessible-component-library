import { Children, useMemo, type ReactNode } from 'react';

export interface UseAvatarGroupOptions {
  children: ReactNode;
  /** Max avatars to show before collapsing the rest into a "+N" overflow avatar. */
  max?: number;
}

/**
 * Splits children into the visible slice and an overflow count, so the
 * consumer can render N real avatars plus a single "+N" summary avatar
 * rather than rendering (and hiding) every avatar in the DOM.
 */
export function useAvatarGroup({ children, max }: UseAvatarGroupOptions) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const total = items.length;

  const visible = max && max > 0 ? items.slice(0, max) : items;
  const overflowCount = max && max > 0 ? Math.max(0, total - max) : 0;

  return { visibleItems: visible, overflowCount, total };
}

export type UseAvatarGroupReturn = ReturnType<typeof useAvatarGroup>;
