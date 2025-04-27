import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Ban, CheckCircle2, Search, AlertCircle, Shield, User, Code } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  score: number;
  createdAt: string;
  isBanned?: boolean;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userToBan, setUserToBan] = useState<UserData | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  
  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return res.json();
    }
  });
  
  // Ban/unban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: number, isBanned: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, { isBanned });
    },
    onSuccess: () => {
      toast({
        title: userToBan?.isBanned ? "User unbanned" : "User banned",
        description: userToBan?.isBanned 
          ? `${userToBan?.username} has been unbanned and can now access the platform.` 
          : `${userToBan?.username} has been banned from the platform.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsBanDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter users
  const filteredUsers = users 
    ? users.filter((user: UserData) => {
        const matchesSearch = searchQuery === "" || 
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "banned" && user.isBanned) || 
          (statusFilter === "active" && !user.isBanned);
          
        return matchesSearch && matchesRole && matchesStatus;
      })
    : [];
  
  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'hacker':
        return <Code className="h-4 w-4 text-accent" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Handle ban/unban
  const handleBanAction = () => {
    if (userToBan) {
      banUserMutation.mutate({ 
        userId: userToBan.id, 
        isBanned: !userToBan.isBanned 
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage users, roles, and platform access.
        </p>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={roleFilter}
          onValueChange={setRoleFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="hacker">Hacker</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Users Table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>
            {filteredUsers?.length || 0} users found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load users. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No users found matching your filters.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: UserData) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.score.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Banned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={user.isBanned ? "text-primary" : "text-destructive"}
                          onClick={() => {
                            setUserToBan(user);
                            setIsBanDialogOpen(true);
                          }}
                        >
                          {user.isBanned ? "Unban" : "Ban"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Ban/Unban Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userToBan?.isBanned ? "Unban User" : "Ban User"}
            </DialogTitle>
            <DialogDescription>
              {userToBan?.isBanned
                ? `Are you sure you want to unban ${userToBan?.username}? They will regain access to the platform.`
                : `Are you sure you want to ban ${userToBan?.username}? They will lose access to the platform.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsBanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant={userToBan?.isBanned ? "default" : "destructive"}
              onClick={handleBanAction}
              disabled={banUserMutation.isPending}
            >
              {banUserMutation.isPending 
                ? "Processing..." 
                : userToBan?.isBanned 
                  ? "Unban User" 
                  : "Ban User"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
