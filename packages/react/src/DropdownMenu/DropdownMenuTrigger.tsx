import {
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { useDropdownMenuContext } from './DropdownMenu';

export interface DropdownMenuTriggerProps {
  children: ReactElement;
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { getTriggerProps, triggerRef } = useDropdownMenuContext();

  if (!isValidElement(children)) {
    throw new Error('DropdownMenuTrigger expects a single valid React element as its child');
  }

  const triggerProps = getTriggerProps();
  const child = children as ReactElement<any>;
  const childRef = (child as any).ref;

  return cloneElement(child, {
    ...triggerProps,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof childRef === 'function') childRef(node);
      else if (childRef) childRef.current = node;
    },
    onClick: (e: MouseEvent) => {
      child.props.onClick?.(e);
      triggerProps.onClick();
    },
    onKeyDown: (e: KeyboardEvent) => {
      child.props.onKeyDown?.(e);
      triggerProps.onKeyDown(e);
    },
  });
}
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
