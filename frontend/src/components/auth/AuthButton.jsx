// Full-width submit/action button shared by every auth form, with a built-in loading state.
import { Loader2 } from "lucide-react";

const VARIANT_CLASSES = {
  primary: "bg-[var(--color-accent)] text-white hover:opacity-90",
  secondary:
    "bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-hover)]",
};

export default function AuthButton({
  loading = false,
  loadingLabel = "Please wait...",
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] px-6 text-base font-medium transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : null}
      {loading ? loadingLabel : children}
    </button>
  );
}
