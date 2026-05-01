import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, UserMinus, Users, Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MemberBeneficiaries() {
  const { memberId } = useAuth();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [addForm, setAddForm] = useState({ name: "", relationship: "spouse", phone: "", id_number: "", reason: "" });
  const [removeForm, setRemoveForm] = useState({ reason: "" });

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

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["beneficiary-requests", memberId],
    queryFn: async () => {
      const { data } = await supabase
        .from("beneficiary_requests")
        .select("*")
        .eq("member_id", memberId!)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!memberId,
  });

  const submitAddRequest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("beneficiary_requests").insert({
        member_id: memberId!,
        request_type: "add",
        beneficiary_name: addForm.name,
        beneficiary_relationship: addForm.relationship,
        beneficiary_phone: addForm.phone || null,
        beneficiary_id_number: addForm.id_number || null,
        reason: addForm.reason,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-requests"] });
      setAddDialogOpen(false);
      setAddForm({ name: "", relationship: "spouse", phone: "", id_number: "", reason: "" });
      toast.success("Request submitted! Admin will review it.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitRemoveRequest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("beneficiary_requests").insert({
        member_id: memberId!,
        request_type: "remove",
        beneficiary_id: selectedBeneficiary.id,
        reason: removeForm.reason,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-requests"] });
      setRemoveDialogOpen(false);
      setRemoveForm({ reason: "" });
      setSelectedBeneficiary(null);
      toast.success("Removal request submitted! Admin will review it.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "default";
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="beneficiaries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="beneficiaries">My Beneficiaries</TabsTrigger>
          <TabsTrigger value="requests">
            My Requests
            {requests?.filter(r => r.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {requests.filter(r => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> My Beneficiaries
              </CardTitle>
              <CardDescription>
                View your registered beneficiaries. To add or remove, submit a request to admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : beneficiaries?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-4">No beneficiaries registered yet.</p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Request to Add Beneficiary
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Relationship</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Actions</TableHead>
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
                                size="sm"
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedBeneficiary(b);
                                  setRemoveDialogOpen(true);
                                }}
                              >
                                <UserMinus className="h-4 w-4 mr-1" /> Request Removal
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-center pt-4">
                    <Button onClick={() => setAddDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" /> Request to Add Beneficiary
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>Track your beneficiary add/remove requests</CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : requests?.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No requests submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {requests?.map(req => (
                    <Card key={req.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={req.request_type === "add" ? "default" : "secondary"}>
                                {req.request_type === "add" ? "Add" : "Remove"}
                              </Badge>
                              <Badge variant={getStatusColor(req.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(req.status)}
                                  {req.status}
                                </span>
                              </Badge>
                            </div>
                            {req.request_type === "add" ? (
                              <div className="mt-2">
                                <p className="font-medium">{req.beneficiary_name}</p>
                                <p className="text-sm text-muted-foreground capitalize">{req.beneficiary_relationship}</p>
                                {req.beneficiary_phone && <p className="text-sm text-muted-foreground">{req.beneficiary_phone}</p>}
                              </div>
                            ) : (
                              <p className="font-medium mt-2">Remove beneficiary request</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Reason:</strong> {req.reason}
                            </p>
                            {req.admin_notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Admin Notes:</strong> {req.admin_notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted: {new Date(req.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Beneficiary Request Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Add Beneficiary</DialogTitle>
            <DialogDescription>Submit a request to add a new beneficiary. Admin will review and approve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name *</Label><Input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Relationship *</Label>
              <Select value={addForm.relationship} onValueChange={v => setAddForm(f => ({ ...f, relationship: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Phone (optional)</Label><Input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label>ID Number (optional)</Label><Input value={addForm.id_number} onChange={e => setAddForm(f => ({ ...f, id_number: e.target.value }))} /></div>
            <div>
              <Label>Reason for Adding *</Label>
              <Textarea 
                value={addForm.reason} 
                onChange={e => setAddForm(f => ({ ...f, reason: e.target.value }))} 
                placeholder="Explain why you want to add this beneficiary..."
                rows={3}
              />
            </div>
            <Button 
              onClick={() => submitAddRequest.mutate()} 
              disabled={!addForm.name || !addForm.reason || submitAddRequest.isPending} 
              className="w-full"
            >
              {submitAddRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Beneficiary Request Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Remove Beneficiary</DialogTitle>
            <DialogDescription>Submit a request to remove {selectedBeneficiary?.name}. Admin will review and approve.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedBeneficiary?.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{selectedBeneficiary?.relationship}</p>
            </div>
            <div>
              <Label>Reason for Removal *</Label>
              <Textarea 
                value={removeForm.reason} 
                onChange={e => setRemoveForm(f => ({ ...f, reason: e.target.value }))} 
                placeholder="Explain why you want to remove this beneficiary..."
                rows={3}
              />
            </div>
            <Button 
              onClick={() => submitRemoveRequest.mutate()} 
              disabled={!removeForm.reason || submitRemoveRequest.isPending} 
              className="w-full"
              variant="destructive"
            >
              {submitRemoveRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Removal Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
