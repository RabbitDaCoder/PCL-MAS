// Human-friendly inline error message. Renders nothing when there is no message.
export default function FormError({ message, id }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="text-sm leading-relaxed text-[var(--color-error)]"
    >
      {message}
    </p>
  );
}
