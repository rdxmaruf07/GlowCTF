import { useEffect } from "react";
import Sidebar from "./sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Add cyber-grid class to body
  useEffect(() => {
    document.body.classList.add('cyber-grid');
    
    return () => {
      document.body.classList.remove('cyber-grid');
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 lg:ml-72 min-h-screen">
        {children}
      </main>
    </div>
  );
}
