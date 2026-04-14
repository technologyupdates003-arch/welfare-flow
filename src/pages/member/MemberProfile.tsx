import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, Loader2, Save, Lock, Download, FileText, Eye } from "lucide-react";
import { toast } from "sonner";

export default function MemberProfile() {
  const { user, memberId } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConstitution, setShowConstitution] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [statementHtml, setStatementHtml] = useState("");
  const [loadingStatement, setLoadingStatement] = useState(false);

  const { data: member, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("members").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: contributions } = useQuery({
    queryKey: ["my-contributions-statement", memberId],
    queryFn: async () => {
      const { data } = await supabase.from("contributions").select("*").eq("member_id", memberId!).order("year", { ascending: false }).order("month", { ascending: false });
      return data || [];
    },
    enabled: !!memberId,
  });

  const [name, setName] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const isInitialized = name || statusMsg;
  if (member && !isInitialized) {
    setName(member.name);
    setStatusMsg(member.status_message || "");
  }

  const changePassword = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Passwords don't match");
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setShowPasswordChange(false);
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("members").update({ name, status_message: statusMsg }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/profile.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("profile-images").upload(path, file, { upsert: true });
    if (uploadErr) { toast.error("Upload failed: " + uploadErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(path);
    await supabase.from("members").update({ profile_picture_url: urlData.publicUrl + "?t=" + Date.now() }).eq("user_id", user!.id);
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    toast.success("Photo updated!");
    setUploading(false);
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const generateStatementHtml = () => {
    const totalPaid = contributions?.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;
    const totalPending = contributions?.filter(c => c.status !== "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;
    return `<!DOCTYPE html><html><head><title>Statement - ${member?.name}</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6}
    .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #16a34a;padding-bottom:20px}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th,td{border:1px solid #ddd;padding:10px;text-align:left}
    th{background:#16a34a;color:white}
    .paid{color:#16a34a;font-weight:bold}.pending{color:#f59e0b}.overdue{color:#ef4444;font-weight:bold}
    .summary{display:flex;gap:20px;margin:20px 0}
    .summary-card{flex:1;padding:15px;border-radius:8px;text-align:center}
    .total{background:#f0fdf4;border:1px solid #16a34a}.pend{background:#fffbeb;border:1px solid #f59e0b}
    </style></head><body>
    <div class="header"><h1>KIRINYAGA HCWW</h1><h2>Member Statement</h2>
    <p><strong>${member?.name}</strong> | ${member?.phone} | ID: ${member?.member_id || 'N/A'}</p>
    <p>Generated: ${new Date().toLocaleDateString()}</p></div>
    <div class="summary"><div class="summary-card total"><h3>Total Paid</h3><h2>KES ${totalPaid.toLocaleString()}</h2></div>
    <div class="summary-card pend"><h3>Pending/Overdue</h3><h2>KES ${totalPending.toLocaleString()}</h2></div></div>
    <table><thead><tr><th>Period</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th></tr></thead><tbody>
    ${(contributions || []).map(c => `<tr><td>${months[c.month-1]} ${c.year}</td><td>KES ${Number(c.amount).toLocaleString()}</td>
    <td>${c.due_date}</td><td>${c.paid_date || '—'}</td>
    <td class="${c.status}">${c.status.toUpperCase()}</td></tr>`).join('')}
    </tbody></table>
    <p style="margin-top:40px;text-align:center;color:#666;font-size:12px">This is an auto-generated statement from KIRINYAGA HCWW System</p>
    </body></html>`;
  };

  const previewStatement = () => {
    setStatementHtml(generateStatementHtml());
    setShowStatement(true);
  };

  const downloadStatement = () => {
    const html = generateStatementHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${member?.name?.replace(/\s+/g, '-') || 'member'}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Statement downloaded!");
  };

  const constitutionHtml = `<!DOCTYPE html><html><head><title>KIRINYAGA HCWW Constitution</title>
  <style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6}.header{text-align:center;margin-bottom:40px}
  .article{margin-bottom:30px}.article h3{color:#16a34a;border-bottom:2px solid #16a34a;padding-bottom:5px}
  ol{padding-left:20px}li{margin-bottom:10px}</style></head><body>
  <div class="header"><h1>KIRINYAGA HEALTH CARE WORKERS WELFARE</h1><h2>CONSTITUTION</h2></div>
  <div class="article"><h3>Article 1: Name and Purpose</h3><ol>
  <li>The organization shall be known as "Kirinyaga Health Care Workers Welfare" (KIRINYAGA HCWW).</li>
  <li>The purpose is to provide mutual support and welfare benefits to health care workers in Kirinyaga.</li></ol></div>
  <div class="article"><h3>Article 2: Membership</h3><ol>
  <li>Membership is open to all health care workers in Kirinyaga County.</li>
  <li>Members must pay monthly contributions as determined by the organization.</li>
  <li>Members have equal rights and responsibilities within the organization.</li></ol></div>
  <div class="article"><h3>Article 3: Contributions</h3><ol>
  <li>Monthly contributions are due by the 5th of each month.</li>
  <li>Late payments may incur penalties as determined by the executive committee.</li>
  <li>Contribution amounts may be reviewed annually by the general assembly.</li></ol></div>
  <div class="article"><h3>Article 4: Benefits</h3><ol>
  <li>Members are entitled to welfare support during times of need.</li>
  <li>Emergency financial assistance may be provided to members in good standing.</li>
  <li>Social support during bereavements and celebrations.</li></ol></div>
  <div class="article"><h3>Article 5: Governance</h3><ol>
  <li>The organization shall be governed by an elected executive committee.</li>
  <li>Elections shall be held annually during the general assembly.</li>
  <li>All members in good standing are eligible to vote and be elected.</li></ol></div>
  <div class="article"><h3>Article 6: Amendments</h3><ol>
  <li>This constitution may be amended by a two-thirds majority vote of the general assembly.</li>
  <li>Proposed amendments must be circulated to members at least 30 days before voting.</li></ol></div>
  </body></html>`;

  const downloadConstitution = () => {
    const blob = new Blob([constitutionHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KIRINYAGA-HCWW-Constitution.html';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Constitution downloaded!");
  };

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={member?.profile_picture_url || ""} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{member?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={member?.phone || ""} disabled className="opacity-60" /></div>
            <div><Label>Member ID</Label><Input value={member?.member_id || "Not assigned"} disabled className="opacity-60" /></div>
            <div><Label>Status Message</Label><Input value={statusMsg} onChange={e => setStatusMsg(e.target.value)} placeholder="Hey there!" /></div>
            <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="w-full">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Security</CardTitle></CardHeader>
        <CardContent>
          {!showPasswordChange ? (
            <Button variant="outline" onClick={() => setShowPasswordChange(true)} className="w-full">Change Password</Button>
          ) : (
            <div className="space-y-3">
              <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" /></div>
              <div><Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
              <div className="flex gap-2">
                <Button onClick={() => changePassword.mutate()} disabled={changePassword.isPending || !newPassword || !confirmPassword} className="flex-1">
                  {changePassword.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  Update
                </Button>
                <Button variant="outline" onClick={() => { setShowPasswordChange(false); setNewPassword(""); setConfirmPassword(""); }}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Documents</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={previewStatement} className="flex-1"><Eye className="h-4 w-4 mr-2" /> View Statement</Button>
            <Button variant="outline" onClick={downloadStatement}><Download className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConstitution(true)} className="flex-1"><Eye className="h-4 w-4 mr-2" /> Read Constitution</Button>
            <Button variant="outline" onClick={downloadConstitution}><Download className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Statement Preview Dialog */}
      <Dialog open={showStatement} onOpenChange={setShowStatement}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>My Statement</DialogTitle>
            <DialogDescription>Preview your contribution statement</DialogDescription>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: statementHtml }} />
          <Button onClick={downloadStatement} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Statement</Button>
        </DialogContent>
      </Dialog>

      {/* Constitution Dialog */}
      <Dialog open={showConstitution} onOpenChange={setShowConstitution}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>KIRINYAGA HCWW Constitution</DialogTitle>
            <DialogDescription>Organization rules and guidelines</DialogDescription>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: constitutionHtml }} />
          <Button onClick={downloadConstitution} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Constitution</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
