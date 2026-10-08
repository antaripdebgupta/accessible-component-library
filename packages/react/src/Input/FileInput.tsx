import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useStableId } from '@antarip/utils';
import { twMerge } from 'tailwind-merge';
import { UploadCloud, File, X } from 'lucide-react';

export interface FileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  onFilesSelected?: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  dir?: 'ltr' | 'rtl';
  className?: string;
  dropzoneText?: ReactNode;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      label,
      description,
      error,
      onFilesSelected,
      accept,
      multiple = false,
      disabled = false,
      required = false,
      id,
      dir = 'ltr',
      dropzoneText = 'Drag & drop files here, or click to browse',
      'aria-describedby': ariaDescribedby,
      ...props
    },
    forwardedRef,
  ) => {
    const stableId = useStableId(id ?? 'file-input');
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const isInvalid = Boolean(error);
    const descriptionId = description ? `${stableId}-description` : undefined;
    const errorId = error ? `${stableId}-error` : undefined;
    const combinedDescribedBy = [ariaDescribedby, descriptionId, errorId].filter(Boolean).join(' ');

    const handleFileChange = (files: FileList | null) => {
      if (!files) return;
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      onFilesSelected?.(files);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleFileChange(e.target.files);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        try {
          if (inputRef.current) {
            inputRef.current.files = e.dataTransfer.files;
          }
        } catch {
          // Safe catch for environment DOM file assignment quirks
        }
        handleFileChange(e.dataTransfer.files);
      }
    };

    const clearFiles = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setSelectedFiles([]);
      onFilesSelected?.(null);
    };

    return (
      <div className={twMerge('flex w-full flex-col gap-1.5', className)} dir={dir}>
        {label && (
          <label htmlFor={stableId} className="select-none text-sm font-medium text-text-primary">
            {label}
            {required && (
              <span className="ms-1 text-danger-default" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && inputRef.current) {
              inputRef.current.click();
            }
          }}
          className={twMerge(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-fast motion-reduce:transition-none',
            'bg-surface hover:bg-surface-raised',
            isDragging
              ? 'border-accent-default bg-accent-subtle/20'
              : isInvalid
                ? 'border-danger-default bg-danger-subtle/10'
                : 'border-border',
            disabled && 'cursor-not-allowed bg-surface-raised opacity-50',
            isFocused && 'border-accent-default ring-2 ring-accent-default',
          )}
        >
          <input
            ref={inputRef}
            id={stableId}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            required={required}
            aria-invalid={isInvalid ? true : undefined}
            aria-describedby={combinedDescribedBy || undefined}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="sr-only"
            {...props}
          />

          <UploadCloud className="mb-2 h-8 w-8 text-text-secondary" />
          <p className="text-center text-sm font-medium text-text-primary">{dropzoneText}</p>
          {accept && <p className="mt-1 text-xs text-text-secondary">Accepted types: {accept}</p>}
        </div>

        {/* Selected file(s) list display */}
        {selectedFiles.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between rounded border border-border bg-surface-raised p-2 text-xs text-text-primary"
              >
                <div className="flex items-center gap-2 truncate">
                  <File className="h-4 w-4 shrink-0 text-text-secondary" />
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-text-secondary">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                  }}
                  aria-label={`Remove file ${file.name}`}
                  className="rounded p-1 text-text-secondary focus-ring-safe hover:text-danger-default"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {description && (
          <span id={descriptionId} className="text-xs text-text-secondary">
            {description}
          </span>
        )}

        {error && (
          <span id={errorId} className="text-xs font-medium text-danger-default">
            {error}
          </span>
        )}
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';
