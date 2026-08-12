// Step 3 — Class Settings: schedule, enrollment mode, join code (auto-generated, regenerable,
// copyable), and an optional class-size cap.
import { useState } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import AuthInput from "../../auth/AuthInput";
import FormError from "../../auth/FormError";
import { ENROLLMENT_MODES } from "../../../data/academicOptions";

export default function StepClassSettings({
  values,
  setValue,
  errors,
  isGeneratingCode,
  onRegenerateCode,
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!values.classCode) return;
    try {
      await navigator.clipboard.writeText(values.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (e.g. permissions) — silently ignore, code is still visible.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthInput
          label="Start date (optional)"
          type="date"
          value={values.startDate}
          onChange={(event) => setValue("startDate", event.target.value)}
          error={errors.startDate}
        />
        <AuthInput
          label="End date (optional)"
          type="date"
          value={values.endDate}
          onChange={(event) => setValue("endDate", event.target.value)}
          error={errors.endDate}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-[var(--color-text)]">
          How do students join?
        </legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          {ENROLLMENT_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`flex flex-1 cursor-pointer items-start gap-3 rounded-[10px] border px-4 py-3 transition-colors ${
                values.enrollmentMode === mode.value
                  ? "border-[var(--color-text)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-hover)]"
              }`}
            >
              <input
                type="radio"
                name="enrollmentMode"
                value={mode.value}
                checked={values.enrollmentMode === mode.value}
                onChange={(event) =>
                  setValue("enrollmentMode", event.target.value)
                }
                className="mt-1"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {mode.label}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {mode.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {values.enrollmentMode === "code" ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text)]">
            Class join code
          </span>
          <div className="flex items-center gap-2">
            <div className="flex min-h-11 flex-1 items-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-mono text-lg tracking-[0.2em] text-[var(--color-text)]">
              {isGeneratingCode ? "……" : values.classCode || "——————"}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!values.classCode || isGeneratingCode}
              aria-label="Copy class code"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] disabled:opacity-40"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onRegenerateCode}
              disabled={isGeneratingCode}
              aria-label="Regenerate class code"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] disabled:opacity-40"
            >
              <RefreshCw
                className={`h-4 w-4 ${isGeneratingCode ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <FormError message={errors.classCode} />
        </div>
      ) : null}

      <AuthInput
        label="Maximum students (optional)"
        type="number"
        min="1"
        placeholder="No limit"
        value={values.maxStudents}
        onChange={(event) => setValue("maxStudents", event.target.value)}
        error={errors.maxStudents}
      />
    </div>
  );
}
