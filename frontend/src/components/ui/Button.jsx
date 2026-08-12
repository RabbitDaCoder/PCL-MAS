// Reusable call-to-action button. Renders a router Link when `to` is given, an <a> when `href` is given, otherwise a <button>.
import { Link } from "react-router-dom";

const VARIANT_CLASSES = {
  primary: "bg-[var(--color-accent)] text-white hover:opacity-90",
  secondary:
    "bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-hover)]",
};

export default function Button({
  as: Component = "button",
  href,
  to,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2";
  const combinedClassName = `${base} ${VARIANT_CLASSES[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClassName} {...props}>
        {children}
      </Link>
    );
  }

  const Tag = href ? "a" : Component;

  return (
    <Tag href={href} className={combinedClassName} {...props}>
      {children}
    </Tag>
  );
}
