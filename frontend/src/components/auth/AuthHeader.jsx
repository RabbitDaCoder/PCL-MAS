// Logo mark + product label + page heading, shared by every authentication page.
export default function AuthHeader({ heading, description }) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-semibold text-white">
          M
        </span>
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          Personalized Collaborative Learning
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
          {heading}
        </h1>
        {description ? (
          <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
