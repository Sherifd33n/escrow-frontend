import Navbar from "../components/Navbar";
import Hero from "../components/home/Hero";
import StartEscrowWidget from "../components/home/StartEscrowWidget";
import HowEscrowWorks from "../components/home/HowEscrowWorks";
import StatsAndWorkflow from "../components/home/StatsAndWorkflow";
import TechServicesSection from "../components/home/TechServicesSection";
import AIDisputeResolutionSection from "../components/home/AIDisputeResolutionSection";
import ClientStoriesSection from "../components/home/ClientStoriesSection";
import FAQSection from "../components/home/FAQSection";
import ProjectMovingCTA from "../components/ProjectMovingCTA";
import Footer from "../components/Footer";

export default function HomePage({ navigate, user, onLogout }) {
  const handleSignup = () => navigate("signup");
  const handleLogin = () => navigate("login");

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Sticky Navbar */}
      <Navbar
        variant="dark"
        onLogin={handleLogin}
        onSignup={handleSignup}
        navigate={navigate}
        user={user}
        onLogout={onLogout}
      />

      {/* Hero Section */}
      <Hero
        onSignup={handleSignup}
        onLogin={handleLogin}
        navigate={navigate}
        user={user}
        onLogout={onLogout}
      />

      {/* Start Escrow Widget */}
      <StartEscrowWidget onSignup={handleSignup} />

      {/* How Escrow Works */}
      <HowEscrowWorks />

      {/* Stats & Complete 9-Step Escrow Workflow */}
      <StatsAndWorkflow onSignup={handleSignup} />

      {/* Technology Services */}
      <TechServicesSection onSignup={handleSignup} navigate={navigate} />

      {/* AI Dispute Resolution */}
      <AIDisputeResolutionSection onSignup={handleSignup} />

      {/* Client Stories / Reviews */}
      <ClientStoriesSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Get Project Moving CTA */}
      <ProjectMovingCTA onSignup={handleSignup} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
