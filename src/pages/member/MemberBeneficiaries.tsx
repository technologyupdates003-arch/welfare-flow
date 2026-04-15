import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MemberBeneficiaries() {
  const { memberId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relationship: "spouse", phone: "", id_number: "" });

  const { data: beneficiaries, isLoading } = useQuery({
    queryKey: ["beneficiaries", memberId],
    queryFn: async () => {
      const { data } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("member_id", memberId!)
        .order("created_at");
      return data || [];
    },
    enabled: !!memberId,
  });

  const addBeneficiary = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("beneficiaries").insert({
        member_id: memberId!,
        name: form.name,
        relationship: form.relationship,
        phone: form.phone || null,
        id_number: form.id_number || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      setOpen(false);
      setForm({ name: "", relationship: "spouse", phone: "", id_number: "" });
      toast.success("Beneficiary added!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteBeneficiary = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("beneficiaries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast.success("Beneficiary removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> My Beneficiaries
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Beneficiary</DialogTitle>
                <DialogDescription>Add a person who will benefit from your welfare membership</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div>
                  <Label>Relationship *</Label>
                  <Select value={form.relationship} onValueChange={v => setForm(f => ({ ...f, relationship: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="in-law">In-Law</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Phone (optional)</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><Label>ID Number (optional)</Label><Input value={form.id_number} onChange={e => setForm(f => ({ ...f, id_number: e.target.value }))} /></div>
                <Button onClick={() => addBeneficiary.mutate()} disabled={!form.name || addBeneficiary.isPending} className="w-full">
                  {addBeneficiary.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Beneficiary
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : beneficiaries?.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No beneficiaries added yet. Tap "Add" to list your beneficiaries.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>ID No.</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiaries?.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="capitalize">{b.relationship}</TableCell>
                      <TableCell>{b.phone || "—"}</TableCell>
                      <TableCell>{b.id_number || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteBeneficiary.mutate(b.id)}
                          disabled={deleteBeneficiary.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
