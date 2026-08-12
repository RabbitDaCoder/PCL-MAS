// Minimal skeleton loader for cards/lists — no spinner-only loading states.
export default function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-[var(--color-hover)] ${className}`}
    />
  );
}
