// Generic placeholder for nav items whose real section isn't built yet — never a dead link.
import { useLocation } from "react-router-dom";

function humanize(segment) {
  if (!segment) return "This section";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function ComingSoonPage() {
  const location = useLocation();
  const segment = location.pathname.split("/").filter(Boolean).pop();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">
        {humanize(segment)} is coming soon
      </h1>
      <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
        This part of PCL-MAS hasn't been built yet — check back soon.
      </p>
    </div>
  );
}
