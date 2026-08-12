// Shared line-icon set used across the landing page. Presentation only — no logic.
function IconBase({ className = "h-6 w-6", children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </IconBase>
  );
}

export function CloseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </IconBase>
  );
}

export function ArrowRightIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </IconBase>
  );
}

export function ArrowDownIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </IconBase>
  );
}

export function SparklesIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
    </IconBase>
  );
}

export function UsersIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3.25" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87M15.5 4.13a3.25 3.25 0 0 1 0 6.24" />
    </IconBase>
  );
}

export function BotIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="4" y="9" width="16" height="10" rx="2.5" />
      <path d="M12 5.5v3.5M9 5.5h6" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function ShieldCheckIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3Z" />
      <path d="M9 12.5l2 2 4-4.5" />
    </IconBase>
  );
}

export function ClipboardCheckIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="6" y="4.5" width="12" height="16" rx="1.5" />
      <path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4" />
      <path d="M9.5 13l2 2 3.5-4" />
    </IconBase>
  );
}

export function BarChartIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </IconBase>
  );
}

export function UploadCloudIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M7.5 17.5a4 4 0 0 1-.5-7.97 5 5 0 0 1 9.6-1.62A4.25 4.25 0 0 1 16.5 17.5H16" />
      <path d="M12 12v7M9.5 16.5L12 14l2.5 2.5" />
    </IconBase>
  );
}

export function BookOpenIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 6.5c-1.5-1.2-4-2-7-2v13c3 0 5.5.8 7 2 1.5-1.2 4-2 7-2V4.5c-3 0-5.5.8-7 2Z" />
      <path d="M12 6.5v13" />
    </IconBase>
  );
}

export function ClipboardListIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="6" y="4.5" width="12" height="16" rx="1.5" />
      <path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4" />
      <path d="M9 12h6M9 15.5h6M9 8.5h2" />
    </IconBase>
  );
}

export function MessageSquareIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 5.5h16v10.5H9l-4 3.5v-3.5H4z" />
    </IconBase>
  );
}

export function EyeIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </IconBase>
  );
}

export function LineChartIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 19h16" />
      <path d="M4 15l4.5-5 3.5 3 6-7" />
    </IconBase>
  );
}

export function GithubIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.57 4.92.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </IconBase>
  );
}
