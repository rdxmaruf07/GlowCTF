import { Badge } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { BADGE_INFO } from "@/lib/constants";
import { formatPoints } from "@/lib/utils";

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

interface LeaderboardTopUsersProps {
  users?: LeaderboardUser[];
}

export default function LeaderboardTopUsers({ users }: LeaderboardTopUsersProps) {
  if (!users || users.length === 0) {
    return null;
  }
  
  // Sort by rank just in case
  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);
  
  // Get top 3 or as many as we have
  const top3 = sortedUsers.slice(0, 3);
  
  // Re-order for display (2nd, 1st, 3rd)
  const displayOrder = top3.length === 3 
    ? [top3[1], top3[0], top3[2]] 
    : top3;
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {displayOrder.map((user, index) => {
        // Calculate styles and classes based on position
        const position = top3.length === 3 
          ? index === 0 ? 2 : index === 1 ? 1 : 3
          : user.rank;
          
        const isFirst = position === 1;
        const isSecond = position === 2;
        const isThird = position === 3;
        
        // Determine trophy and color based on position
        const trophyIcon = isFirst 
          ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary text-2xl mr-2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
          : isSecond 
            ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent text-2xl mr-2"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="m7.3 15 .7 9 4-4 4 4 .7-9"></path></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 text-2xl mr-2"><path d="M19.42 24S18 20 12 20s-7.42 4-7.42 4"></path><path d="M12 15a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z"></path></svg>;
            
        const textColor = isFirst ? "text-primary neon-glow" : isSecond ? "text-accent neon-pink-glow" : "text-amber-500 neon-green-glow";
        const borderColor = isFirst ? "border-primary" : isSecond ? "border-accent" : "border-amber-500";
        const animationClass = isFirst ? "animate-glow" : "animate-glow-slow";
        const size = isFirst ? "w-24 h-24" : "w-20 h-20";
        const cardScale = isFirst ? "transform md:scale-110 z-10" : "";
        
        return (
          <Card 
            key={user.id} 
            className={`md:order-${position} flex-1 bg-card p-5 flex flex-col items-center ${animationClass} ${cardScale}`}
          >
            <div className={`${size} rounded-full bg-background border-4 ${borderColor} overflow-hidden mb-4`}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-background">
                  <span className={`font-medium text-xl ${textColor}`}>
                    {user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center mb-2">
              {trophyIcon}
              <span className={`font-orbitron ${textColor} font-bold ${isFirst ? 'text-2xl' : 'text-xl'}`}>
                {position}{position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'}
              </span>
            </div>
            
            <h3 className="text-white font-medium text-center mb-1">{user.username}</h3>
            <p className="text-muted-foreground text-sm text-center mb-3">{formatPoints(user.score)} points</p>
            
            <div className="flex items-center justify-center">
              {user.badges.slice(0, 4).map((badge, badgeIndex) => {
                const badgeInfo = BADGE_INFO[badge.name as keyof typeof BADGE_INFO];
                const color = badgeInfo?.color || 'border-primary text-primary';
                const icon = badgeInfo?.icon || 'award';
                
                return (
                  <div 
                    key={badgeIndex} 
                    className={`w-6 h-6 hexagon mr-1 flex items-center justify-center bg-background border ${color} text-xs ${isFirst ? 'badge-glow' : ''}`}
                  >
                    {/* Simplified version with just an icon letter */}
                    {icon === 'trophy' && <span>T</span>}
                    {icon === 'timer' && <span>S</span>}
                    {icon === 'brain' && <span>B</span>}
                    {icon === 'flame' && <span>F</span>}
                    {icon === 'medal' && <span>M</span>}
                    {icon === 'award' && <span>A</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
