import { Link } from "wouter";
import { Challenge } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDifficultyColor, formatPoints } from "@/lib/utils";

interface ActiveChallengesProps {
  challenges?: Challenge[];
  isLoading?: boolean;
  limit?: number;
}

export default function ActiveChallenges({ challenges, isLoading = false, limit = 3 }: ActiveChallengesProps) {
  if (isLoading) {
    return (
      <Card className="bg-card mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no challenges
  if (!challenges || challenges.length === 0) {
    return (
      <Card className="bg-card mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-orbitron text-xl font-bold text-white">Active Challenges</CardTitle>
            <Link to="/challenges" className="text-primary text-sm flex items-center hover:underline">
              View All <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
            <h3 className="text-lg font-medium text-white mb-2">No Active Challenges</h3>
            <p className="text-muted-foreground mb-4">Start solving CTF challenges to see them here</p>
            <Link to="/challenges">
              <Button>Browse Challenges</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limit the number of challenges to display
  const displayChallenges = challenges.slice(0, limit);

  return (
    <Card className="bg-card mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-orbitron text-xl font-bold text-white">Active Challenges</CardTitle>
          <Link to="/challenges" className="text-primary text-sm flex items-center hover:underline">
            View All <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayChallenges.map((challenge) => {
            const difficultyColor = getDifficultyColor(challenge.difficulty);
            
            return (
              <div 
                key={challenge.id} 
                className="border border-border hover:border-primary rounded-md p-4 transition duration-300 ease-in-out"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${difficultyColor.bgColor} ${difficultyColor.textColor}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                  <span className="text-muted-foreground text-sm">{formatPoints(challenge.points)} pts</span>
                </div>
                <h3 className="font-mono text-lg font-medium text-white mb-1">{challenge.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span className="text-muted-foreground text-xs">{challenge.solveCount} solves</span>
                  </div>
                  <Link to={`/challenges`}>
                    <Button className="px-3 py-1.5 rounded bg-background text-primary text-sm font-medium border border-primary hover:bg-primary hover:bg-opacity-10 transition">
                      Start Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
