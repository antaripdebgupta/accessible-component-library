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
            'inline-flex cursor-pointer items-start gap-3 select-none',
            'min-h-[44px] py-3.5', // Touch target expansion
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
              className="peer border-border focus-ring-safe bg-surface absolute inset-0 m-0 h-4 w-4 cursor-pointer appearance-none rounded-full border outline-none"
              {...props}
            />
            {/* Custom Visual Radio Indicator */}
            <span
              aria-hidden="true"
              className={twMerge(
                'duration-fast pointer-events-none absolute inset-0 flex h-4 w-4 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none',
                isChecked
                  ? 'border-accent-default bg-accent-default text-text-inverse'
                  : 'border-border bg-surface',
              )}
            >
              {isChecked && <span className="bg-surface h-1.5 w-1.5 rounded-full" />}
            </span>
          </div>

          {label && (
            <span className="text-text-primary mt-1 text-sm leading-none font-medium">{label}</span>
          )}
        </label>

        {description && (
          <span id={descriptionId} className="text-text-secondary -mt-2 pl-8 text-xs">
            {description}
          </span>
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';
