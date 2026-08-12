// Single reusable card used to introduce one AI agent in the MAS team.
export default function AIAgentCard({
  icon: Icon,
  name,
  tagline,
  description,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-text)] text-white">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {name}
        </h3>
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          {tagline}
        </p>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}
