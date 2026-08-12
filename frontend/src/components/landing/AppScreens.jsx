// Fake application screens rendered inside DesktopMockup/PhoneMockup frames. Presentation only.
import {
  BotIcon,
  BookOpenIcon,
  ClipboardListIcon,
  BarChartIcon,
} from "../icons";

export function DashboardScreen() {
  return (
    <div className="flex min-h-[280px] text-left">
      <aside className="hidden w-40 shrink-0 flex-col gap-1 border-r border-[var(--color-border)] p-4 sm:flex">
        <div className="mb-3 h-3 w-20 rounded bg-[var(--color-hover)]" />
        {["Dashboard", "Courses", "Assignments", "Progress"].map((item, i) => (
          <div
            key={item}
            className={`rounded-md px-2 py-2 text-xs font-medium ${
              i === 0
                ? "bg-[var(--color-hover)] text-[var(--color-text)]"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            {item}
          </div>
        ))}
      </aside>
      <div className="flex-1 space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="h-3 w-28 rounded bg-[var(--color-hover)]" />
          <div className="h-8 w-8 rounded-full bg-[var(--color-hover)]" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="space-y-2 rounded-lg border border-[var(--color-border)] p-3"
            >
              <div className="h-2 w-10 rounded bg-[var(--color-hover)]" />
              <div className="h-4 w-14 rounded bg-[var(--color-text)]/80" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <div className="mb-3 h-2.5 w-32 rounded bg-[var(--color-hover)]" />
          <div className="flex items-end gap-2">
            {[40, 65, 50, 80, 60, 90].map((h, i) => (
              <div
                key={i}
                className="w-6 rounded-t bg-[var(--color-text)]/80"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantScreen() {
  return (
    <div className="flex min-h-[280px] flex-col text-left">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] p-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-text)] text-white">
          <BotIcon className="h-4 w-4" />
        </span>
        <div className="h-2.5 w-32 rounded bg-[var(--color-hover)]" />
      </div>
      <div className="flex-1 space-y-3 p-4 sm:p-5">
        <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-[var(--color-hover)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
          Can you explain recursion with a simple example?
        </div>
        <div className="ml-auto max-w-[75%] space-y-1.5 rounded-2xl rounded-tr-sm bg-[var(--color-text)] px-4 py-3">
          <div className="h-2 w-full rounded bg-white/40" />
          <div className="h-2 w-4/5 rounded bg-white/40" />
          <div className="h-2 w-3/5 rounded bg-white/40" />
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="h-9 rounded-full bg-[var(--color-hover)]" />
      </div>
    </div>
  );
}

export function WorkspaceScreen() {
  return (
    <div className="flex min-h-[280px] text-left">
      <div className="flex-1 space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
          <div className="h-2.5 w-36 rounded bg-[var(--color-hover)]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
            <ClipboardListIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <div className="h-2 w-full rounded bg-[var(--color-hover)]" />
            <div className="h-2 w-2/3 rounded bg-[var(--color-hover)]" />
          </div>
          <div className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
            <BarChartIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <div className="h-2 w-full rounded bg-[var(--color-hover)]" />
            <div className="h-2 w-1/2 rounded bg-[var(--color-hover)]" />
          </div>
        </div>
        <div className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
          <div className="h-2 w-1/3 rounded bg-[var(--color-hover)]" />
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-7 w-7 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-hover)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
