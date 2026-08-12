// Composes every landing page section in order. No presentation logic lives here.
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import FeaturesSection from "../components/landing/FeaturesSection";
import AITeamSection from "../components/landing/AITeamSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import ProductPreviewSection from "../components/landing/ProductPreviewSection";
import ResearchSection from "../components/landing/ResearchSection";
import CTA from "../components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main>
        <Hero />
        <FeaturesSection />
        <AITeamSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <ResearchSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
