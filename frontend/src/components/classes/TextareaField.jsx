// Labeled textarea, styled to match AuthInput — starts compact and grows with a few rows, not a
// giant box.
import { useId } from "react";
import FormError from "../auth/FormError";

export default function TextareaField({
  label,
  value,
  onChange,
  error,
  helperText,
  rows = 3,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`rounded-[10px] border bg-[var(--color-surface)] px-4 py-3 text-base leading-relaxed text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus-visible:border-[var(--color-text)] ${
          error ? "border-[var(--color-error)]" : "border-[var(--color-border)]"
        }`}
        {...props}
      />
      {helperText && !error ? (
        <p id={helperId} className="text-sm text-[var(--color-text-secondary)]">
          {helperText}
        </p>
      ) : null}
      <FormError id={errorId} message={error} />
    </div>
  );
}
