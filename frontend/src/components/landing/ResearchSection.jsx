// Research section: concise summary of the underlying research pillars.
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import ResearchCard from "./ResearchCard";
import { researchPillars } from "../../data/research";

export default function ResearchSection() {
  return (
    <section id="research" className="py-20 sm:py-24 lg:py-28">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="Research"
          title="Grounded in multi-agent systems research"
          description="This prototype brings together four areas of research into a single, working platform."
        />
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          {researchPillars.map((pillar) => (
            <ResearchCard key={pillar.title} {...pillar} />
          ))}
        </div>
      </Container>
    </section>
  );
}
