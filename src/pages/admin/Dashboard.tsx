import StatsCards from "@/components/admin/StatsCards";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: recentContribs } = useQuery({
    queryKey: ["recent-contributions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contributions")
        .select("*, members(name, phone)")
        .order("updated_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <StatsCards />
      <Card>
        <CardHeader>
          <CardTitle>Recent Contribution Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentContribs?.length === 0 && (
              <p className="text-muted-foreground text-sm">No contributions yet. Import members via Excel to get started.</p>
            )}
            {recentContribs?.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{c.members?.name}</p>
                  <p className="text-xs text-muted-foreground">{c.members?.phone} · {c.month}/{c.year}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">KES {Number(c.amount).toLocaleString()}</span>
                  <Badge variant={c.status === "paid" ? "default" : c.status === "overdue" ? "destructive" : "secondary"}>
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
