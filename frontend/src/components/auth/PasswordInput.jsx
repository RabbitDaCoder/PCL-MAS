// AuthInput variant with a show/hide toggle for password fields.
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormError from "./FormError";

export default function PasswordInput({
  label,
  value,
  onChange,
  error,
  id,
  autoComplete = "current-password",
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
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
      <div className="relative">
        <input
          id={inputId}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`min-h-11 w-full rounded-[10px] border bg-[var(--color-surface)] px-4 pr-12 text-base text-[var(--color-text)] outline-none transition-colors focus-visible:border-[var(--color-text)] ${
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)]"
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          {isVisible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      <FormError id={errorId} message={error} />
    </div>
  );
}
