import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import StatsOverview from "@/components/dashboard/stats-overview";
import ActiveChallenges from "@/components/dashboard/active-challenges";
import RecentActivity from "@/components/dashboard/recent-activity";
import BadgeDisplay from "@/components/badges/badge-display";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user,
  });
  
  const { data: challenges, isLoading: challengesLoading, error: challengesError } = useQuery({
    queryKey: ['/api/challenges'],
    enabled: !!user,
  });
  
  const { data: userBadges, isLoading: badgesLoading, error: badgesError } = useQuery({
    queryKey: [`/api/users/${user?.id}/badges`],
    enabled: !!user,
  });
  
  // Error handling
  const hasError = statsError || challengesError || badgesError;
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="text-primary">{user?.username}</span>. Ready to hack?
            </p>
          </div>
          
          {!statsLoading && userStats && (
            <div className="mt-4 md:mt-0 flex items-center bg-card px-4 py-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning mr-2"><path d="M17.55 20.1c-.93.45-2.2.15-2.74-.37A3.93 3.93 0 0 0 13 19c-1.86 0-3.3.91-3.8 1.32-.55.52-1.81.82-2.74.37a1.12 1.12 0 0 1-.38-1.56c.83-1.17 2.03-3.18 2.03-6.13 0-.22-.3-1.78 2.89-3.6 1.03-.58 1.81-1.54 1.81-3.4H12c-3.86 0-5 2.45-5 4.12 0 .24.01.47.04.69" /><path d="M14.48 14.95a1 1 0 1 0-1.9 0M16 14a1 1 0 1 0 0-2" /><path d="M11.25 17a.25.25 0 1 0 .25.25.25.25 0 0 0-.25-.25"/><path d="M16 18a1 1 0 1 0 0-2" /><path d="M8 10a1 1 0 1 0 0-2" /><path d="M11.97 2h.06c1.4 0 2.4 0 3.05.1.67.08 1.22.57 1.4 1.23.2.74.13 1.67.05 2.8-.05.6-.67 1.1-1.4 1.1H8.87c-.73 0-1.35-.5-1.4-1.1-.08-1.13-.15-2.06.05-2.8.18-.66.73-1.15 1.4-1.23a17.18 17.18 0 0 1 3.05-.1Z" /></svg>
              <span className="text-text-primary font-medium mr-2">Streak:</span>
              <span className="text-warning font-bold">{userStats.streak} days</span>
            </div>
          )}
          
          {statsLoading && (
            <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
          )}
        </div>

        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error loading some dashboard data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <StatsOverview stats={userStats} isLoading={statsLoading} />

        {/* Current Challenges and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Active Challenges */}
          <div className="lg:col-span-2">
            <ActiveChallenges challenges={challenges} isLoading={challengesLoading} />
          </div>
          
          {/* Badges and Recent Activity */}
          <div className="space-y-6">
            {/* Badges Showcase */}
            <BadgeDisplay badges={userBadges} isLoading={badgesLoading} />
            
            {/* Recent Activity */}
            <RecentActivity userId={user?.id} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
