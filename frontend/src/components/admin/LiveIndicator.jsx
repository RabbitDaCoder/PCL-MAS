// Subtle connection-state dot for live Socket.io updates — intentionally understated, not a
// flashy badge, per the design rules.
export default function LiveIndicator({ connected }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"
        }`}
      />
      {connected ? "Live" : "Reconnecting…"}
    </div>
  );
}
