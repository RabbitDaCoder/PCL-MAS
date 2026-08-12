// "How It Works" section: end-to-end timeline of the learning workflow.
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Timeline from "./Timeline";
import { timelineSteps } from "../../data/timeline";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 lg:py-28">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="How It Works"
          title="From uploaded materials to measured growth"
          description="One continuous workflow, from the lecturer's first upload to the final learning analytics report."
        />
        <Timeline steps={timelineSteps} />
      </Container>
    </section>
  );
}
