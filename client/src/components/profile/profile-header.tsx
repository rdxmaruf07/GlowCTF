import { useState } from "react";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPoints, getInitials } from "@/lib/utils";
import { Edit, Settings, Upload, X, Camera, Check, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

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
  isOwnProfile?: boolean;
}

// Predefined avatar options
const CYBERPUNK_AVATARS = [
  "https://i.imgur.com/3GXh03F.jpg", // Cyberpunk female
  "https://i.imgur.com/4KbKUYs.jpg", // Cyberpunk male with mask
  "https://i.imgur.com/7MnAHAc.jpg", // Cyberpunk with neon lights
  "https://i.imgur.com/9XdUdGJ.jpg", // Cyberpunk hacker
  "https://i.imgur.com/LZpYQr3.jpg", // Cyberpunk robot
  "https://i.imgur.com/Qn3XZYJ.jpg", // Cyberpunk samurai
];

const HACKER_AVATARS = [
  "https://i.imgur.com/vN6YxFp.jpg", // Anonymous mask
  "https://i.imgur.com/5dLmgIZ.jpg", // Hacker with hoodie
  "https://i.imgur.com/8JLRwPS.jpg", // Hacker with binary code
  "https://i.imgur.com/KzGk9Tg.jpg", // Hacker with matrix background
  "https://i.imgur.com/H9xsVl4.jpg", // Hacker silhouette
  "https://i.imgur.com/1J7URSM.jpg", // Hacker with glitch effect
];

export default function ProfileHeader({ user, stats, isOwnProfile = true }: ProfileHeaderProps) {
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cyberpunk");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
        
  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
  };
  
  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAvatarUrl(e.target.value);
    setSelectedAvatar(e.target.value);
  };
  
  // Function to validate image URL
  const validateImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      toast({
        title: "No avatar selected",
        description: "Please select an avatar or enter a custom URL",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Validate image URL if it's a custom URL (not from predefined avatars)
      if (!CYBERPUNK_AVATARS.includes(selectedAvatar) && !HACKER_AVATARS.includes(selectedAvatar)) {
        const isValidImage = await validateImageUrl(selectedAvatar);
        if (!isValidImage) {
          throw new Error("The provided image URL is invalid or inaccessible");
        }
      }
      
      const response = await apiRequest("PATCH", `/api/users/${user.id}/avatar`, {
        avatarUrl: selectedAvatar
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the user in the cache
        queryClient.setQueryData(["/api/user"], {
          ...user,
          avatarUrl: data.avatarUrl
        });
        
        // Also invalidate any profile-related queries to ensure they refresh
        queryClient.invalidateQueries([`/api/users/${user.id}/stats`]);
        
        toast({
          title: "Avatar updated",
          description: "Your profile avatar has been updated successfully",
        });
        
        setIsAvatarDialogOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update avatar");
      }
    } catch (error) {
      toast({
        title: "Failed to update avatar",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
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
          <div className="absolute -top-16 left-6 w-32 h-32 rounded-lg bg-background p-1.5 shadow-lg group">
            <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-md flex items-center justify-center overflow-hidden relative">
              {user.avatarUrl ? (
                <>
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show initials instead
                      (e.target as HTMLImageElement).style.display = 'none';
                      // Show the fallback element
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                  {/* Fallback for failed image load */}
                  <span className="hidden text-background font-bold text-4xl absolute inset-0 flex items-center justify-center">
                    {getInitials(user.username)}
                  </span>
                </>
              ) : (
                <span className="text-background font-bold text-4xl">
                  {getInitials(user.username)}
                </span>
              )}
              
              {/* Avatar edit overlay - only show for own profile */}
              {isOwnProfile && (
                <div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
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
              {isOwnProfile ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-primary border-primary"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-primary border-primary"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Avatar Selection Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Profile Avatar</DialogTitle>
            <DialogDescription>
              Choose a predefined avatar or upload your own custom image URL.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cyberpunk">Cyberpunk</TabsTrigger>
              <TabsTrigger value="hacker">Hacker</TabsTrigger>
              <TabsTrigger value="custom">Custom URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cyberpunk" className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                {CYBERPUNK_AVATARS.map((avatar, index) => (
                  <div 
                    key={index}
                    className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedAvatar === avatar ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <img 
                      src={avatar} 
                      alt={`Cyberpunk avatar ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar === avatar && (
                      <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="hacker" className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                {HACKER_AVATARS.map((avatar, index) => (
                  <div 
                    key={index}
                    className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedAvatar === avatar ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <img 
                      src={avatar} 
                      alt={`Hacker avatar ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar === avatar && (
                      <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Enter image URL"
                    value={customAvatarUrl}
                    onChange={handleCustomUrlChange}
                  />
                </div>
                
                {customAvatarUrl && (
                  <div className="relative w-32 h-32 mx-auto rounded-md overflow-hidden border-2 border-primary">
                    <img 
                      src={customAvatarUrl} 
                      alt="Custom avatar preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAvatar} 
              disabled={!selectedAvatar || isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Avatar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}