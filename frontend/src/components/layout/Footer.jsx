// Minimal site footer with brand mark and link list.
import Container from "../ui/Container";
import { footerLinks } from "../../data/footer";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-accent)] text-xs font-semibold text-white">
            M
          </span>
          &copy; {new Date().getFullYear()} PCL-MAS. Research prototype.
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
