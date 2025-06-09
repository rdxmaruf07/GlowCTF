import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

// Core pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import DashboardPage from "@/pages/dashboard-page";
import ChallengesPage from "@/pages/challenges-page";
import ChatbotPage from "@/pages/chatbot-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import ProfilePage from "@/pages/profile-page";
import PracticePage from "@/pages/practice-page";
import AdminPage from "@/pages/admin-page";
import TeamPage from "@/pages/team-page";
import MilestonesPage from "@/pages/milestones-page";
import CTFPlatformsPage from "@/pages/ctf-platforms-page";
import ComingSoonPage from "@/pages/coming-soon-page";

// Resources pages
import DocsPage from "@/pages/docs-page";
import ApiDocsPage from "@/pages/api-docs-page";
import TutorialsPage from "@/pages/tutorials-page";
import BlogPage from "@/pages/blog-page";

// Community pages
import ForumsPage from "@/pages/forums-page";
import EventsPage from "@/pages/events-page";
import ContributorsPage from "@/pages/contributors-page";
import DiscordPage from "@/pages/discord-page";

// Academic pages
import EducatorsPage from "@/pages/educators-page";
import CurriculumPage from "@/pages/curriculum-page";
import ResearchPage from "@/pages/research-page";
import PartnershipsPage from "@/pages/partnerships-page";

// Legal pages
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";
import CookiesPage from "@/pages/cookies-page";

import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { AnimationProvider } from "./contexts/animation-context";
import { GlobalAnimationControls } from "./components/global-animation-controls";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />

      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/challenges" component={ChallengesPage} />
      <ProtectedRoute path="/chatbot" component={ChatbotPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <ProtectedRoute path="/milestones" component={MilestonesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/:userId" component={ProfilePage} />
      <ProtectedRoute path="/practice" component={PracticePage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/team" component={TeamPage} />
      <ProtectedRoute path="/ctf-platforms" component={CTFPlatformsPage} />
      <ProtectedRoute path="/coming-soon" component={ComingSoonPage} />

      {/* Resources routes */}
      <Route path="/docs" component={DocsPage} />
      <Route path="/api-docs" component={ApiDocsPage} />
      <Route path="/tutorials" component={TutorialsPage} />
      <Route path="/blog" component={BlogPage} />

      {/* Community routes */}
      <Route path="/forums" component={ForumsPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/contributors" component={ContributorsPage} />
      <Route path="/discord" component={DiscordPage} />

      {/* Academic routes */}
      <Route path="/educators" component={EducatorsPage} />
      <Route path="/curriculum" component={CurriculumPage} />
      <Route path="/research" component={ResearchPage} />
      <Route path="/partnerships" component={PartnershipsPage} />

      {/* Legal routes */}
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/cookies" component={CookiesPage} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <AnimationProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
              <GlobalAnimationControls />
            </TooltipProvider>
          </AnimationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;