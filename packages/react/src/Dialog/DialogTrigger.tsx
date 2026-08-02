import { cloneElement, isValidElement, type MouseEvent, type ReactElement } from 'react';
import { useDialogContext } from './Dialog';

export interface DialogTriggerProps {
  /** Must be a single real, ref-forwarding element (e.g. <button>). */
  children: ReactElement;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  const { getTriggerProps, triggerRef } = useDialogContext();

  if (!isValidElement(children)) {
    throw new Error('DialogTrigger expects a single valid React element as its child');
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
  });
}
DialogTrigger.displayName = 'DialogTrigger';
