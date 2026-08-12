// Bottom prompt + link used for "create account" and "switch role" call-outs.
import { Link } from "react-router-dom";

export default function AuthFooter({ prompt, actionLabel, to }) {
  return (
    <p className="text-center text-sm text-[var(--color-text-secondary)]">
      {prompt}{" "}
      <Link
        to={to}
        className="font-medium text-[var(--color-text)] hover:underline"
      >
        {actionLabel}
      </Link>
    </p>
  );
}
