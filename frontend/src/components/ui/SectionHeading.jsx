// Consistent eyebrow + heading + supporting copy used to introduce each landing page section.
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  const alignment =
    align === "center"
      ? "text-center items-center mx-auto"
      : "text-left items-start";

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      {eyebrow ? (
        <span className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
