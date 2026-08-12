// Centers content and enforces the 1280px max content width across all sections.
export default function Container({ className = "", children }) {
  return (
    <div
      className={`mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
