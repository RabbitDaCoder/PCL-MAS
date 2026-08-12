// Realistic lecturer-side product preview shown on the desktop authentication layout.
import DesktopMockup from "../../landing/DesktopMockup";
import { UsersIcon, EyeIcon, BookOpenIcon } from "../../icons";

export default function LecturerPreview() {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          Guide every class, backed by your AI teaching team.
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Review student progress, respond to AI review requests, and manage
          course materials in one place.
        </p>
      </div>
      <DesktopMockup>
        <div className="flex min-h-[260px] text-left">
          <div className="flex-1 space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded bg-[var(--color-hover)]" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-text)] text-white">
                <UsersIcon className="h-4 w-4" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
                <BookOpenIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="block h-2 w-full rounded bg-[var(--color-hover)]" />
                <span className="block h-2 w-2/3 rounded bg-[var(--color-hover)]" />
              </div>
              <div className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
                <EyeIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="block h-2 w-full rounded bg-[var(--color-hover)]" />
                <span className="block h-2 w-1/2 rounded bg-[var(--color-hover)]" />
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="mb-2 h-2 w-32 rounded bg-[var(--color-hover)]" />
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((student) => (
                  <div
                    key={student}
                    className="h-7 w-7 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-hover)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DesktopMockup>
    </div>
  );
}
