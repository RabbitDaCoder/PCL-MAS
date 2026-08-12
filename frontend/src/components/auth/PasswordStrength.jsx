// Progressive password requirement checklist shown during registration.
import { Check, Circle } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "../../utils/password";

export default function PasswordStrength({ password }) {
  if (!password) return null;

  return (
    <ul className="flex flex-col gap-1.5">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const met = requirement.test(password);
        return (
          <li
            key={requirement.key}
            className={`flex items-center gap-2 text-sm ${met ? "text-[var(--color-success)]" : "text-[var(--color-text-secondary)]"}`}
          >
            {met ? (
              <Check className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {requirement.label}
          </li>
        );
      })}
    </ul>
  );
}
