// Reusable phone frame used to present mobile product mockups.
export default function PhoneMockup({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-[280px] overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[0_20px_60px_-24px_rgba(17,17,17,0.25)] ${className}`}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--color-border)]">
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[var(--color-border)]" />
        <div className="bg-[var(--color-surface)] pt-6">{children}</div>
      </div>
    </div>
  );
}
