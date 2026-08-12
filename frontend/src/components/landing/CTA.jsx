// Final call-to-action band, reusable for any headline/CTA pairing.
import Container from "../ui/Container";
import Button from "../ui/Button";

export default function CTA({
  title = "Ready to Transform Learning?",
  primaryLabel = "Get Started",
  primaryTo = "/student/register",
  secondaryLabel = "Learn More",
  secondaryHref = "#features",
}) {
  return (
    <section id="get-started" className="py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-col items-center gap-8 rounded-3xl bg-[var(--color-text)] px-6 py-16 text-center sm:px-16">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              to={primaryTo}
              variant="secondary"
              className="w-full border-white bg-white text-[var(--color-text)] hover:bg-white/90 sm:w-auto"
            >
              {primaryLabel}
            </Button>
            <Button
              href={secondaryHref}
              variant="secondary"
              className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
            >
              {secondaryLabel}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
