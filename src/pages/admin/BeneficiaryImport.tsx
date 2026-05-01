import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface BeneficiaryRow {
  memberPhone: string;
  memberName: string;
  spouseSurname?: string;
  spouseFirstName?: string;
  spouseOtherNames?: string;
  children: Array<{ surname: string; otherNames: string }>;
  fatherSurname?: string;
  fatherOtherNames?: string;
  motherSurname?: string;
  motherOtherNames?: string;
  spouseFatherName?: string;
  spouseMotherName?: string;
  nokName?: string;
  nokContact?: string;
  retirementDateRange?: string;
  idNumber?: string;
}

export default function BeneficiaryImport() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BeneficiaryRow[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ["members-for-beneficiary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("id, name, phone")
        .order("name");
      return data || [];
    },
  });

  const parseExcelFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const beneficiaries: BeneficiaryRow[] = data.map((row: any) => {
        // Parse children (columns for 1-6 children)
        const children = [];
        for (let i = 1; i <= 6; i++) {
          const surname = row[`${i}. SURNAME`];
          const otherNames = row[`${i}. OTHER NAMES`];
          if (surname || otherNames) {
            children.push({
              surname: surname || "",
              otherNames: otherNames || "",
            });
          }
        }

        return {
          memberPhone: row["PHONE NUMBER"]?.toString().trim() || "",
          memberName: `${row["FIRST NAME"] || ""} ${row["SURNAME"] || ""}`.trim(),
          spouseSurname: row["BENEFICIARIES [SPOUSE]"]?.toString().trim() || "",
          spouseFirstName: row["FIRST NAME"]?.toString().trim() || "",
          spouseOtherNames: row["OTHER NAMES"]?.toString().trim() || "",
          children,
          fatherSurname: row["SURNAME OF FATHER"]?.toString().trim() || "",
          fatherOtherNames: row["OTHER"]?.toString().trim() || "",
          motherSurname: row["SURNAME OF MOTHER"]?.toString().trim() || "",
          motherOtherNames: row["OTHER NAMES"]?.toString().trim() || "",
          spouseFatherName: row["SPOUSE FATHER'S NAME"]?.toString().trim() || "",
          spouseMotherName: row["SPOUSE MOTHER'S NAME"]?.toString().trim() || "",
          nokName: row["NAME OF N.O.K"]?.toString().trim() || "",
          nokContact: row["CONTACT DETAILS"]?.toString().trim() || "",
          retirementDateRange: row["RETIREMENT DATE RANGE"]?.toString().trim() || "",
          idNumber: row["I.D NUMBER"]?.toString().trim() || "",
        };
      });

      setPreview(beneficiaries);
      toast.success(`Parsed ${beneficiaries.length} beneficiary records`);
    } catch (error: any) {
      toast.error(`Failed to parse file: ${error.message}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    await parseExcelFile(selectedFile);
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Helper function to normalize phone numbers
      const normalizePhone = (phone: string): string => {
        if (!phone) return "";
        // Remove all non-digits
        const digits = phone.replace(/\D/g, "");
        // If it starts with 254, keep it; if it starts with 0, replace with 254; otherwise add 254
        if (digits.startsWith("254")) {
          return "+" + digits;
        } else if (digits.startsWith("0")) {
          return "+254" + digits.substring(1);
        } else {
          return "+254" + digits;
        }
      };

      for (const beneficiary of preview) {
        try {
          // Find member by phone number (with normalization)
          const normalizedBeneficiaryPhone = normalizePhone(beneficiary.memberPhone);
          const member = members.find(m => normalizePhone(m.phone) === normalizedBeneficiaryPhone);
          
          if (!member) {
            errors.push(`Member with phone ${beneficiary.memberPhone} not found`);
            errorCount++;
            continue;
          }

          // Prepare beneficiary data
          const beneficiaryData = {
            member_id: member.id,
            spouse_surname: beneficiary.spouseSurname || null,
            spouse_first_name: beneficiary.spouseFirstName || null,
            spouse_other_names: beneficiary.spouseOtherNames || null,
            children: beneficiary.children.length > 0 ? beneficiary.children : null,
            father_surname: beneficiary.fatherSurname || null,
            father_other_names: beneficiary.fatherOtherNames || null,
            mother_surname: beneficiary.motherSurname || null,
            mother_other_names: beneficiary.motherOtherNames || null,
            spouse_father_name: beneficiary.spouseFatherName || null,
            spouse_mother_name: beneficiary.spouseMotherName || null,
            nok_name: beneficiary.nokName || null,
            nok_contact: beneficiary.nokContact || null,
            retirement_date_range: beneficiary.retirementDateRange || null,
            id_number: beneficiary.idNumber || null,
          };

          // Check if beneficiary record exists
          const { data: existing } = await supabase
            .from("beneficiaries")
            .select("id")
            .eq("member_id", member.id)
            .single();

          if (existing) {
            // Update existing
            const { error } = await supabase
              .from("beneficiaries")
              .update(beneficiaryData)
              .eq("id", existing.id);
            if (error) throw error;
          } else {
            // Insert new
            const { error } = await supabase
              .from("beneficiaries")
              .insert(beneficiaryData);
            if (error) throw error;
          }

          successCount++;
        } catch (error: any) {
          errors.push(`Error for ${beneficiary.memberPhone}: ${error.message}`);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        throw new Error(`Imported ${successCount} records with ${errorCount} errors: ${errors.join("; ")}`);
      }

      return successCount;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast.success(`Successfully imported ${count} beneficiary records`);
      setPreview([]);
      setFile(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const downloadTemplate = () => {
    const template = [
      {
        "Timestamp": new Date().toISOString(),
        "Email Address": "member@example.com",
        "Member Surname": "Doe",
        "Member First Name": "John",
        "Member Other Names": "M",
        "Gender": "Male",
        "Phone Number": "0712345678",
        "Member Email": "john@example.com",
        "Department": "IT",
        "Spouse Surname": "Smith",
        "Spouse First Name": "Jane",
        "Spouse Other Names": "A",
        "Child 1 Surname": "Doe",
        "Child 1 Other Names": "Jr",
        "Child 2 Surname": "",
        "Child 2 Other Names": "",
        "Child 3 Surname": "",
        "Child 3 Other Names": "",
        "Child 4 Surname": "",
        "Child 4 Other Names": "",
        "Child 5 Surname": "",
        "Child 5 Other Names": "",
        "Child 6 Surname": "",
        "Child 6 Other Names": "",
        "Father Surname": "Doe",
        "Father Other Names": "Senior",
        "Mother Surname": "Johnson",
        "Mother Other Names": "Mary",
        "Relationship": "Spouse",
        "Spouse Father Name": "Smith",
        "Spouse Mother Name": "Brown",
        "NOK Name": "Jane Smith",
        "NOK Contact": "0712345679",
        "Retirement Date Range": "2025-2030",
        "ID Upload": "ID123456",
        "ID Number": "123456789",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Beneficiaries");
    XLSX.writeFile(wb, "beneficiary-template.xlsx");
    toast.success("Template downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Upload className="h-8 w-8" />
          Import Beneficiaries
        </h1>
        <Badge variant="outline">Excel Import</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Beneficiary Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload an Excel file with beneficiary information. Members will be matched by phone number.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="beneficiary-file">Select Excel File</Label>
              <Input
                id="beneficiary-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: .xlsx, .xls
              </p>
            </div>

            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({preview.length} records)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-left p-2">Member Phone</th>
                    <th className="text-left p-2">Spouse</th>
                    <th className="text-left p-2">Children</th>
                    <th className="text-left p-2">NOK</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{row.memberPhone}</td>
                      <td className="p-2">
                        {row.spouseSurname ? `${row.spouseSurname} ${row.spouseFirstName}` : "-"}
                      </td>
                      <td className="p-2">{row.children.length}</td>
                      <td className="p-2">{row.nokName || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending}
              className="w-full"
            >
              {importMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import {preview.length} Records
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            How It Works
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Download the template or prepare your Excel file</li>
            <li>Members are matched by phone number</li>
            <li>Each member can have one spouse, up to 6 children, and parent information</li>
            <li>Existing beneficiary records will be updated</li>
            <li>New records will be created for members without beneficiaries</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
