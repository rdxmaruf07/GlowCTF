import { Badge } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BADGE_INFO } from "@/lib/constants";
import { Link } from "wouter";

interface BadgeDisplayProps {
  badges?: Badge[];
  isLoading?: boolean;
  limit?: number;
  showAll?: boolean;
}

// Mapping for badge icons
const getBadgeIcon = (badgeName: string) => {
  const badgeInfo = BADGE_INFO[badgeName as keyof typeof BADGE_INFO];
  if (badgeInfo) {
    return badgeInfo.icon;
  }
  return 'award';
};

// Mapping for badge colors
const getBadgeColor = (badgeName: string) => {
  const badgeInfo = BADGE_INFO[badgeName as keyof typeof BADGE_INFO];
  if (badgeInfo) {
    return badgeInfo.color;
  }
  return 'border-primary text-primary';
};

export default function BadgeDisplay({ 
  badges, 
  isLoading = false, 
  limit = 4,
  showAll = false
}: BadgeDisplayProps) {
  // If badges are loading, show skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-orbitron text-xl font-bold text-white">Latest Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 hexagon" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no badges, show empty state
  if (!badges || badges.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-orbitron text-xl font-bold text-white">Latest Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No badges earned yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete challenges to earn badges
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limit the number of badges to display
  const displayBadges = showAll ? badges : badges.slice(0, limit);
  const lockedCount = Math.max(0, limit - displayBadges.length);

  return (
    <Card>
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle className="font-orbitron text-xl font-bold text-white">
          {showAll ? "All Badges" : "Latest Badges"}
        </CardTitle>
        {!showAll && badges.length > limit && (
          <Link href="/profile" className="text-primary text-sm flex items-center hover:underline">
            View All <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Display earned badges */}
          {displayBadges.map((badge) => {
            const iconName = getBadgeIcon(badge.name);
            const colorClass = getBadgeColor(badge.name);
            
            return (
              <div 
                key={badge.id} 
                className={`w-16 h-16 hexagon flex items-center justify-center bg-background border-2 ${colorClass} badge-glow`}
                title={badge.description}
              >
                {/* Render the appropriate icon based on badge type */}
                {iconName === 'trophy' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>}
                {iconName === 'timer' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                {iconName === 'brain' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"></path></svg>}
                {iconName === 'flame' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>}
                {iconName === 'medal' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="m7.3 15 .7 9 4-4 4 4 .7-9"></path></svg>}
                {iconName === 'award' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>}
              </div>
            );
          })}
          
          {/* Display locked badge placeholders */}
          {!showAll && [...Array(lockedCount)].map((_, i) => (
            <div 
              key={`locked-${i}`} 
              className="w-16 h-16 hexagon flex items-center justify-center bg-background border-2 border-gray-700 text-gray-700"
              title="Badge locked"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
