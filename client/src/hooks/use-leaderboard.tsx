import { useQuery } from "@tanstack/react-query";
import { Badge } from "@shared/schema";

interface LeaderboardUser {
  id: number;
  username: string;
  score: number;
  badges: Badge[];
  solvedChallenges: number;
  rank: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

interface UseLeaderboardOptions {
  scope?: 'global' | 'friends';
  timeFrame?: 'all-time' | 'monthly' | 'weekly' | 'daily';
  enabled?: boolean;
}

export function useLeaderboard({
  scope = 'global',
  timeFrame = 'all-time',
  enabled = true
}: UseLeaderboardOptions = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/leaderboard', scope, timeFrame],
    enabled,
  });
  
  // Helper to find current user's position
  const findCurrentUserRank = (): number | undefined => {
    if (!data) return undefined;
    
    const currentUser = data.find((user: LeaderboardUser) => user.isCurrentUser);
    return currentUser?.rank;
  };
  
  // Get top 3 users
  const getTopUsers = (): LeaderboardUser[] => {
    if (!data) return [];
    
    return data
      .filter((user: LeaderboardUser) => user.rank <= 3)
      .sort((a: LeaderboardUser, b: LeaderboardUser) => a.rank - b.rank);
  };
  
  // Get remaining users
  const getRemainingUsers = (): LeaderboardUser[] => {
    if (!data) return [];
    
    return data
      .filter((user: LeaderboardUser) => user.rank > 3)
      .sort((a: LeaderboardUser, b: LeaderboardUser) => a.rank - b.rank);
  };
  
  return {
    leaderboard: data,
    isLoading,
    error,
    refetch,
    currentUserRank: findCurrentUserRank(),
    topUsers: getTopUsers(),
    remainingUsers: getRemainingUsers()
  };
}
