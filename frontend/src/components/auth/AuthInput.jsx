// Reusable labeled text input with inline validation messaging.
import { useId } from "react";
import FormError from "./FormError";

export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-11 rounded-[10px] border bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus-visible:border-[var(--color-text)] ${
          error ? "border-[var(--color-error)]" : "border-[var(--color-border)]"
        }`}
        {...props}
      />
      <FormError id={errorId} message={error} />
    </div>
  );
}
