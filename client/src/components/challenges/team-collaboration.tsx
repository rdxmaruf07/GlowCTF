import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Users, MessageSquare, FileText, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface TeamCollaborationProps {
  challengeId: number;
}

interface TeamNote {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface TeamMember {
  id: number;
  username: string;
  avatarUrl?: string;
  isOnline: boolean;
}

export default function TeamCollaboration({ challengeId }: TeamCollaborationProps) {
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("notes");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch team notes
  const { 
    data: notes = [], 
    isLoading: notesLoading,
    refetch: refetchNotes
  } = useQuery({
    queryKey: [`/api/challenges/${challengeId}/team-notes`],
    enabled: !!challengeId && activeTab === "notes",
  });
  
  // Fetch team members
  const { 
    data: members = [], 
    isLoading: membersLoading 
  } = useQuery({
    queryKey: [`/api/challenges/${challengeId}/team-members`],
    enabled: !!challengeId && activeTab === "members",
  });
  
  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/challenges/${challengeId}/team-notes`,
        { content: note }
      );
      return res.json();
    },
    onSuccess: () => {
      setNote("");
      refetchNotes();
      toast({
        title: "Note Added",
        description: "Your note has been shared with your team",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Note",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle note submission
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    addNoteMutation.mutate();
  };
  
  // Invite team member mutation
  const inviteMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest(
        "POST",
        `/api/challenges/${challengeId}/invite`,
        { username }
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Your teammate has been invited to collaborate",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Invitation",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Collaboration
        </CardTitle>
        <CardDescription>
          Work together with your team to solve this challenge
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-4">
          <CardContent className="p-4">
            {notesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No notes yet. Be the first to share your findings!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {notes.map((note: TeamNote) => (
                  <div 
                    key={note.id} 
                    className={`p-3 rounded-lg ${
                      note.userId === user?.id 
                        ? "bg-primary/10 ml-8" 
                        : "bg-muted mr-8"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${note.username}`} />
                        <AvatarFallback>{note.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{note.username}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(note.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSubmitNote} className="mt-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Share your notes, findings or hints with your team..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!note.trim() || addNoteMutation.isPending}
                >
                  {addNoteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Share Note
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="members">
          <CardContent className="p-4">
            {membersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No team members yet. Invite someone to collaborate!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member: TeamMember) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl || `https://avatar.vercel.sh/${member.username}`} />
                        <AvatarFallback>{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.username}</p>
                        <Badge variant={member.isOnline ? "default" : "outline"} className="text-xs">
                          {member.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Invite Team Member
              </h4>
              <div className="flex gap-2">
                <Input placeholder="Enter username" />
                <Button size="sm">
                  Invite
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}