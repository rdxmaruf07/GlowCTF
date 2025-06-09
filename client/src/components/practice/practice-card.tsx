import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColor } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Vulnerability {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  category: string;
  icon: string;
}

interface PracticeCardProps {
  vulnerability: Vulnerability;
  onSelect: () => void;
}

export default function PracticeCard({ vulnerability, onSelect }: PracticeCardProps) {
  const difficultyColor = getDifficultyColor(vulnerability.difficulty);
  
  // Map the icon string to the corresponding Lucide icon
  const getIcon = (iconName: string) => {
    let IconComponent;
    
    switch (iconName) {
      case 'database':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
        );
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        );
      case 'file-up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 12v6"></path><path d="m15 15-3-3-3 3"></path></svg>
        );
      case 'terminal':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line></svg>
        );
      case 'arrow-right':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c-2 .6-3.5 2.4-3.5 4.6C1.1 16 3 18 5.4 18h13.4c2.1 0 4.1-1.7 4.1-4a3.9 3.9 0 0 0-2.4-3.6 3 3 0 0 0-.5-5C18.7 5 17.3 5 16 6c-.9-1.4-2.1-2-4-2Z"></path></svg>
        );
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition duration-300 border-border hover:border-primary">
      <CardHeader className="p-0">
        <div className="h-24 flex items-center justify-center bg-gradient-to-br from-background to-card-hover">
          <div className="text-primary opacity-50">
            {getIcon(vulnerability.icon)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${difficultyColor.bgColor} ${difficultyColor.textColor}`}>
            {vulnerability.difficulty.charAt(0).toUpperCase() + vulnerability.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline">{vulnerability.category}</Badge>
        </div>
        
        <h3 className="font-mono text-lg font-medium text-white mb-2">{vulnerability.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{vulnerability.description}</p>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-0">
        <Button 
          onClick={onSelect} 
          className="w-full bg-background text-primary border border-primary hover:bg-primary hover:bg-opacity-10 transition"
        >
          Start Practice
        </Button>
      </CardFooter>
    </Card>
  );
}
