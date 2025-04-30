import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatPoints, formatDate } from "@/lib/utils";
import {
  Trophy,
  Award,
  Target,
  Flag,
  Flame,
  Clock
} from "lucide-react";

interface UserStats {
  rank: number;
  totalPoints: number;
  challengesSolved: number;
  badgesEarned: number;
  streak: number;
}

interface ProfileStatsProps {
  user?: User | null;
  stats?: UserStats;
  isLoading?: boolean;
}

export default function ProfileStats({ user, stats, isLoading = false }: ProfileStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!stats || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stats Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Could not load user statistics.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress towards next level
  const currentPoints = stats.totalPoints;
  const pointsPerLevel = 1000;
  const currentLevel = Math.floor(currentPoints / pointsPerLevel) + 1;
  const nextLevelPoints = currentLevel * pointsPerLevel;
  const prevLevelPoints = (currentLevel - 1) * pointsPerLevel;
  const levelProgress = ((currentPoints - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100;
  
  // Format the member since date
  const memberSince = user.createdAt ? formatDate(user.createdAt) : "Unknown";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Level & Points Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Level {currentLevel}</span>
            <span className="text-sm text-muted-foreground">Level {currentLevel + 1}</span>
          </div>
          
          <Progress value={levelProgress} className="h-2 mb-4" />
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-muted-foreground">{formatPoints(currentPoints)} / {formatPoints(nextLevelPoints)} points</span>
            <span className="text-xs text-muted-foreground">{formatPoints(nextLevelPoints - currentPoints)} points needed</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-background rounded-md">
              <Award className="mb-1 h-5 w-5 text-accent" />
              <span className="text-lg font-bold">{stats.badgesEarned}</span>
              <span className="text-xs text-muted-foreground">Badges</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-3 bg-background rounded-md">
              <Flag className="mb-1 h-5 w-5 text-green-500" />
              <span className="text-lg font-bold">{stats.challengesSolved}</span>
              <span className="text-xs text-muted-foreground">Challenges</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-primary" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <span>Global Rank</span>
              </div>
              <Badge variant="outline" className="font-mono">#{stats.rank}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mr-3">
                  <Flame className="h-4 w-4 text-amber-500" />
                </div>
                <span>Current Streak</span>
              </div>
              <Badge variant="outline" className="font-mono text-amber-500">{stats.streak} days</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <span>Member Since</span>
              </div>
              <Badge variant="outline" className="font-mono">{memberSince}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
