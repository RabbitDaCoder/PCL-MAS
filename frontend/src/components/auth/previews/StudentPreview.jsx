// Realistic student-side product preview shown on the desktop authentication layout.
import DesktopMockup from "../../landing/DesktopMockup";
import { BarChartIcon, BotIcon, ClipboardListIcon } from "../../icons";

export default function StudentPreview() {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          Your learning, personalized every step of the way.
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Track your course progress, get help from your AI learning assistant,
          and stay on top of every assignment.
        </p>
      </div>
      <DesktopMockup>
        <div className="flex min-h-[260px] text-left">
          <div className="flex-1 space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-[var(--color-hover)]" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-text)] text-white">
                <BotIcon className="h-4 w-4" />
              </span>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <BarChartIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="h-2 w-24 rounded bg-[var(--color-hover)]" />
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--color-hover)]">
                <div className="h-2 w-2/3 rounded-full bg-[var(--color-text)]" />
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <ClipboardListIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="h-2 w-28 rounded bg-[var(--color-hover)]" />
              </div>
              <span className="block h-2 w-1/2 rounded bg-[var(--color-hover)]" />
            </div>
            <div className="ml-auto max-w-[80%] space-y-1.5 rounded-2xl rounded-tr-sm bg-[var(--color-text)] px-4 py-3">
              <div className="h-2 w-full rounded bg-white/40" />
              <div className="h-2 w-3/4 rounded bg-white/40" />
            </div>
          </div>
        </div>
      </DesktopMockup>
    </div>
  );
}
