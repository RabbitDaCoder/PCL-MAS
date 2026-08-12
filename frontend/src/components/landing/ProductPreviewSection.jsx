// Product Preview section: desktop and mobile mockups shown together.
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import DesktopMockup from "./DesktopMockup";
import PhoneMockup from "./PhoneMockup";
import { WorkspaceScreen, AssistantScreen } from "./AppScreens";

export default function ProductPreviewSection() {
  return (
    <section className="bg-[var(--color-surface)] py-20 sm:py-24 lg:py-28">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="Product Preview"
          title="Designed for focus, on any device"
          description="A consistent, distraction-free experience whether students are at a desk or on the move."
        />
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <DesktopMockup>
            <WorkspaceScreen />
          </DesktopMockup>
          <div className="flex justify-center">
            <PhoneMockup>
              <AssistantScreen />
            </PhoneMockup>
          </div>
        </div>
      </Container>
    </section>
  );
}
