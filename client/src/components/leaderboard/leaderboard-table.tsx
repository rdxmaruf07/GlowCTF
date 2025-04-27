import { Badge as BadgeType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { BADGE_INFO } from "@/lib/constants";
import { formatPoints } from "@/lib/utils";

interface LeaderboardUser {
  id: number;
  username: string;
  score: number;
  badges: BadgeType[];
  solvedChallenges: number;
  rank: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  users?: LeaderboardUser[];
  currentUserRank?: number;
}

export default function LeaderboardTable({ users, currentUserRank }: LeaderboardTableProps) {
  if (!users || users.length === 0) {
    return (
      <div className="bg-card rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No users found in the leaderboard</p>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="w-full min-w-full divide-y divide-border">
        {/* Table Header */}
        <div className="bg-background">
          <div className="grid grid-cols-12 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Hacker</div>
            <div className="col-span-2 text-center">Challenges</div>
            <div className="col-span-2 text-center">Badges</div>
            <div className="col-span-2 text-right">Points</div>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-border">
          {users.map((user) => {
            const isCurrentUser = user.rank === currentUserRank || user.isCurrentUser;
            
            return (
              <div 
                key={user.id} 
                className={`grid grid-cols-12 px-6 py-4 ${
                  isCurrentUser ? 'bg-primary bg-opacity-5 border-l-4 border-primary' : 'hover:bg-background transition'
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <span className={isCurrentUser ? 'text-primary font-bold' : 'text-muted-foreground'}>
                    #{user.rank}
                  </span>
                </div>
                
                <div className="col-span-5 flex items-center">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden mr-3 border border-border">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isCurrentUser ? 'bg-primary/10 text-primary' : 'bg-background text-foreground'}`}>
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                      {user.username}
                    </div>
                    {isCurrentUser && (
                      <div className="text-muted-foreground text-xs">You</div>
                    )}
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-foreground">{user.solvedChallenges}/42</span>
                </div>
                
                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex">
                    {user.badges.slice(0, 3).map((badge, index) => {
                      const badgeInfo = BADGE_INFO[badge.name as keyof typeof BADGE_INFO];
                      const color = badgeInfo?.color || 'border-primary text-primary';
                      
                      return (
                        <div 
                          key={index}
                          className={`w-5 h-5 hexagon mr-1 flex items-center justify-center bg-background border ${color} text-[10px]`}
                          title={badge.name}
                        >
                          {/* Simplified indicator */}
                          {badge.name.charAt(0)}
                        </div>
                      );
                    })}
                    
                    {user.badges.length > 3 && (
                      <Badge className="h-5 bg-background text-muted-foreground border border-border text-[10px]">
                        +{user.badges.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center justify-end">
                  <span className={`font-bold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                    {formatPoints(user.score)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
