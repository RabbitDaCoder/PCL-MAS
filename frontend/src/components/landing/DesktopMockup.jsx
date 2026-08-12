// Reusable browser-window frame used to present desktop product mockups.
export default function DesktopMockup({ children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_60px_-24px_rgba(17,17,17,0.25)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-hover)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-border)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-border)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-border)]" />
        <div className="ml-3 h-6 flex-1 rounded-md bg-[var(--color-surface)]" />
      </div>
      <div className="bg-[var(--color-surface)]">{children}</div>
    </div>
  );
}
