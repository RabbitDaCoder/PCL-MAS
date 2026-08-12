// Single reusable card used to present one research pillar.
export default function ResearchCard({ title, description }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] p-6">
      <h3 className="text-base font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </p>
    </div>
  );
}
