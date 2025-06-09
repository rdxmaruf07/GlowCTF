'use client';

import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar 
} from "@/components/ui/sidebar";
import { Link } from "wouter";
import { 
  LayoutDashboard,
  Flag,
  Bot,
  Trophy,
  Target,
  User,
  Gamepad2,
  Users,
  Shield
} from "lucide-react";

export function SidebarNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-blue-500",
    },
    {
      href: "/challenges",
      label: "Challenges",
      icon: Flag,
      color: "text-green-500",
    },
    {
      href: "/chatbot",
      label: "AI Chatbot",
      icon: Bot,
      color: "text-primary",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      color: "text-yellow-500",
    },
    {
      href: "/milestones",
      label: "Milestones",
      icon: Target,
      color: "text-orange-500",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      color: "text-cyan-500",
    },
    {
      href: "/practice",
      label: "Practice Arena",
      icon: Gamepad2,
      color: "text-pink-500",
    },
    {
      href: "/team",
      label: "Our Team",
      icon: Users,
      color: "text-indigo-500",
    }
  ];

  // Add admin route if user is admin
  if (user?.role === "admin") {
    navItems.push({
      href: "/admin",
      label: "Admin Panel",
      icon: Shield,
      color: "text-red-500",
    });
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href ||
              (item.href !== "/dashboard" && location.startsWith(item.href));

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className="h-10 hover:bg-sidebar-accent/50 transition-all duration-200 group"
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpenMobile(false)}
                    className="flex items-center gap-3"
                  >
                    <Icon
                      size={18}
                      className={`${item.color} group-hover:scale-110 transition-transform duration-200`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
