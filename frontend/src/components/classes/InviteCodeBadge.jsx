// Compact class-code + invite-link copy control — reused on lecturer dashboard/list cards and
// the admin classes table, so both can hand a student a join code without opening the class.
import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";

export default function InviteCodeBadge({ classCode }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!classCode) return null;

  const joinUrl = `${window.location.origin}/student/classes?code=${classCode}`;

  async function handleCopy(field, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Clipboard access can fail (e.g. permissions) — the code is still visible to copy manually.
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 font-mono text-xs tracking-[0.15em] text-[var(--color-text)]">
        {classCode}
      </span>
      <button
        type="button"
        onClick={() => handleCopy("code", classCode)}
        aria-label="Copy class code"
        title="Copy class code"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
      >
        {copiedField === "code" ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={() => handleCopy("url", joinUrl)}
        aria-label="Copy invite link"
        title="Copy invite link"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
      >
        {copiedField === "url" ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
