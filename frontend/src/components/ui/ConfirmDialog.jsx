// Minimal confirm dialog for destructive actions (e.g. removing a student) — no browser confirm().
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 px-4 pb-6 sm:items-center sm:pb-0"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-base font-semibold text-[var(--color-text)]"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            className="h-10 px-4 text-sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-10 px-4 text-sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Removing…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
