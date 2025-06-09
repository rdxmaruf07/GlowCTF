import { Challenge } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPoints, getDifficultyColor, timeAgo } from "@/lib/utils";
import { CheckCircle, Flag, Users } from "lucide-react";

interface CompletedChallengesProps {
  challenges?: Challenge[];
  isLoading?: boolean;
  limit?: number;
  showAll?: boolean;
}

export default function CompletedChallenges({ 
  challenges, 
  isLoading = false, 
  limit = 5,
  showAll = false
}: CompletedChallengesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(limit).fill(0).map((_, i) => (
              <div key={i} className="border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> 
            Completed Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Challenges Completed Yet</h3>
            <p className="text-muted-foreground">Start solving challenges to see them here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the challenges to display (all or limited)
  const displayChallenges = showAll ? challenges : challenges.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> 
          Completed Challenges
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({challenges.length} total)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayChallenges.map((challenge) => {
            const difficultyColor = getDifficultyColor(challenge.difficulty);
            
            return (
              <div 
                key={challenge.id} 
                className="border border-border hover:border-primary rounded-md p-4 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${difficultyColor.bgColor} ${difficultyColor.textColor}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline">{challenge.category}</Badge>
                </div>
                
                <h3 className="font-mono text-lg font-medium text-white mb-1">{challenge.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{challenge.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1.5 h-4 w-4" />
                    <span>{challenge.solveCount} solves</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="flex items-center mr-3 text-sm text-amber-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="8"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                      {formatPoints(challenge.points)} pts
                    </span>
                    
                    <span className="text-sm text-muted-foreground">
                      {formatDate(challenge.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {!showAll && challenges.length > limit && (
            <div className="text-center pt-2">
              <span className="text-primary text-sm hover:underline cursor-pointer">
                View all {challenges.length} challenges
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
