// Two-column responsive frame shared by every authentication page: form on the left, optional product preview on the right.
import { Link } from "react-router-dom";

export default function AuthLayout({ preview, children }) {
  return (
    <div
      className={`grid min-h-screen bg-[var(--color-bg)] ${preview ? "lg:grid-cols-[2fr_3fr]" : ""}`}
    >
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16">
        <Link
          to="/"
          className="mb-8 inline-flex w-fit items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
        >
          ← Back to home
        </Link>
        {children}
      </div>

      {preview ? (
        <div className="hidden bg-[var(--color-surface)] lg:flex lg:items-center lg:justify-center lg:border-l lg:border-[var(--color-border)] lg:p-16">
          {preview}
        </div>
      ) : null}
    </div>
  );
}
