// Card wrapper for authentication forms: blends into the page on mobile, becomes a visible card from tablet up.
export default function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`mx-auto w-full max-w-md rounded-2xl border border-transparent p-0 sm:border-[var(--color-border)] sm:bg-[var(--color-surface)] sm:p-8 sm:shadow-[0_1px_2px_rgba(17,17,17,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}
