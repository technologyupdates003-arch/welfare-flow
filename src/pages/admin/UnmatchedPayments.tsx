import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function UnmatchedPayments() {
  const queryClient = useQueryClient();
  const [assignDialog, setAssignDialog] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState("");

  const { data: unmatched } = useQuery({
    queryKey: ["unmatched-payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("unmatched_payments")
        .select("*, payments(amount, raw_message, received_at)")
        .eq("resolved", false)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: members } = useQuery({
    queryKey: ["all-members"],
    queryFn: async () => {
      const { data } = await supabase.from("members").select("id, name, phone").eq("is_active", true).order("name");
      return data || [];
    },
  });

  const assignPayment = useMutation({
    mutationFn: async ({ unmatchedId, paymentId, memberId }: { unmatchedId: string; paymentId: string; memberId: string }) => {
      // Update payment
      await supabase.from("payments").update({ member_id: memberId, matched: true }).eq("id", paymentId);
      // Resolve unmatched
      await supabase.from("unmatched_payments").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", unmatchedId);

      // Find pending contribution and mark as paid
      const { data: payment } = await supabase.from("payments").select("amount").eq("id", paymentId).single();
      if (payment) {
        const { data: pending } = await supabase
          .from("contributions")
          .select("id")
          .eq("member_id", memberId)
          .in("status", ["pending", "overdue"])
          .order("due_date")
          .limit(1)
          .maybeSingle();
        if (pending) {
          await supabase.from("contributions").update({
            status: "paid",
            paid_date: new Date().toISOString().split("T")[0],
            payment_id: paymentId,
          }).eq("id", pending.id);
          // Remove penalty
          await supabase.from("penalties").delete().eq("contribution_id", pending.id);
        }
        // Update totals
        const { data: totalData } = await supabase.from("contributions").select("amount").eq("member_id", memberId).eq("status", "paid");
        const total = (totalData || []).reduce((s, c) => s + Number(c.amount), 0);
        await supabase.from("members").update({ total_contributions: total }).eq("id", memberId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unmatched-payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setAssignDialog(null);
      toast.success("Payment assigned successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Unmatched Payments ({unmatched?.length || 0})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Extracted Phone</TableHead>
                <TableHead>Raw Message</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unmatched?.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="text-sm">{new Date(u.payments?.received_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">KES {Number(u.extracted_amount || u.payments?.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>{u.extracted_phone || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs">{u.raw_message || u.payments?.raw_message || "—"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => { setAssignDialog(u); setSelectedMember(""); }}>
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(unmatched?.length || 0) === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No unmatched payments</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Payment to Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Amount: KES {Number(assignDialog?.extracted_amount || assignDialog?.payments?.amount || 0).toLocaleString()}
            </p>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                {members?.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.phone})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedMember || assignPayment.isPending}
              onClick={() => assignPayment.mutate({
                unmatchedId: assignDialog.id,
                paymentId: assignDialog.payment_id,
                memberId: selectedMember,
              })}
              className="w-full"
            >
              {assignPayment.isPending ? "Assigning..." : "Assign Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
