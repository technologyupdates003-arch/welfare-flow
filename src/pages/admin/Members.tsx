import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function Members() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", member_id: "" });

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", search],
    queryFn: async () => {
      let q = supabase.from("members").select("*").order("name");
      if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
      const { data } = await q;
      return data || [];
    },
  });

  const addMember = useMutation({
    mutationFn: async () => {
      const phone = form.phone.startsWith("+254") ? form.phone : `+254${form.phone.replace(/^0/, "")}`;
      // Create auth user with universal password
      const email = `${phone.replace("+", "")}@welfare.local`;
      const password = "Member2026"; // Universal password
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({ 
        email, 
        password, 
        email_confirm: true 
      });
      if (authErr) throw authErr;

      const { error } = await supabase.from("members").insert({
        name: form.name,
        phone,
        member_id: form.member_id || null,
        user_id: authData.user?.id,
      });
      if (error) throw error;

      // Add member role
      if (authData.user) {
        await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "member" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpen(false);
      setForm({ name: "", phone: "", member_id: "" });
      toast.success("Member added successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Member</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Phone (+254...)</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Member ID (optional)</Label><Input value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))} /></div>
              <Button onClick={() => addMember.mutate()} disabled={addMember.isPending} className="w-full">
                {addMember.isPending ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Members ({members?.length || 0})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>Total Contributions</TableHead>
                <TableHead>Penalties</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>}
              {members?.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.phone}</TableCell>
                  <TableCell>{m.member_id || "—"}</TableCell>
                  <TableCell>KES {Number(m.total_contributions).toLocaleString()}</TableCell>
                  <TableCell className={Number(m.total_penalties) > 0 ? "text-destructive font-medium" : ""}>
                    KES {Number(m.total_penalties).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.is_active ? "default" : "secondary"}>
                      {m.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
