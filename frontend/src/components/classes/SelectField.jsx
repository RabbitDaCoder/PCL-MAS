// Labeled select input, styled to match AuthInput so wizard steps look native to the app.
import { useId } from "react";
import FormError from "../auth/FormError";

export default function SelectField({
  label,
  value,
  onChange,
  error,
  helperText,
  id,
  children,
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
      <select
        id={inputId}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`min-h-11 rounded-[10px] border bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none transition-colors focus-visible:border-[var(--color-text)] ${
          error ? "border-[var(--color-error)]" : "border-[var(--color-border)]"
        }`}
        {...props}
      >
        {children}
      </select>
      {helperText && !error ? (
        <p id={helperId} className="text-sm text-[var(--color-text-secondary)]">
          {helperText}
        </p>
      ) : null}
      <FormError id={errorId} message={error} />
    </div>
  );
}
