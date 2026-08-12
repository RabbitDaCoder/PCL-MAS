// Sticky top navigation with a mobile hamburger menu.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { navLinks } from "../../data/navigation";
import { MenuIcon, CloseIcon } from "../icons";
import {
  getSession,
  getDashboardPath,
  clearSession,
} from "../../services/authService";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const session = getSession();
  const dashboardPath = session?.user?.role
    ? getDashboardPath(session.user.role)
    : null;

  function handleLogout() {
    clearSession();
    setIsMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <a
          href="#top"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--color-text)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-semibold text-white">
            M
          </span>
          PCL-MAS
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {dashboardPath ? (
            <>
              <Button
                to={dashboardPath}
                variant="secondary"
                className="min-h-10 px-5"
              >
                Dashboard
              </Button>
              <Button
                variant="primary"
                className="min-h-10 px-5"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                to="/student/login"
                variant="secondary"
                className="min-h-10 px-5"
              >
                Login
              </Button>
              <Button
                to="/student/register"
                variant="primary"
                className="min-h-10 px-5"
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-text)] lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </Container>

      {isMenuOpen ? (
        <div
          id="mobile-menu"
          className="border-t border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-hover)]"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
              {dashboardPath ? (
                <>
                  <Button
                    to={dashboardPath}
                    variant="secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Button>
                  <Button variant="primary" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    to="/student/login"
                    variant="secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Button>
                  <Button
                    to="/student/register"
                    variant="primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
