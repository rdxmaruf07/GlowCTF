import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileStats from "@/components/profile/profile-stats";
import CompletedChallenges from "@/components/profile/completed-challenges";
import BadgeDisplay from "@/components/badges/badge-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch user stats
  const { 
    data: userStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user,
  });
  
  // Fetch user badges
  const { 
    data: userBadges, 
    isLoading: badgesLoading, 
    error: badgesError 
  } = useQuery({
    queryKey: [`/api/users/${user?.id}/badges`],
    enabled: !!user,
  });
  
  // Fetch user completed challenges
  const { 
    data: completedChallenges, 
    isLoading: challengesLoading, 
    error: challengesError 
  } = useQuery({
    queryKey: [`/api/users/${user?.id}/completed-challenges`],
    enabled: !!user,
  });
  
  const isLoading = statsLoading || badgesLoading || challengesLoading;
  const hasError = statsError || badgesError || challengesError;
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error loading profile data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Profile Header */}
        {isLoading ? (
          <div className="mb-8">
            <Skeleton className="h-32 w-full rounded-lg mb-4" />
          </div>
        ) : (
          <ProfileHeader user={user} stats={userStats} />
        )}
        
        {/* Tabs for profile sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Profile Stats */}
            <ProfileStats stats={userStats} isLoading={statsLoading} />
            
            {/* Recent Badges */}
            <h2 className="font-orbitron text-xl font-bold text-white mt-8 mb-4">Recent Badges</h2>
            <BadgeDisplay badges={userBadges} isLoading={badgesLoading} limit={6} />
            
            {/* Recent Completed Challenges */}
            <h2 className="font-orbitron text-xl font-bold text-white mt-8 mb-4">Recent Challenges</h2>
            <CompletedChallenges 
              challenges={completedChallenges} 
              isLoading={challengesLoading} 
              limit={3} 
            />
          </TabsContent>
          
          <TabsContent value="badges" className="space-y-6 mt-6">
            <h2 className="font-orbitron text-xl font-bold text-white mb-4">All Badges</h2>
            <BadgeDisplay badges={userBadges} isLoading={badgesLoading} showAll={true} />
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-6 mt-6">
            <h2 className="font-orbitron text-xl font-bold text-white mb-4">All Completed Challenges</h2>
            <CompletedChallenges 
              challenges={completedChallenges} 
              isLoading={challengesLoading} 
              showAll={true} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
