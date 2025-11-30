import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import Services from "@/components/landing/Services";
import ProjectOrbit from "@/components/landing/ProjectOrbit";
import Fleet from "@/components/landing/Fleet";
import Safety from "@/components/landing/Safety";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-charcoal text-white selection:bg-orange selection:text-white">
      <Navigation />
      <Hero />
      <TrustBar />
      <Services />
      <Fleet />
      <ProjectOrbit />
      <Safety />
      <Footer />
    </main>
  );
}
