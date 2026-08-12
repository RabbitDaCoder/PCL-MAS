// "Meet the AI Learning Team" section.
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import AIAgentCard from "./AIAgentCard";
import { aiAgents } from "../../data/aiAgents";

export default function AITeamSection() {
  return (
    <section
      id="about"
      className="bg-[var(--color-surface)] py-20 sm:py-24 lg:py-28"
    >
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="Meet the AI Learning Team"
          title="Three specialized agents, one shared goal"
          description="Each agent has a clear, bounded responsibility — designed to work together, not compete."
        />
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
          {aiAgents.map((agent) => (
            <AIAgentCard key={agent.name} {...agent} />
          ))}
        </div>
      </Container>
    </section>
  );
}
