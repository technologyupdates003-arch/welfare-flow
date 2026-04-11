import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Newspaper, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/member", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/member/news", icon: Newspaper, label: "News" },
  { to: "/member/chat", icon: MessageSquare, label: "Chat" },
  { to: "/member/notifications", icon: Bell, label: "Notifications" },
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
      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border flex justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors",
              location.pathname === to ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
