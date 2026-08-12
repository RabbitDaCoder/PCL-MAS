// Single reusable card used to present one platform feature.
export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(17,17,17,0.2)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-hover)] text-[var(--color-text)]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}
