import { useId, type HTMLAttributes, type ReactNode } from 'react';

export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
  heading: ReactNode;
}

export function CommandGroup({ heading, children, ...props }: CommandGroupProps) {
  const headingId = useId();
  return (
    <div role="group" aria-labelledby={headingId} {...props}>
      <div id={headingId} className="text-text-secondary px-2 py-1.5 text-xs font-semibold">
        {heading}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
CommandGroup.displayName = 'CommandGroup';
