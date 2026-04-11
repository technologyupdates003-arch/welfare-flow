import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";

interface ImportRow {
  name: string;
  phone: string;
  amount: number;
  date: string;
  month: number;
  year: number;
}

export default function ExcelImport() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(ws);

      const parsed: ImportRow[] = json.map((row: any) => {
        let phone = String(row.Phone || row.phone || row.PHONE || "").trim();
        if (phone.startsWith("0")) phone = "+254" + phone.slice(1);
        if (phone.startsWith("254")) phone = "+" + phone;
        if (!phone.startsWith("+")) phone = "+254" + phone;

        let dateStr = row.Date || row.date || row.DATE || "";
        let parsed_date: Date;
        if (typeof dateStr === "number") {
          parsed_date = new Date((dateStr - 25569) * 86400 * 1000);
        } else {
          parsed_date = new Date(dateStr);
        }
        if (isNaN(parsed_date.getTime())) parsed_date = new Date();

        return {
          name: String(row.Name || row.name || row.NAME || "").trim(),
          phone,
          amount: Number(row.Amount || row.amount || row.AMOUNT || 0),
          date: parsed_date.toISOString().split("T")[0],
          month: parsed_date.getMonth() + 1,
          year: parsed_date.getFullYear(),
        };
      }).filter(r => r.name && r.phone);

      setRows(parsed);
      setResults(null);
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleImport = async () => {
    setImporting(true);
    const errors: string[] = [];
    let success = 0;

    for (const row of rows) {
      try {
        // Check if member exists
        const { data: existing } = await supabase
          .from("members")
          .select("id")
          .eq("phone", row.phone)
          .maybeSingle();

        let memberId: string;

        if (existing) {
          memberId = existing.id;
        } else {
          // Create auth user
          const email = `${row.phone.replace("+", "")}@welfare.local`;
          const password = Math.random().toString(36).slice(-8) + "A1!";
          const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
          if (authErr) throw new Error(`Auth error for ${row.phone}: ${authErr.message}`);

          // Create member
          const { data: newMember, error: memberErr } = await supabase
            .from("members")
            .insert({ name: row.name, phone: row.phone, user_id: authData.user?.id })
            .select("id")
            .single();
          if (memberErr) throw new Error(`Member error for ${row.phone}: ${memberErr.message}`);
          memberId = newMember.id;

          // Add role
          if (authData.user) {
            await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "member" });
          }
        }

        // Insert contribution
        const dueDate = `${row.year}-${String(row.month).padStart(2, "0")}-05`;
        const { error: contribErr } = await supabase.from("contributions").upsert(
          {
            member_id: memberId,
            amount: row.amount,
            month: row.month,
            year: row.year,
            due_date: dueDate,
            status: "paid",
            paid_date: row.date,
          },
          { onConflict: "member_id,month,year" }
        );
        if (contribErr) throw new Error(`Contribution error: ${contribErr.message}`);

        // Update member totals
        const { data: totalData } = await supabase
          .from("contributions")
          .select("amount")
          .eq("member_id", memberId)
          .eq("status", "paid");
        const total = (totalData || []).reduce((s, c) => s + Number(c.amount), 0);
        await supabase.from("members").update({ total_contributions: total }).eq("id", memberId);

        success++;
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    setResults({ success, errors });
    setImporting(false);
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    if (success > 0) toast.success(`${success} records imported successfully`);
    if (errors.length > 0) toast.error(`${errors.length} errors occurred`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Excel Import
          </CardTitle>
          <CardDescription>
            Upload an Excel file with columns: Name, Phone, Amount, Date. The system will auto-create members and record contributions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="max-w-sm" />
          </div>

          {rows.length > 0 && (
            <>
              <div className="text-sm text-muted-foreground">{rows.length} rows parsed</div>
              <div className="max-h-64 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 20).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.phone}</TableCell>
                        <TableCell>KES {r.amount.toLocaleString()}</TableCell>
                        <TableCell>{r.date}</TableCell>
                      </TableRow>
                    ))}
                    {rows.length > 20 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">...and {rows.length - 20} more</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={handleImport} disabled={importing} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Importing..." : `Import ${rows.length} Records`}
              </Button>
            </>
          )}

          {results && (
            <div className="space-y-2 p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-success">
                <Check className="h-4 w-4" /> {results.success} imported successfully
              </div>
              {results.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" /> {results.errors.length} errors
                  </div>
                  <div className="max-h-32 overflow-auto text-xs text-destructive">
                    {results.errors.map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
