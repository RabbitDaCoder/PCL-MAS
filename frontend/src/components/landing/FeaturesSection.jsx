// "Why This Platform" section: grid of six feature cards.
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import FeatureCard from "./FeatureCard";
import { features } from "../../data/features";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 lg:py-28">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="Why This Platform"
          title="Built for how students actually learn"
          description="Every part of the experience is designed around personalization, collaboration, and academic integrity."
        />
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
