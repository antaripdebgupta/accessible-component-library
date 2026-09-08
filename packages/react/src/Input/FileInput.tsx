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
import { useStableId } from '@acl/utils';
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
          <label htmlFor={stableId} className="text-text-primary text-sm font-medium select-none">
            {label}
            {required && (
              <span className="text-danger-default ms-1" aria-hidden="true">
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
            'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-150',
            'bg-surface hover:bg-surface-subtle',
            isDragging
              ? 'border-accent-default bg-accent-subtle/20'
              : isInvalid
                ? 'border-danger-default bg-danger-subtle/10'
                : 'border-border',
            disabled && 'bg-surface-subtle cursor-not-allowed opacity-50',
            isFocused && 'ring-accent-default border-accent-default ring-2',
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

          <UploadCloud className="text-text-muted mb-2 h-8 w-8" />
          <p className="text-text-primary text-center text-sm font-medium">{dropzoneText}</p>
          {accept && <p className="text-text-muted mt-1 text-xs">Accepted types: {accept}</p>}
        </div>

        {/* Selected file(s) list display */}
        {selectedFiles.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="bg-surface-subtle border-border text-text-primary flex items-center justify-between rounded border p-2 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <File className="text-text-muted h-4 w-4 shrink-0" />
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                  }}
                  aria-label={`Remove file ${file.name}`}
                  className="text-text-muted hover:text-danger-default focus-ring-safe rounded p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {description && (
          <span id={descriptionId} className="text-text-secondary text-xs">
            {description}
          </span>
        )}

        {error && (
          <span id={errorId} className="text-danger-default text-xs font-medium">
            {error}
          </span>
        )}
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';
