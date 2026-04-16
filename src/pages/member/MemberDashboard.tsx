import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertTriangle, Clock, CheckCircle, CreditCard, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

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

  const { data: latestNews } = useQuery({
    queryKey: ["latest-news"],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false }).limit(3);
      return data || [];
    },
  });
  const unpaidCount = contributions?.filter(c => c.status !== "paid").length || 0;
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
            <Wallet className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold">KES {totalPaid.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unpaid</CardTitle>
            <Clock className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold text-destructive">{unpaidCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unpaid Penalties</CardTitle>
            <AlertTriangle className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent><div className="text-2xl font-display font-bold">KES {unpaidPenalties.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      {/* Payment Details Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5" />
            WELFARE PAYMENT DETAILS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center space-y-2">
            <div>
              <p className="text-purple-100 text-sm">Paybill NO.</p>
              <p className="text-2xl font-bold">400200</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Account No.</p>
              <p className="text-2xl font-bold">40088588</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest News */}
      {latestNews && latestNews.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" /> Latest News</CardTitle>
            <Link to="/member/news" className="text-xs text-primary underline">View All</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestNews.map((n: any) => (
              <div key={n.id} className="border-b border-border last:border-0 pb-2">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
                    variant={c.status === "paid" ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {c.status === "paid" && <CheckCircle className="h-3 w-3" />}
                    {c.status === "paid" ? "Paid" : "Unpaid"}
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
