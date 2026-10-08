import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useRadioGroupContext } from './RadioGroup';
import { twMerge } from 'tailwind-merge';

export interface RadioGroupItemProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'checked' | 'onChange'
> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, label, description, disabled, ...props }, forwardedRef) => {
    const group = useRadioGroupContext();
    const innerRef = useRef<HTMLInputElement>(null);

    const isChecked = group.value === value;
    const isItemDisabled = disabled || group.groupDisabled;

    useLayoutEffect(() => {
      return group.registerItem(value, {
        disabled: !!disabled,
        ref: innerRef,
      });
    }, [group, value, disabled]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      group.handleKeyDown(e, value);
      props.onKeyDown?.(e);
    };

    const handleChange = () => {
      group.selectValue(value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      group.setFocusedValue(value);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (group.focusedValue === value) {
        group.setFocusedValue(undefined);
      }
      props.onBlur?.(e);
    };

    const descriptionId = description ? `${group.name}-${value}-description` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          className={twMerge(
            'inline-flex cursor-pointer select-none items-start gap-3',
            'min-h-[44px] py-3.5',
            isItemDisabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              ref={(node) => {
                innerRef.current = node;
                if (typeof forwardedRef === 'function') forwardedRef(node);
                else if (forwardedRef) forwardedRef.current = node;
              }}
              type="radio"
              name={group.name}
              checked={isChecked}
              disabled={isItemDisabled}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-describedby={descriptionId}
              className="peer absolute inset-0 m-0 h-4 w-4 cursor-pointer appearance-none rounded-full border border-border-control bg-surface outline-none focus-ring-safe"
              {...props}
            />
            <span
              aria-hidden="true"
              className={twMerge(
                'pointer-events-none absolute inset-0 flex h-4 w-4 items-center justify-center rounded-full border transition-[background-color,border-color] duration-fast motion-reduce:transition-none',
                isItemDisabled && 'transition-none',
                isChecked
                  ? 'border-accent-default bg-accent-default'
                  : 'border-border-control bg-surface',
              )}
            >
              <span
                aria-hidden="true"
                className={twMerge(
                  'h-1.5 w-1.5 rounded-full bg-text-inverse transition-[scale,opacity] motion-reduce:transition-none',
                  isChecked
                    ? 'scale-100 opacity-100 duration-base ease-out-soft'
                    : 'scale-0 opacity-0 duration-fast ease-in-quick',
                )}
              />
            </span>
          </div>

          {label && (
            <span className="mt-1 text-sm font-medium leading-none text-text-primary">{label}</span>
          )}
        </label>

        {description && (
          <span id={descriptionId} className="-mt-2 pl-8 text-xs text-text-secondary">
            {description}
          </span>
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';
