import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, AlertTriangle, TrendingUp } from "lucide-react";

export default function StatsCards() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [members, contributions, settings, penalties] = await Promise.all([
        supabase.from("members").select("id, is_active", { count: "exact" }),
        supabase.from("contributions").select("amount, status"),
        supabase.from("welfare_settings").select("*").single(),
        supabase.from("penalties").select("amount, is_paid"),
      ]);

      const allContribs = contributions.data || [];
      const totalCollected = allContribs.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);
      const totalExpected = allContribs.reduce((s, c) => s + Number(c.amount), 0);
      const outstanding = totalExpected - totalCollected;
      const defaulters = new Set(allContribs.filter(c => c.status === "overdue")).size;
      const totalPenalties = (penalties.data || []).reduce((s, p) => s + Number(p.amount), 0);

      return {
        totalMembers: members.count || 0,
        totalCollected,
        totalExpected,
        outstanding,
        defaulters,
        totalPenalties,
        monthlyAmount: settings.data?.monthly_contribution_amount || 0,
      };
    },
  });

  const cards = [
    { title: "Total Collected", value: `KES ${(stats?.totalCollected || 0).toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { title: "Expected (All Time)", value: `KES ${(stats?.totalExpected || 0).toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
    { title: "Outstanding", value: `KES ${(stats?.outstanding || 0).toLocaleString()}`, icon: AlertTriangle, color: "text-warning" },
    { title: "Total Members", value: stats?.totalMembers || 0, icon: Users, color: "text-primary" },
    { title: "Defaulters", value: stats?.defaulters || 0, icon: AlertTriangle, color: "text-destructive" },
    { title: "Penalties Collected", value: `KES ${(stats?.totalPenalties || 0).toLocaleString()}`, icon: DollarSign, color: "text-accent" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ title, value, icon: Icon, color }) => (
        <Card key={title} className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
