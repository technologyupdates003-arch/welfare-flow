import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileText, Check, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminDocuments() {
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, members:member_id(name, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("documents").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success(`Document ${status}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const viewFile = async (fileUrl: string) => {
    try {
      const { data } = await supabase.storage.from("documents").createSignedUrl(fileUrl, 300);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Failed to open file");
    }
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { id_photo: "ID Photo", kyc: "KYC", certificate: "Certificate", other: "Other" };
    return map[t] || t;
  };

  const statusColor = (s: string): "default" | "destructive" | "secondary" =>
    s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary";

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Member Documents</h3>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : documents?.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No documents uploaded yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents?.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{doc.members?.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.members?.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.file_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{typeLabel(doc.file_type)}</TableCell>
                    <TableCell><Badge variant={statusColor(doc.status)}>{doc.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{doc.notes || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(doc.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => viewFile(doc.file_url)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateStatus.mutate({ id: doc.id, status: "approved" })}
                              disabled={updateStatus.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => updateStatus.mutate({ id: doc.id, status: "rejected" })}
                              disabled={updateStatus.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
