import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Challenge } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, FileEdit, Plus, AlertCircle, Search } from "lucide-react";
import { getDifficultyColor, formatPoints, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChallengeManagementProps {
  onAddNew: () => void;
}

export default function ChallengeManagement({ onAddNew }: ChallengeManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategory, setFilteredCategory] = useState<string>("all");
  const [filteredDifficulty, setFilteredDifficulty] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null);
  
  // Fetch challenges
  const { data: challenges, isLoading, error } = useQuery({
    queryKey: ['/api/challenges'],
  });
  
  // Delete challenge mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/challenges/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Challenge deleted",
        description: "The challenge has been permanently removed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get categories for filter
  const categories = challenges 
    ? Array.from(new Set(challenges.map((c: Challenge) => c.category))) 
    : [];
  
  // Filter challenges
  const filteredChallenges = challenges 
    ? challenges.filter((challenge: Challenge) => {
        const matchesSearch = searchQuery === "" || 
          challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = filteredCategory === "all" || 
          challenge.category === filteredCategory;
          
        const matchesDifficulty = filteredDifficulty === "all" || 
          challenge.difficulty === filteredDifficulty;
          
        return matchesSearch && matchesCategory && matchesDifficulty;
      })
    : [];
  
  // Handle delete confirmation
  const handleDelete = () => {
    if (challengeToDelete) {
      deleteMutation.mutate(challengeToDelete.id);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Challenge Management</h2>
          <p className="text-muted-foreground">
            Manage, create, and edit CTF challenges.
          </p>
        </div>
        
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Challenge
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={filteredCategory}
          onValueChange={setFilteredCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: string) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filteredDifficulty}
          onValueChange={setFilteredDifficulty}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Challenges Table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>CTF Challenges</CardTitle>
          <CardDescription>
            {filteredChallenges?.length || 0} challenges found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load challenges. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No challenges found matching your filters.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Solves</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChallenges.map((challenge: Challenge) => {
                    const difficultyColor = getDifficultyColor(challenge.difficulty);
                    
                    return (
                      <TableRow key={challenge.id}>
                        <TableCell className="font-medium">{challenge.title}</TableCell>
                        <TableCell>
                          <Badge className={`${difficultyColor.bgColor} ${difficultyColor.textColor}`}>
                            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{challenge.category}</TableCell>
                        <TableCell>{formatPoints(challenge.points)}</TableCell>
                        <TableCell>{challenge.solveCount}</TableCell>
                        <TableCell>{formatDate(challenge.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              onClick={() => {
                                setChallengeToDelete(challenge);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the challenge "{challengeToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Challenge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
