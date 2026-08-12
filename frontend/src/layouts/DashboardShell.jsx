// Shared dashboard chrome for all three roles: header + avatar menu, desktop sidebar, mobile
// bottom nav. Each role's layout just supplies its own nav items — this is the one place the
// header/nav markup lives, re-rendered by breakpoint rather than duplicated per role.
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AvatarMenu({ initials, name, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-hover)] text-xs font-semibold text-[var(--color-text)]"
      >
        {initials || "?"}
      </button>
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-11 z-50 w-48 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[0_8px_24px_rgba(17,17,17,0.1)]"
          >
            <p className="truncate px-3 py-2 text-sm font-medium text-[var(--color-text)]">
              {name}
            </p>
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function DashboardShell({ navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] sm:flex-row">
      <aside className="hidden w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] sm:flex sm:flex-col">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-semibold text-white">
            M
          </span>
          <span className="text-sm font-semibold text-[var(--color-text)]">
            PCL-MAS
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-hover)] text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:justify-end sm:px-8 sm:py-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] sm:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-xs font-semibold text-white">
              M
            </span>
            PCL-MAS
          </span>
          <AvatarMenu
            initials={initials}
            name={fullName}
            onLogout={handleLogout}
          />
        </header>

        <main className="flex flex-1 flex-col pb-20 sm:pb-0">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--color-border)] bg-[var(--color-surface)] sm:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)]"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
