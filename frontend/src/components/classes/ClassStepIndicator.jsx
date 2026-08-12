// Reusable class-creation-wizard progress indicator — one implementation, two responsive
// presentations: a compact "Step X of Y" bar below lg, a vertical step list from lg up.
import { Check } from "lucide-react";

export default function ClassStepIndicator({
  steps,
  currentStep,
  maxStepReached,
  onStepClick,
}) {
  const totalSteps = steps.length;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <>
      {/* Mobile / tablet: compact label + progress bar */}
      <div className="flex flex-col gap-2 lg:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[var(--color-text)]">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-[var(--color-text-secondary)]">
            {steps[currentStep - 1]?.label}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Class setup progress"
          className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-hover)]"
        >
          <div
            className="h-full rounded-full bg-[var(--color-text)] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop: vertical step list, current step content renders beside this */}
      <ol
        className="hidden w-56 shrink-0 flex-col gap-1 lg:flex"
        aria-label="Class setup steps"
      >
        {steps.map((step) => {
          const isComplete = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = step.number <= maxStepReached && !isCurrent;

          const content = (
            <>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  isCurrent || isComplete
                    ? "bg-[var(--color-text)] text-white"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step.number}
              </span>
              <span
                className={`text-sm ${
                  isCurrent
                    ? "font-medium text-[var(--color-text)]"
                    : isComplete
                      ? "text-[var(--color-text)]"
                      : "text-[var(--color-text-secondary)]"
                }`}
              >
                {step.label}
              </span>
            </>
          );

          return (
            <li key={step.number}>
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(step.number)}
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-hover)]"
                >
                  {content}
                </button>
              ) : (
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5"
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
