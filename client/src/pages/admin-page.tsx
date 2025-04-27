import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import ChallengeManagement from "@/components/admin/challenge-management";
import UserManagement from "@/components/admin/user-management";
import APIKeyManagement from "@/components/admin/api-key-management";
import ContestManagement from "@/components/admin/contest-management";
import AddChallengeForm from "@/components/admin/add-challenge-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('challenges');
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const { user } = useAuth();
  
  // Redirect if user is not an admin
  if (user && user.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Manage challenges, users, and platform settings.</p>
            </div>
          </div>
        </div>
        
        <Alert className="mb-6 bg-primary/10 border-primary">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-white">
            Admin actions are logged and may affect all users. Use with caution.
          </AlertDescription>
        </Alert>
        
        {/* Show add challenge form or admin tabs */}
        {showAddChallenge ? (
          <AddChallengeForm onBack={() => setShowAddChallenge(false)} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-4">
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="contests">Contests</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            </TabsList>
            
            <TabsContent value="challenges" className="space-y-6 mt-6">
              <ChallengeManagement onAddNew={() => setShowAddChallenge(true)} />
            </TabsContent>
            
            <TabsContent value="contests" className="space-y-6 mt-6">
              <ContestManagement />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6 mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="api-keys" className="space-y-6 mt-6">
              <APIKeyManagement />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
