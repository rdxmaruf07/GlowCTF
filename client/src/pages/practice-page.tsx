import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import PracticeCard from "@/components/practice/practice-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PRACTICE_VULNERABILITIES } from "@/lib/constants";
import VulnerablePage from "@/components/practice/vulnerable-page";

export default function PracticePage() {
  const [selectedVulnerability, setSelectedVulnerability] = useState<string | null>(null);
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Practice Arena</h1>
            <p className="text-muted-foreground">Hone your skills on vulnerable practice environments.</p>
          </div>
        </div>
        
        <Alert className="mb-6 bg-accent/10 border-accent">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-white">
            These are controlled environments designed for learning. Practice ethical hacking techniques in a safe sandbox.
          </AlertDescription>
        </Alert>
        
        {selectedVulnerability ? (
          // Show the selected vulnerability practice page
          <VulnerablePage 
            vulnerability={PRACTICE_VULNERABILITIES.find(v => v.id === selectedVulnerability)!} 
            onBack={() => setSelectedVulnerability(null)}
          />
        ) : (
          // Show the list of vulnerabilities to practice
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRACTICE_VULNERABILITIES.map((vulnerability) => (
              <PracticeCard 
                key={vulnerability.id}
                vulnerability={vulnerability}
                onSelect={() => setSelectedVulnerability(vulnerability.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
