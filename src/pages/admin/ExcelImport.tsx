import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface ParsedRow {
  name: string;
  phone: string;
  amount: number;
  date: string;
  rawPhone: string;
}

interface ImportResults {
  total: number;
  success: number;
  failed: number;
  created_members: number;
  existing_members: number;
  failures: { row: number; reason: string }[];
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("+254") && cleaned.length === 13) return cleaned;
  if (cleaned.startsWith("254") && cleaned.length === 12) return "+" + cleaned;
  if (cleaned.startsWith("07") && cleaned.length === 10) return "+254" + cleaned.slice(1);
  if (cleaned.startsWith("7") && cleaned.length === 9) return "+254" + cleaned;
  if (cleaned.startsWith("01") && cleaned.length === 10) return "+254" + cleaned.slice(1);
  if (/^\d{9}$/.test(cleaned)) return "+254" + cleaned;
  return null;
}

function parseExcelDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val === "number") {
    return new Date((val - 25569) * 86400 * 1000);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export default function ExcelImport() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<{ row: number; reason: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResults(null);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(ws);

        if (json.length === 0) {
          toast.error("No data found in the file");
          return;
        }

        // Check columns (case-insensitive)
        const firstRow = json[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());
        const requiredCols = ["name", "phone", "amount", "date"];
        const missing = requiredCols.filter(c => !keys.some(k => k.includes(c)));
        if (missing.length > 0) {
          toast.error(`Missing columns: ${missing.join(", ")}. Expected: Name, Phone, Amount, Date`);
          return;
        }

        const parsed: ParsedRow[] = [];
        const errors: { row: number; reason: string }[] = [];

        json.forEach((row: any, i: number) => {
          const rowNum = i + 2;
          const getVal = (field: string) => {
            const key = Object.keys(row).find(k => k.toLowerCase().includes(field));
            return key ? row[key] : undefined;
          };

          const name = String(getVal("name") || "").trim();
          const rawPhone = String(getVal("phone") || "").trim();
          const amountRaw = getVal("amount");
          const dateRaw = getVal("date");

          if (!name) { errors.push({ row: rowNum, reason: "Missing name" }); return; }
          
          const phone = normalizePhone(rawPhone);
          if (!phone) { errors.push({ row: rowNum, reason: `Invalid phone: "${rawPhone}"` }); return; }

          const amount = Number(amountRaw);
          if (isNaN(amount) || amount <= 0) { errors.push({ row: rowNum, reason: `Invalid amount: "${amountRaw}"` }); return; }

          const parsedDate = parseExcelDate(dateRaw);
          if (!parsedDate) { errors.push({ row: rowNum, reason: `Invalid date: "${dateRaw}"` }); return; }

          parsed.push({
            name,
            phone,
            amount,
            date: parsedDate.toISOString().split("T")[0],
            rawPhone,
          });
        });

        setRows(parsed);
        setParseErrors(errors);

        if (parsed.length > 0) {
          toast.success(`${parsed.length} valid rows parsed${errors.length > 0 ? `, ${errors.length} rows have issues` : ""}`);
        } else {
          toast.error("No valid rows found in the file");
        }
      } catch (err: any) {
        toast.error(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleImport = async () => {
    setImporting(true);
    setResults(null);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/bulk-import`;

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await resp.json();
      
      if (!resp.ok) {
        toast.error(data.error || "Import failed");
        return;
      }

      setResults(data);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });

      if (data.success > 0) toast.success(`${data.success} records imported successfully!`);
      if (data.failed > 0) toast.warning(`${data.failed} rows failed - see details below`);
    } catch (err: any) {
      toast.error(`Import error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Excel Import
          </CardTitle>
          <CardDescription>
            Upload an Excel file with columns: <strong>Name, Phone, Amount, Date</strong>. 
            The system will auto-create members and record contributions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="max-w-sm" />

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {parseErrors.length} rows skipped during parsing
              </p>
              <div className="max-h-40 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="w-20">Row</TableHead><TableHead>Reason</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseErrors.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{e.row}</TableCell>
                        <TableCell className="text-xs text-destructive">{e.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">{rows.length} valid rows ready</Badge>
                {parseErrors.length > 0 && <Badge variant="destructive">{parseErrors.length} skipped</Badge>}
              </div>
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
                        <TableCell className="font-mono text-xs">{r.phone}</TableCell>
                        <TableCell>KES {r.amount.toLocaleString()}</TableCell>
                        <TableCell>{r.date}</TableCell>
                      </TableRow>
                    ))}
                    {rows.length > 20 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                          ...and {rows.length - 20} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={handleImport} disabled={importing} className="w-full sm:w-auto">
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {importing ? "Importing..." : `Import ${rows.length} Records`}
              </Button>
            </>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm">Import Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded bg-background">
                  <div className="text-2xl font-bold">{results.total}</div>
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                </div>
                <div className="text-center p-2 rounded bg-green-50 dark:bg-green-950/30">
                  <div className="text-2xl font-bold text-green-600">{results.success}</div>
                  <div className="text-xs text-green-600">Successful</div>
                </div>
                <div className="text-center p-2 rounded bg-red-50 dark:bg-red-950/30">
                  <div className="text-2xl font-bold text-destructive">{results.failed}</div>
                  <div className="text-xs text-destructive">Failed</div>
                </div>
                <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-950/30">
                  <div className="text-2xl font-bold text-blue-600">{results.created_members}</div>
                  <div className="text-xs text-blue-600">New Members</div>
                </div>
              </div>

              {results.failures.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Failed Rows
                  </p>
                  <div className="max-h-48 overflow-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead className="w-20">Row</TableHead><TableHead>Reason</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.failures.map((f, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{f.row}</TableCell>
                            <TableCell className="text-xs text-destructive">{f.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {results.success > 0 && results.failed === 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" /> All rows imported successfully!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
