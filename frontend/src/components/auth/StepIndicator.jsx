// Numbered progress indicator for multi-step registration flows.
import { Check } from "lucide-react";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <ol className="mb-8 flex items-center" aria-label="Registration progress">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <li
            key={label}
            className="flex flex-1 items-center gap-2 last:flex-none"
          >
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                isCurrent || isComplete
                  ? "bg-[var(--color-text)] text-white"
                  : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              <span className="sr-only"> {label}</span>
            </span>
            {stepNumber < steps.length ? (
              <span
                className={`h-px flex-1 ${isComplete ? "bg-[var(--color-text)]" : "bg-[var(--color-border)]"}`}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
