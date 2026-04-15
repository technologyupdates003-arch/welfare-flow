import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Newspaper, Bell, LogOut, Calendar, Download, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingChatBubble from "@/components/chat/FloatingChatBubble";

const navItems = [
  { to: "/member", icon: LayoutDashboard, label: "Home" },
  { to: "/member/events", icon: Calendar, label: "Events" },
  { to: "/member/beneficiaries", icon: Users, label: "Family" },
  { to: "/member/downloads", icon: Download, label: "Downloads" },
  { to: "/member/notifications", icon: Bell, label: "Alerts", showBadge: true },
  { to: "/member/profile", icon: User, label: "Profile" },
];

export default function MemberLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const { data: unreadNotifications = 0 } = useQuery({
    queryKey: ["unread-notification-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-primary">KIRINYAGA HCWW</h1>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </header>
      <div className="flex-1 p-4 lg:p-6 overflow-auto pb-20">
        {children}
      </div>
      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border flex justify-around py-2 z-40">
        {navItems.map(({ to, icon: Icon, label, showBadge }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors relative",
              location.pathname === to ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {showBadge && unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </div>
            {label}
          </Link>
        ))}
      </nav>
      <FloatingChatBubble />
    </div>
  );
}
