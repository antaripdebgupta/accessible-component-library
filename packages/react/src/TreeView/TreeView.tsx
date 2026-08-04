import { createContext, forwardRef, useContext, useMemo, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useTree, type UseTreeReturn, type TreeSelectionMode } from '@acl/primitives';

const TreeContext = createContext<UseTreeReturn | null>(null);
export function useTreeContext(): UseTreeReturn {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error('TreeItem must be used within <TreeView>');
  return ctx;
}

export const ParentContext = createContext<{ parentValue: string | null; level: number }>({
  parentValue: null,
  level: 1,
});

export interface TreeViewProps extends HTMLAttributes<HTMLDivElement> {
  'aria-label': string; // required — a tree must always have an accessible name
  selectionMode?: TreeSelectionMode;
  selected?: string | string[];
  defaultSelected?: string | string[];
  onSelectedChange?: (value: string | string[]) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (value: string[]) => void;
  id?: string;
}

export const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      selectionMode = 'single',
      selected,
      defaultSelected,
      onSelectedChange,
      expanded,
      defaultExpanded,
      onExpandedChange,
      id,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const tree = useTree({
      selectionMode,
      selected,
      defaultSelected,
      onSelectedChange,
      expanded,
      defaultExpanded,
      onExpandedChange,
      id,
    });
    const contextValue = useMemo(() => tree, [tree]);

    return (
      <TreeContext.Provider value={contextValue}>
        <div
          ref={ref}
          {...tree.getTreeProps()}
          className={twMerge('text-text-primary self-start text-sm select-none', className)}
          {...props}
        >
          <ParentContext.Provider value={{ parentValue: null, level: 1 }}>
            {children}
          </ParentContext.Provider>
        </div>
      </TreeContext.Provider>
    );
  },
);
TreeView.displayName = 'TreeView';
