import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function MemberDashboard() {
  const { memberId } = useAuth();

  const { data: member } = useQuery({
    queryKey: ["my-member", memberId],
    queryFn: async () => {
      if (!memberId) return null;
      const { data } = await supabase.from("members").select("*").eq("id", memberId).single();
      return data;
    },
    enabled: !!memberId,
  });

  const { data: contributions } = useQuery({
    queryKey: ["my-contributions", memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data } = await supabase
        .from("contributions")
        .select("*")
        .eq("member_id", memberId)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      return data || [];
    },
    enabled: !!memberId,
  });

  const { data: penalties } = useQuery({
    queryKey: ["my-penalties", memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data } = await supabase.from("penalties").select("*").eq("member_id", memberId).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!memberId,
  });

  const totalPaid = contributions?.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;
  const pending = contributions?.filter(c => c.status === "pending").length || 0;
  const overdue = contributions?.filter(c => c.status === "overdue").length || 0;
  const unpaidPenalties = penalties?.filter(p => !p.is_paid).reduce((s, p) => s + Number(p.amount), 0) || 0;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Welcome, {member?.name || "Member"}</h1>
        <p className="text-muted-foreground text-sm">{member?.phone}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Contributed</CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold">KES {totalPaid.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold">{pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Overdue</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold text-destructive">{overdue}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unpaid Penalties</CardTitle>
            <AlertTriangle className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold">KES {unpaidPenalties.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Contribution History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contributions?.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{months[c.month - 1]} {c.year}</p>
                  <p className="text-xs text-muted-foreground">Due: {c.due_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">KES {Number(c.amount).toLocaleString()}</span>
                  <Badge
                    variant={c.status === "paid" ? "default" : c.status === "overdue" ? "destructive" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {c.status === "paid" && <CheckCircle className="h-3 w-3" />}
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
            {contributions?.length === 0 && <p className="text-muted-foreground text-sm">No contributions yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
