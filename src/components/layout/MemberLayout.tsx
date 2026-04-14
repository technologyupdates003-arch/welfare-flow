import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Newspaper, Bell, LogOut, Calendar, FileText, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingChatBubble from "@/components/chat/FloatingChatBubble";

const navItems = [
  { to: "/member", icon: LayoutDashboard, label: "Home" },
  { to: "/member/events", icon: Calendar, label: "Events" },
  { to: "/member/beneficiaries", icon: Users, label: "Family" },
  { to: "/member/documents", icon: FileText, label: "Docs" },
  { to: "/member/notifications", icon: Bell, label: "Alerts" },
  { to: "/member/profile", icon: User, label: "Profile" },
];

export default function MemberLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-primary">My Welfare</h1>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </header>
      <div className="flex-1 p-4 lg:p-6 overflow-auto pb-20">
        {children}
      </div>
      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border flex justify-around py-2 z-40">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
              location.pathname === to ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
      <FloatingChatBubble />
    </div>
  );
}
