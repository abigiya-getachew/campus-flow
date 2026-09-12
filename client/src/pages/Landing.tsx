import { CTA } from "@/components/landing/CTA";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navbar } from "@/components/landing/Navbar";
import { Showcase } from "@/components/landing/Showcase";

export default function Landing() {
  return (
    <div id="top" className="font-inter min-h-screen overflow-x-clip bg-canvas text-ink antialiased">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
