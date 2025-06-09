import { useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// Landing page components
import LandingNav from "@/components/landing/landing-nav";
import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features-section";
import AboutSection from "@/components/landing/about-section";
import RealtimeStats from "@/components/landing/realtime-stats";
import LiveLeaderboard from "@/components/landing/live-leaderboard";
import LiveChallenges from "@/components/landing/live-challenges";
import GlobalActivityMap from "@/components/landing/global-activity-map";
import LiveNotifications from "@/components/landing/live-notifications";
import CTASection from "@/components/landing/cta-section";
import AnimatedBackground from "@/components/landing/animated-background";
import Footer from "@/components/layout/footer";

// Enhanced scroll components
import { 
  ScrollProgress, 
  ScrollToTop, 
  Section, 
  NavigationDots,
  ParallaxContainer 
} from "@/components/ui/enhanced-scroll";

export default function LandingPage() {
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  // Navigation sections for dots
  const sections = [
    { id: "hero", label: "Home" },
    { id: "stats", label: "Live Stats" },
    { id: "features", label: "Features" },
    { id: "challenges", label: "Challenges" },
    { id: "about", label: "About" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "global", label: "Global Activity" },
    { id: "cta", label: "Get Started" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden scroll-snap-container">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Animated Background */}
      <ParallaxContainer offset={30}>
        <AnimatedBackground />
      </ParallaxContainer>
      
      {/* Navigation */}
      <LandingNav />
      
      {/* Live Notifications */}
      <LiveNotifications />
      
      {/* Navigation Dots */}
      <NavigationDots sections={sections} />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <Section id="hero" snapToSection>
          <HeroSection />
        </Section>
        
        {/* Real-time Stats Section */}
        <Section id="stats" snapToSection>
          <RealtimeStats />
        </Section>
        
        {/* Features Section */}
        <Section id="features" snapToSection>
          <FeaturesSection />
        </Section>

        {/* Live Challenges Section */}
        <Section id="challenges" snapToSection>
          <LiveChallenges />
        </Section>

        {/* About Section */}
        <Section id="about" snapToSection>
          <AboutSection />
        </Section>

        {/* Live Leaderboard Section */}
        <Section id="leaderboard" snapToSection>
          <LiveLeaderboard />
        </Section>

        {/* Global Activity Map */}
        <Section id="global" snapToSection>
          <GlobalActivityMap />
        </Section>
        
        {/* CTA Section */}
        <Section id="cta" snapToSection>
          <CTASection />
        </Section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
