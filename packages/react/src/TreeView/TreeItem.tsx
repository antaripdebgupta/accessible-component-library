import {
  Children,
  forwardRef,
  useLayoutEffect,
  useRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useTreeContext, ParentContext } from './TreeView';

export interface TreeItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * A single node in the tree.
 *
 * Layout-stability contract: this node's own row NEVER unmounts and NEVER
 * moves when it or any sibling is expanded/collapsed. Its children group
 * stays mounted at all times — collapse/expand is purely a CSS Grid
 * height animation (0fr <-> 1fr), matching AccordionContent's approach.
 * Only the space strictly below this node's own row grows or shrinks.
 */
export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  ({ value, label, icon, disabled = false, className, children, ...props }, forwardedRef) => {
    const { parentValue, level } = useContext(ParentContext);
    const { registerItem, getItemProps, getGroupProps, isExpanded } = useTreeContext();
    const innerRef = useRef<HTMLDivElement>(null);

    const hasChildren = Children.count(children) > 0;
    const labelText = typeof label === 'string' ? label : String(value);

    useLayoutEffect(
      () => registerItem(value, parentValue, innerRef, disabled, hasChildren, labelText),
      [registerItem, value, parentValue, disabled, hasChildren, labelText],
    );

    const itemProps = getItemProps(value, { disabled, hasChildren, level });
    const expanded = isExpanded(value);

    return (
      <div {...props}>
        <div
          ref={(node) => {
            innerRef.current = node;
            if (typeof forwardedRef === 'function') forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          {...itemProps}
          style={{ paddingInlineStart: `${(level - 1) * 1.25 + 0.5}rem` }}
          className={twMerge(
            'flex cursor-pointer items-center gap-1.5 rounded-control py-1.5 pr-2',
            'outline-none focus-ring-safe focus-visible:outline-offset-[-2px]',
            'transition-colors duration-fast hover:bg-surface-raised motion-reduce:transition-none',
            'aria-selected:bg-accent-subtle aria-selected:font-medium aria-selected:text-text-primary',
            'aria-disabled:pointer-events-none aria-disabled:opacity-50',
            className,
          )}
        >
          {hasChildren ? (
            <ChevronRight
              aria-hidden="true"
              size={14}
              className={twMerge(
                'shrink-0 text-text-secondary transition-transform duration-base ease-out-soft motion-reduce:transition-none',
                expanded && 'rotate-90',
              )}
            />
          ) : (
            <span className="w-3.5 shrink-0" aria-hidden="true" />
          )}
          {icon && (
            <span aria-hidden="true" className="shrink-0">
              {icon}
            </span>
          )}
          <span className="truncate">{label}</span>
        </div>

        {/* Always mounted when hasChildren — never conditionally rendered.
            Height animates via grid-template-rows; inert removes it from
            focus/AT interaction while collapsed without unmounting it. */}
        {hasChildren && (
          <div
            {...getGroupProps(value)}
            inert={!expanded || undefined}
            className={twMerge(
              'grid transition-[grid-template-rows] duration-base ease-out-soft motion-reduce:transition-none',
              expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div
              className={twMerge(
                'min-h-0 overflow-hidden transition-opacity duration-base motion-reduce:transition-none',
                expanded ? 'opacity-100' : 'opacity-0',
              )}
            >
              <ParentContext.Provider value={{ parentValue: value, level: level + 1 }}>
                {children}
              </ParentContext.Provider>
            </div>
          </div>
        )}
      </div>
    );
  },
);
TreeItem.displayName = 'TreeItem';
