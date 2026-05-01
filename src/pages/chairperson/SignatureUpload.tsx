import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SignatureUpload() {
  const { user, role } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string>("");

  const uploadSignature = async (file: File) => {
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
      const fileName = `${role}-signature-${Date.now()}.${fileExt}`;
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

      // Save to office_bearer_signatures table
      // First check if record exists
      const signatureRole = role === "chairperson" ? "chairperson" : "secretary";
      const { data: existingRecord } = await supabase
        .from("office_bearer_signatures")
        .select("id")
        .eq("role", signatureRole)
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
          .eq("role", signatureRole);
        dbError = error;
      } else {
        // Insert new record (shouldn't happen since default records exist)
        const { error } = await supabase
          .from("office_bearer_signatures")
          .insert({
            role: signatureRole,
            signature_url: publicUrl,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          });
        dbError = error;
      }

      if (dbError) throw dbError;

      setSignatureUrl(publicUrl);
      toast.success("Signature uploaded successfully!");
    } catch (error: any) {
      toast.error(`Failed to upload signature: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadSignature(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Upload className="h-8 w-8" />
          Signature Upload
        </h1>
        <Badge variant="outline" className="text-sm">
          {role === "chairperson" ? "Chairperson" : "Secretary"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload your digital signature. This will be automatically added to meeting minutes when you approve them.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="signature-upload">Select Signature Image</Label>
              <Input
                id="signature-upload"
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

            {signatureUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600">Signature uploaded successfully</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img
                    src={signatureUrl}
                    alt="Your signature"
                    className="h-24 object-contain bg-white rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-2">How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Upload your signature image above</li>
            <li>When you approve meeting minutes, your signature is automatically added</li>
            <li>The signature will appear on all approved minutes</li>
            <li>You can update your signature anytime</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
