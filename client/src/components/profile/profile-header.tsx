import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPoints, getInitials } from "@/lib/utils";
import { Edit, Settings } from "lucide-react";

interface UserStats {
  rank: number;
  totalPoints: number;
  challengesSolved: number;
  badgesEarned: number;
  streak: number;
}

interface ProfileHeaderProps {
  user?: User | null;
  stats?: UserStats;
}

export default function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  if (!user) return null;
  
  // Get user role name for display
  const roleName = user.role === 'admin' 
    ? 'Administrator' 
    : user.role === 'hacker' 
      ? 'Elite Hacker' 
      : 'CTF Player';
  
  // Get badge for user level based on points
  const level = stats 
    ? Math.floor(stats.totalPoints / 1000) + 1 
    : 1;
  
  const levelTitle = level <= 3 
    ? 'Beginner' 
    : level <= 7 
      ? 'Intermediate' 
      : level <= 12 
        ? 'Advanced' 
        : 'Master';

  return (
    <Card className="w-full overflow-hidden">
      <div className="h-32 w-full bg-gradient-to-r from-primary/30 to-accent/30 relative">
        {/* Cover image gradient overlay */}
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        
        {/* Edit cover button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/60"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-6 w-32 h-32 rounded-lg bg-background p-1.5 shadow-lg">
          <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-md flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-background font-bold text-4xl">
                {getInitials(user.username)}
              </span>
            )}
          </div>
        </div>
        
        {/* Profile info */}
        <div className="ml-36 flex flex-col md:flex-row md:items-center md:justify-between pt-2">
          <div>
            <div className="flex items-center">
              <h1 className="font-orbitron text-2xl font-bold text-white">{user.username}</h1>
              
              <Badge className="ml-2 bg-primary/20 text-primary border-primary">
                Level {level}
              </Badge>
              
              <Badge className="ml-2 bg-background border-muted-foreground text-muted-foreground">
                {roleName}
              </Badge>
            </div>
            
            <div className="flex items-center mt-1">
              <p className="text-muted-foreground">
                <span className="text-white font-medium">#{stats?.rank || "–"}</span> on leaderboard • 
                <span className="text-white font-medium"> {levelTitle}</span> • 
                <span className="text-white font-medium"> {formatPoints(stats?.totalPoints || 0)}</span> points
              </p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" size="sm" className="text-primary border-primary">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
