// Hero section: value proposition, primary/secondary CTAs, and a tabbed product mockup.
import { useState } from "react";
import Container from "../ui/Container";
import Button from "../ui/Button";
import DesktopMockup from "./DesktopMockup";
import {
  DashboardScreen,
  AssistantScreen,
  WorkspaceScreen,
} from "./AppScreens";
import { ArrowRightIcon } from "../icons";

const TABS = [
  { key: "dashboard", label: "Student Dashboard", Screen: DashboardScreen },
  { key: "assistant", label: "AI Learning Assistant", Screen: AssistantScreen },
  { key: "workspace", label: "Course Workspace", Screen: WorkspaceScreen },
];

export default function Hero() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const ActiveScreen = TABS.find((tab) => tab.key === activeTab).Screen;

  return (
    <section id="top" className="pt-16 sm:pt-20 lg:pt-28">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
          Learning that adapts to every student, guided by a team of AI agents.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          A collaborative learning platform where Administrative, Instructor,
          and Lecturer AI agents work together — always under human supervision
          — to personalize every student's path.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            to="/student/register"
            variant="primary"
            className="w-full sm:w-auto"
          >
            Get Started
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
          <Button
            href="#how-it-works"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            See How It Works
          </Button>
        </div>
      </Container>

      <Container className="mt-14 sm:mt-16 lg:mt-20">
        <div className="mb-5 flex flex-wrap justify-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-[var(--color-text)] bg-[var(--color-text)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DesktopMockup className="mx-auto max-w-4xl">
          <ActiveScreen />
        </DesktopMockup>
      </Container>
    </section>
  );
}
