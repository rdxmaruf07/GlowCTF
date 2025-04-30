import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileStats from "@/components/profile/profile-stats";
import CompletedChallenges from "@/components/profile/completed-challenges";
import BadgeDisplay from "@/components/badges/badge-display";
import MilestoneDisplay from "@/components/milestones/milestone-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId || currentUser?.id?.toString();
  const [activeTab, setActiveTab] = useState('overview');
  const isOwnProfile = useMemo(() => 
    currentUser && userId === currentUser.id.toString(), 
    [currentUser, userId]
  );
  
  // Fetch user data if viewing another user's profile
  const { 
    data: userData, 
    isLoading: userLoading, 
    error: userError 
  } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isOwnProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Determine the profile user based on whether it's the current user or another user
  const profileUser = useMemo(() => {
    if (isOwnProfile) {
      return currentUser;
    } else {
      return userData;
    }
  }, [isOwnProfile, currentUser, userData]);
  
  // Fetch user stats
  const { 
    data: userStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Fetch user badges
  const { 
    data: userBadges, 
    isLoading: badgesLoading, 
    error: badgesError 
  } = useQuery({
    queryKey: [`/api/users/${userId}/badges`],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Fetch user completed challenges
  const { 
    data: completedChallenges, 
    isLoading: challengesLoading, 
    error: challengesError 
  } = useQuery({
    queryKey: [`/api/users/${userId}/completed-challenges`],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const isLoading = userLoading || statsLoading || badgesLoading || challengesLoading;
  const hasError = userError || statsError || badgesError || challengesError;
  
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
          <ProfileHeader user={profileUser} stats={userStats} isOwnProfile={isOwnProfile} />
        )}
        
        {/* Tabs for profile sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Profile Stats */}
            <ProfileStats user={profileUser} stats={userStats} isLoading={statsLoading} />
            
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
          
          <TabsContent value="milestones" className="space-y-6 mt-6">
            <h2 className="font-orbitron text-xl font-bold text-white mb-4">Milestones</h2>
            <MilestoneDisplay userId={parseInt(userId || "0")} />
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
