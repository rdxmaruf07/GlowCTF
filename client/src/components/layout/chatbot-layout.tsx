import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface ChatbotLayoutProps {
  children: React.ReactNode;
}

export default function ChatbotLayout({ children }: ChatbotLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 h-screen overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}