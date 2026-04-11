import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Payments() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*, members(name, phone)")
        .order("received_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Bank Payments</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Transaction Ref</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Matched</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>}
            {payments?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="text-sm">{new Date(p.received_at).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">KES {Number(p.amount).toLocaleString()}</TableCell>
                <TableCell>{p.members?.name || "—"}</TableCell>
                <TableCell className="text-xs">{p.transaction_ref || "—"}</TableCell>
                <TableCell>{p.source}</TableCell>
                <TableCell>
                  <Badge variant={p.matched ? "default" : "destructive"}>
                    {p.matched ? "Matched" : "Unmatched"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
