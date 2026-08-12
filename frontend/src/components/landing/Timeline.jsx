// Reusable vertical timeline used to visualize an ordered process.
export default function Timeline({ steps }) {
  return (
    <ol className="flex w-full max-w-2xl flex-col">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-text)] text-white">
                <Icon className="h-5 w-5" />
              </span>
              {isLast ? null : (
                <span
                  className="w-px flex-1 bg-[var(--color-border)]"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className={`flex flex-col gap-1 ${isLast ? "pb-0" : "pb-10"}`}>
              <p className="pt-1.5 text-base font-semibold text-[var(--color-text)]">
                {step.title}
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
