import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSignature, CheckCircle, AlertCircle, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OfficeSignatures() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: signatures = [] } = useQuery({
    queryKey: ["office-signatures"],
    queryFn: async () => {
      const { data } = await supabase
        .from("office_bearer_signatures")
        .select("*")
        .order("role");
      return data || [];
    },
  });

  const uploadAdminSignature = async (file: File) => {
    try {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `admin-signature-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("signatures")
        .getPublicUrl(filePath);

      // Check if admin signature record exists
      const { data: existingRecord } = await supabase
        .from("office_bearer_signatures")
        .select("id")
        .eq("role", "admin")
        .single();

      let dbError;
      if (existingRecord?.id) {
        // Update existing record
        const { error } = await supabase
          .from("office_bearer_signatures")
          .update({
            signature_url: publicUrl,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq("role", "admin");
        dbError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("office_bearer_signatures")
          .insert({
            role: "admin",
            signature_url: publicUrl,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          });
        dbError = error;
      }

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["office-signatures"] });
      toast.success("Admin signature uploaded successfully!");
    } catch (error: any) {
      toast.error(`Failed to upload signature: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAdminSignature(file);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "chairperson":
        return "Chairperson";
      case "secretary":
        return "Secretary";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  const adminSignature = signatures.find(s => s.role === "admin");
  const otherSignatures = signatures.filter(s => s.role !== "admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileSignature className="h-8 w-8" />
          Office Bearer Signatures
        </h1>
      </div>

      {/* Admin Signature Upload Section */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Admin Signature</CardTitle>
          <Badge variant={adminSignature?.signature_url ? "default" : "secondary"}>
            {adminSignature?.signature_url ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Uploaded
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Uploaded
              </div>
            )}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload your signature to use on official documents and approvals.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-signature-upload">Select Signature Image</Label>
              <Input
                id="admin-signature-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, or JPEG • Max 2MB
              </p>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-600">Uploading signature...</p>
              </div>
            )}

            {adminSignature?.signature_url && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600">Your signature is uploaded</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Current Signature:</p>
                  <img
                    src={adminSignature.signature_url}
                    alt="Admin signature"
                    className="h-20 object-contain bg-gray-50 dark:bg-gray-900 rounded border border-border p-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(adminSignature.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Other Office Bearer Signatures */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Other Office Bearer Signatures</h2>
        <div className="grid gap-4">
          {otherSignatures.map((sig: any) => (
            <Card key={sig.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">{getRoleLabel(sig.role)}</CardTitle>
                <Badge variant={sig.signature_url ? "default" : "secondary"}>
                  {sig.signature_url ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Uploaded
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Pending
                    </div>
                  )}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {sig.signature_url ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Signature:</p>
                    <img
                      src={sig.signature_url}
                      alt={`${sig.role} signature`}
                      className="h-20 object-contain bg-gray-50 dark:bg-gray-900 rounded border border-border p-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date(sig.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No signature uploaded yet. The {getRoleLabel(sig.role)} needs to upload their signature.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-2">How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Admin can upload their signature directly on this page</li>
            <li>Office bearers (Chairperson, Secretary) upload their signatures from their dashboards</li>
            <li>Signatures are automatically added to approved meeting minutes</li>
            <li>This page shows the current status of all office bearer signatures</li>
            <li>Signatures can be updated anytime</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
