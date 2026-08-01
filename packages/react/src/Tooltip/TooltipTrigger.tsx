import {
  cloneElement,
  isValidElement,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { useTooltipContext } from './Tooltip';

export interface TooltipTriggerProps {
  children: ReactElement;
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { getTriggerProps, triggerRef } = useTooltipContext();

  if (!isValidElement(children)) {
    throw new Error('TooltipTrigger expects a single valid React element as its child');
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
    onMouseEnter: (e: MouseEvent) => {
      child.props.onMouseEnter?.(e);
      triggerProps.onMouseEnter(e);
    },
    onMouseLeave: (e: MouseEvent) => {
      child.props.onMouseLeave?.(e);
      triggerProps.onMouseLeave(e);
    },
    onFocus: (e: FocusEvent) => {
      child.props.onFocus?.(e);
      triggerProps.onFocus(e);
    },
    onBlur: (e: FocusEvent) => {
      child.props.onBlur?.(e);
      triggerProps.onBlur(e);
    },
  });
}
TooltipTrigger.displayName = 'TooltipTrigger';
