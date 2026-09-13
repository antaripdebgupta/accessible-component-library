import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type TextareaHTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTextarea, type UseTextareaOptions } from '@acl/primitives';
import { twMerge } from 'tailwind-merge';

const textareaVariants = cva(
  [
    'w-full min-h-[80px] rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary',
    'outline-none focus:border-2 focus:border-accent-default transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-raised',
  ],
  {
    variants: {
      variant: {
        default: 'border-border focus:border-accent-default',
        invalid: 'border-danger-default text-danger-default focus:border-danger-default',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      resize: 'vertical',
    },
  },
);

export interface TextareaProps
  extends
    Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'value' | 'defaultValue' | 'onChange' | 'onSubmit'
    >,
    VariantProps<typeof textareaVariants>,
    UseTextareaOptions {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  maxCount?: number;
  autoResize?: boolean;
  maxRows?: number;
  actionButton?: ReactNode;
  dir?: 'ltr' | 'rtl';
  className?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      wrapperClassName,
      variant: variantProp,
      resize: resizeProp,
      label,
      description,
      error,
      value: controlledValue,
      defaultValue,
      onChange,
      disabled,
      required,
      readOnly,
      maxLength,
      maxCount,
      submitOnEnter,
      onSubmit,
      id,
      autoResize = false,
      maxRows = 6,
      actionButton,
      dir = 'ltr',
      'aria-describedby': ariaDescribedby,
      ...props
    },
    forwardedRef,
  ) => {
    const isInvalid = Boolean(error) || variantProp === 'invalid';
    const computedVariant = isInvalid ? 'invalid' : (variantProp ?? 'default');
    // If autoResize is true, default resize to 'none' unless user explicitly specified resize
    const computedResize = autoResize ? (resizeProp ?? 'none') : (resizeProp ?? 'vertical');

    const {
      value,
      characterCount,
      remainingCount,
      isOverCount,
      isNearLimit,
      textareaRef,
      getTextareaProps,
    } = useTextarea({
      value: controlledValue,
      defaultValue,
      onChange,
      disabled,
      required,
      readOnly,
      maxLength,
      maxCount,
      submitOnEnter,
      onSubmit,
      id,
    });

    useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);

    const mirrorRef = useRef<HTMLDivElement | null>(null);
    const [calculatedHeight, setCalculatedHeight] = useState<number | undefined>(undefined);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-resize height calculation via shadow clone / mirror div technique
    const adjustHeight = useCallback(() => {
      if (!autoResize || !textareaRef.current || !mirrorRef.current) return;

      const textarea = textareaRef.current;
      const mirror = mirrorRef.current;

      const style = window.getComputedStyle(textarea);
      mirror.style.width = `${textarea.clientWidth}px`;
      mirror.style.fontFamily = style.fontFamily;
      mirror.style.fontSize = style.fontSize;
      mirror.style.fontWeight = style.fontWeight;
      mirror.style.lineHeight = style.lineHeight;
      mirror.style.padding = style.padding;
      mirror.style.border = style.border;
      mirror.style.boxSizing = style.boxSizing;
      mirror.style.letterSpacing = style.letterSpacing;
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.wordBreak = 'break-word';

      // Set mirror content to calculate height (add extra character for newline behavior)
      mirror.textContent = (value ?? '') + '\n';

      // Calculate row height from mirror
      const singleRowMirror = document.createElement('div');
      singleRowMirror.style.position = 'absolute';
      singleRowMirror.style.visibility = 'hidden';
      singleRowMirror.style.fontFamily = style.fontFamily;
      singleRowMirror.style.fontSize = style.fontSize;
      singleRowMirror.style.lineHeight = style.lineHeight;
      singleRowMirror.style.padding = style.padding;
      singleRowMirror.style.boxSizing = style.boxSizing;
      singleRowMirror.textContent = 'A';
      document.body.appendChild(singleRowMirror);
      const singleRowHeight = singleRowMirror.clientHeight;
      document.body.removeChild(singleRowMirror);

      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;
      const borderTop = parseFloat(style.borderTopWidth) || 0;
      const borderBottom = parseFloat(style.borderBottomWidth) || 0;

      const contentHeight = mirror.scrollHeight;
      const maxAllowedHeight =
        (singleRowHeight - paddingTop - paddingBottom) * maxRows +
        paddingTop +
        paddingBottom +
        borderTop +
        borderBottom;

      const targetHeight = Math.min(contentHeight, maxAllowedHeight);
      setCalculatedHeight(targetHeight);
    }, [autoResize, value, maxRows]);

    // Track typing status to gate transition-height (avoiding lag while typing)
    const handleInputOrKeyDown = () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 300);
    };

    useEffect(() => {
      adjustHeight();
    }, [adjustHeight, value]);

    useEffect(() => {
      return () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, []);

    const textareaProps = getTextareaProps();
    const textareaId = textareaProps.id;
    const descriptionId = description ? `${textareaId}-description` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const counterId = maxCount || maxLength ? `${textareaId}-counter` : undefined;

    const combinedDescribedBy = [ariaDescribedby, descriptionId, errorId, counterId]
      .filter(Boolean)
      .join(' ');

    const limit = maxCount ?? maxLength;

    return (
      <div className={twMerge('flex w-full flex-col gap-1.5', wrapperClassName)} dir={dir}>
        {label && (
          <label htmlFor={textareaId} className="text-text-primary text-sm font-medium select-none">
            {label}
            {required && (
              <span className="text-danger-default ms-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex w-full flex-col">
          <textarea
            ref={textareaRef}
            {...props}
            {...textareaProps}
            aria-invalid={isInvalid ? true : undefined}
            aria-describedby={combinedDescribedBy || undefined}
            onInput={(e) => {
              handleInputOrKeyDown();
              props.onInput?.(e);
            }}
            onKeyDown={(e) => {
              handleInputOrKeyDown();
              textareaProps.onKeyDown(e);
              props.onKeyDown?.(e);
            }}
            style={{
              ...(calculatedHeight ? { height: `${calculatedHeight}px` } : {}),
              ...props.style,
            }}
            className={twMerge(
              textareaVariants({ variant: computedVariant, resize: computedResize }),
              actionButton && 'pb-10', // Reserve space for embedded action button
              autoResize && !isTyping && 'transition-[height] duration-150',
              dir === 'rtl' && 'text-right',
              className,
            )}
          />

          {/* Hidden Mirror DIV for height measurement */}
          {autoResize && (
            <div
              ref={mirrorRef}
              aria-hidden="true"
              className="pointer-events-none invisible absolute top-0 left-0 -z-50 overflow-hidden break-words whitespace-pre-wrap"
            />
          )}

          {/* Integrated Action Button (e.g. Chat submit button) */}
          {actionButton && (
            <div
              className={twMerge(
                'absolute bottom-2.5 flex items-center gap-1',
                dir === 'rtl' ? 'left-2.5' : 'right-2.5',
              )}
            >
              {actionButton}
            </div>
          )}
        </div>

        {/* Footer info: Description, Error message, Character Counter */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex flex-col gap-0.5">
            {description && (
              <span id={descriptionId} className="text-text-secondary">
                {description}
              </span>
            )}
            {error && (
              <span id={errorId} className="text-danger-default font-medium">
                {error}
              </span>
            )}
          </div>

          {limit !== undefined && (
            <span
              id={counterId}
              aria-live={isNearLimit || isOverCount ? 'polite' : 'off'}
              className={twMerge(
                'ms-auto shrink-0 font-mono text-xs select-none',
                isOverCount ? 'text-danger-default font-semibold' : 'text-text-secondary',
              )}
            >
              {characterCount}/{limit}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
