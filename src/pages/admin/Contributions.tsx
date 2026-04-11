import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Contributions() {
  const queryClient = useQueryClient();
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const [filterMonth, setFilterMonth] = useState(String(currentMonth));
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data: contributions, isLoading } = useQuery({
    queryKey: ["contributions", filterYear, filterMonth, filterStatus, search],
    queryFn: async () => {
      let q = supabase
        .from("contributions")
        .select("*, members(name, phone)")
        .eq("year", Number(filterYear))
        .eq("month", Number(filterMonth))
        .order("created_at", { ascending: false });
      if (filterStatus !== "all") q = q.eq("status", filterStatus);
      const { data } = await q;
      let result = data || [];
      if (search) {
        result = result.filter((c: any) =>
          c.members?.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.members?.phone?.includes(search)
        );
      }
      return result;
    },
  });

  const generateMonthly = useMutation({
    mutationFn: async () => {
      const { data: settings } = await supabase.from("welfare_settings").select("*").single();
      const { data: members } = await supabase.from("members").select("id").eq("is_active", true);
      if (!settings || !members) throw new Error("No settings or members found");

      const month = Number(filterMonth);
      const year = Number(filterYear);
      const dueDate = `${year}-${String(month).padStart(2, "0")}-${String(settings.contribution_due_day).padStart(2, "0")}`;

      for (const member of members) {
        await supabase.from("contributions").upsert(
          { member_id: member.id, amount: settings.monthly_contribution_amount, month, year, due_date: dueDate, status: "pending" },
          { onConflict: "member_id,month,year", ignoreDuplicates: true }
        );
      }

      // Mark overdue
      const today = new Date().toISOString().split("T")[0];
      const graceDate = new Date();
      graceDate.setDate(graceDate.getDate() - settings.penalty_grace_days);

      if (dueDate < today) {
        const { data: overdue } = await supabase
          .from("contributions")
          .select("id, member_id")
          .eq("month", month)
          .eq("year", year)
          .eq("status", "pending")
          .lt("due_date", graceDate.toISOString().split("T")[0]);

        for (const c of overdue || []) {
          await supabase.from("contributions").update({ status: "overdue" }).eq("id", c.id);
          // Add penalty
          const { data: existingPenalty } = await supabase
            .from("penalties")
            .select("id")
            .eq("contribution_id", c.id)
            .maybeSingle();
          if (!existingPenalty) {
            await supabase.from("penalties").insert({
              member_id: c.member_id,
              contribution_id: c.id,
              amount: settings.penalty_amount,
            });
            // Update member penalty total
            const { data: penaltyTotal } = await supabase
              .from("penalties")
              .select("amount")
              .eq("member_id", c.member_id);
            const total = (penaltyTotal || []).reduce((s, p) => s + Number(p.amount), 0);
            await supabase.from("members").update({ total_penalties: total }).eq("id", c.member_id);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Monthly contributions generated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusBadge = (status: string) => {
    const variant = status === "paid" ? "default" : status === "overdue" ? "destructive" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Year</label>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 7 }, (_, i) => currentYear - i).map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Month</label>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => generateMonthly.mutate()} disabled={generateMonthly.isPending}>
          <RefreshCw className="h-4 w-4 mr-2" /> Generate Monthly
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contributions — {months[Number(filterMonth) - 1]} {filterYear}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>}
              {contributions?.map((c: any) => (
                <TableRow key={c.id} className={c.status === "overdue" ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium">{c.members?.name}</TableCell>
                  <TableCell>{c.members?.phone}</TableCell>
                  <TableCell>KES {Number(c.amount).toLocaleString()}</TableCell>
                  <TableCell>{c.due_date}</TableCell>
                  <TableCell>{c.paid_date || "—"}</TableCell>
                  <TableCell>{statusBadge(c.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
