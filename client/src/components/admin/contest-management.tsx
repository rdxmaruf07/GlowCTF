import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Form schema
const contestFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  isExternal: z.boolean().default(false),
  externalUrl: z.string().optional(),
}).refine(data => !data.isExternal || (data.isExternal && data.externalUrl && data.externalUrl.length > 0), {
  message: "External URL is required for external contests",
  path: ["externalUrl"]
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// Define interface for the form values
type ContestFormValues = z.infer<typeof contestFormSchema>;

// Interface for our contest data
interface Contest {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isExternal: boolean;
  externalUrl?: string;
  createdAt: string;
}

// Interface for challenges
interface Challenge {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  points: number;
}

export default function ContestManagement() {
  const { toast } = useToast();
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddChallengeDialogOpen, setIsAddChallengeDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("active");

  // Query for contests
  const {
    data: contests = [],
    isLoading: isLoadingContests,
  } = useQuery<Contest[]>({
    queryKey: ["/api/contests"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Query for challenges
  const {
    data: allChallenges = [],
    isLoading: isLoadingChallenges,
  } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Filter contests based on active tab
  const filteredContests = contests.filter(contest => {
    const now = new Date();
    const startDate = new Date(contest.startDate);
    const endDate = new Date(contest.endDate);
    
    if (selectedTab === "active") {
      return startDate <= now && endDate >= now;
    } else if (selectedTab === "upcoming") {
      return startDate > now;
    } else if (selectedTab === "past") {
      return endDate < now;
    }
    
    return true; // All contests for "all" tab
  });

  // Query for contest challenges if a contest is selected
  const {
    data: contestChallenges = [],
    isLoading: isLoadingContestChallenges,
    refetch: refetchContestChallenges,
  } = useQuery<Challenge[]>({
    queryKey: ["/api/contests", selectedContest?.id, "challenges"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedContest,
  });

  // Form for creating/editing contests
  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isExternal: false,
      externalUrl: "",
    },
  });

  // Reset form when selectedContest changes or edit mode toggles
  useEffect(() => {
    if (selectedContest && isEditMode) {
      form.reset({
        title: selectedContest.title,
        description: selectedContest.description,
        startDate: new Date(selectedContest.startDate),
        endDate: new Date(selectedContest.endDate),
        isExternal: selectedContest.isExternal,
        externalUrl: selectedContest.externalUrl || "",
      });
    } else if (!isEditMode) {
      form.reset({
        title: "",
        description: "",
        isExternal: false,
        externalUrl: "",
      });
    }
  }, [selectedContest, isEditMode, form]);

  // Create contest mutation
  const createContestMutation = useMutation({
    mutationFn: async (data: ContestFormValues) => {
      const res = await apiRequest("POST", "/api/admin/contests", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contest created",
        description: "The contest was created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating contest",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update contest mutation
  const updateContestMutation = useMutation({
    mutationFn: async (data: ContestFormValues & { id: number }) => {
      const { id, ...contestData } = data;
      const res = await apiRequest("PUT", `/api/admin/contests/${id}`, contestData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contest updated",
        description: "The contest was updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
      setSelectedContest(null);
      setIsEditMode(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating contest",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete contest mutation
  const deleteContestMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/contests/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contest deleted",
        description: "The contest was deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
      setSelectedContest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting contest",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add challenge to contest mutation
  const addChallengeToContestMutation = useMutation({
    mutationFn: async ({ contestId, challengeId }: { contestId: number; challengeId: number }) => {
      const res = await apiRequest("POST", `/api/admin/contests/${contestId}/challenges`, { challengeId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge added",
        description: "The challenge was added to the contest successfully",
      });
      setIsAddChallengeDialogOpen(false);
      refetchContestChallenges();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove challenge from contest mutation
  const removeChallengeFromContestMutation = useMutation({
    mutationFn: async ({ contestId, challengeId }: { contestId: number; challengeId: number }) => {
      const res = await apiRequest("DELETE", `/api/admin/contests/${contestId}/challenges/${challengeId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge removed",
        description: "The challenge was removed from the contest successfully",
      });
      refetchContestChallenges();
    },
    onError: (error: any) => {
      toast({
        title: "Error removing challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContestFormValues) => {
    if (isEditMode && selectedContest) {
      updateContestMutation.mutate({ ...data, id: selectedContest.id });
    } else {
      createContestMutation.mutate(data);
    }
  };

  // Function to add a challenge to the contest
  const addChallengeToContest = (challengeId: number) => {
    if (selectedContest) {
      addChallengeToContestMutation.mutate({
        contestId: selectedContest.id,
        challengeId,
      });
    }
  };

  // Function to remove a challenge from the contest
  const removeChallengeFromContest = (challengeId: number) => {
    if (selectedContest) {
      removeChallengeFromContestMutation.mutate({
        contestId: selectedContest.id,
        challengeId,
      });
    }
  };

  // Calculate the remaining available challenges (those not already in the contest)
  const availableChallenges = allChallenges.filter(
    challenge => !contestChallenges.some(cc => cc.id === challenge.id)
  );

  // Calculate status of a contest
  const getContestStatus = (contest: Contest) => {
    const now = new Date();
    const startDate = new Date(contest.startDate);
    const endDate = new Date(contest.endDate);
    
    if (startDate > now) {
      return "Upcoming";
    } else if (endDate < now) {
      return "Ended";
    } else {
      return "Active";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Contest Management</h2>
        <Button onClick={() => {
          setSelectedContest(null);
          setIsEditMode(false);
        }}>
          <Plus className="mr-2 h-4 w-4" /> New Contest
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contest form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Contest" : "Create Contest"}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? "Update the details of an existing contest" 
                : "Create a new CTF contest for your users"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contest title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the contest" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isExternal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>External Contest</FormLabel>
                        <FormDescription>
                          Check this if the contest is hosted on an external platform
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("isExternal") && (
                  <FormField
                    control={form.control}
                    name="externalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/contest" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-2">
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false);
                        setSelectedContest(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={createContestMutation.isPending || updateContestMutation.isPending}
                  >
                    {isEditMode ? "Update Contest" : "Create Contest"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Contest list and challenges */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contests</CardTitle>
              <Tabs defaultValue="active" onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoadingContests ? (
                <div className="text-center py-4">Loading contests...</div>
              ) : filteredContests.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No contests found</div>
              ) : (
                <div className="space-y-2">
                  {filteredContests.map(contest => (
                    <div 
                      key={contest.id}
                      className={cn(
                        "p-4 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
                        selectedContest?.id === contest.id && "bg-accent"
                      )}
                      onClick={() => setSelectedContest(contest)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">{contest.title}</h3>
                        <span 
                          className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            getContestStatus(contest) === "Active" && "bg-green-100 text-green-800",
                            getContestStatus(contest) === "Upcoming" && "bg-blue-100 text-blue-800",
                            getContestStatus(contest) === "Ended" && "bg-gray-100 text-gray-800"
                          )}
                        >
                          {getContestStatus(contest)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(contest.startDate), "PPP")} - {format(new Date(contest.endDate), "PPP")}
                      </p>
                      <div className="flex mt-2 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContest(contest);
                            setIsEditMode(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this contest?")) {
                              deleteContestMutation.mutate(contest.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedContest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Contest Challenges</span>
                  <Dialog open={isAddChallengeDialogOpen} onOpenChange={setIsAddChallengeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Challenge
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Challenge to Contest</DialogTitle>
                        <DialogDescription>
                          Select a challenge to add to "{selectedContest.title}"
                        </DialogDescription>
                      </DialogHeader>
                      {isLoadingChallenges ? (
                        <div className="text-center py-4">Loading challenges...</div>
                      ) : availableChallenges.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          All challenges have been added to this contest
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {availableChallenges.map(challenge => (
                            <div 
                              key={challenge.id}
                              className="p-3 border rounded-md flex justify-between items-center"
                            >
                              <div>
                                <div className="font-medium">{challenge.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {challenge.category} · {challenge.difficulty} · {challenge.points} pts
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => addChallengeToContest(challenge.id)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingContestChallenges ? (
                  <div className="text-center py-4">Loading challenges...</div>
                ) : contestChallenges.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No challenges added to this contest yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Challenge</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contestChallenges.map(challenge => (
                        <TableRow key={challenge.id}>
                          <TableCell className="font-medium">{challenge.title}</TableCell>
                          <TableCell>{challenge.category}</TableCell>
                          <TableCell>{challenge.difficulty}</TableCell>
                          <TableCell>{challenge.points}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeChallengeFromContest(challenge.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}