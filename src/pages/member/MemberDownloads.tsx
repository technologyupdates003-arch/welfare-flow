import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Eye, FileText, ScrollText } from "lucide-react";
import { toast } from "sonner";

export default function MemberDownloads() {
  const { user, memberId } = useAuth();
  const [showConstitution, setShowConstitution] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [statementHtml, setStatementHtml] = useState("");

  const { data: member } = useQuery({
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

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const generateStatementHtml = () => {
    const totalPaid = contributions?.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;
    const totalUnpaid = contributions?.filter(c => c.status !== "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;
    return `<!DOCTYPE html><html><head><title>Statement - ${member?.name}</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6}
    .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #16a34a;padding-bottom:20px}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th,td{border:1px solid #ddd;padding:10px;text-align:left}
    th{background:#16a34a;color:white}
    .paid{color:#16a34a;font-weight:bold}.unpaid{color:#ef4444;font-weight:bold}
    .summary{display:flex;gap:20px;margin:20px 0}
    .summary-card{flex:1;padding:15px;border-radius:8px;text-align:center}
    .total{background:#f0fdf4;border:1px solid #16a34a}.pend{background:#fef2f2;border:1px solid #ef4444}
    </style></head><body>
    <div class="header"><h1>KIRINYAGA HCWW</h1><h2>Member Statement</h2>
    <p><strong>${member?.name}</strong> | ${member?.phone} | ID: ${member?.member_id || 'N/A'}</p>
    <p>Generated: ${new Date().toLocaleDateString()}</p></div>
    <div class="summary"><div class="summary-card total"><h3>Total Paid</h3><h2>KES ${totalPaid.toLocaleString()}</h2></div>
    <div class="summary-card pend"><h3>Unpaid</h3><h2>KES ${totalUnpaid.toLocaleString()}</h2></div></div>
    <table><thead><tr><th>Period</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th></tr></thead><tbody>
    ${(contributions || []).map(c => `<tr><td>${months[c.month-1]} ${c.year}</td><td>KES ${Number(c.amount).toLocaleString()}</td>
    <td>${c.due_date}</td><td>${c.paid_date || '—'}</td>
    <td class="${c.status === 'paid' ? 'paid' : 'unpaid'}">${c.status === 'paid' ? 'PAID' : 'UNPAID'}</td></tr>`).join('')}
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
<style>body{font-family:Arial,sans-serif;margin:20px;line-height:1.8;max-width:800px;margin:0 auto;padding:20px}
.header{text-align:center;margin-bottom:30px;border-bottom:3px solid #16a34a;padding-bottom:20px}
.header h1{margin:0;color:#16a34a}.header p{margin:2px 0;font-size:14px;color:#555}
.section{margin-bottom:25px}.section h3{color:#16a34a;border-bottom:1px solid #ddd;padding-bottom:5px;margin-bottom:10px}
.section h4{color:#333;margin:10px 0 5px}
ol,ul{padding-left:25px}li{margin-bottom:6px}
.sub-list{list-style-type:lower-alpha}
</style></head><body>
<div class="header">
<h1>KIRINYAGA HEALTHCARE WORKERS' WELFARE CONSTITUTION</h1>
<p><strong>NAME:</strong> KIRINYAGA HCW WELFARE</p>
<p>P.O.BOX 24-10300 KERUGOYA</p>
<p>Khcww2020@gmail.com</p>
<p>LOCATION: KCRH</p>
<p><em>(2025 Dec. 11th Edition)</em></p>
</div>

<div class="section"><h3>A) INTRODUCTION</h3>
<p>Kirinyaga HealthCare Workers' welfare (KHCWW) was initiated to strengthen cohesiveness, relationship, interaction and support one another among the health workers. The welfare involves all the Healthcare Workers in Kirinyaga County who are willing to join welfare. The welfare shall perform activities agreed upon by the members during the initial formation meeting and any other activity that the members shall agree on during any other meeting where two-third votes shall approve.</p></div>

<div class="section"><h3>B) OBJECTIVES</h3>
<h4>Main objective</h4><p>To bring KHCWs together and cater for their welfare.</p>
<h4>Specific objectives</h4>
<ul><li>To unite the KHCWs</li>
<li>To help the KHCWs in times of need</li>
<li>To encourage participation amongst the KHCWs in times of joy and sorrow</li>
<li>To bring the overall development of the KHCWs socially, economically and professionally.</li></ul></div>

<div class="section"><h3>C) MEMBERSHIP</h3>
<ol type="a"><li>Membership is open to all KHCWS and it is voluntary</li>
<li>A person becomes a member upon paying a registration fee of Ksh.400.</li>
<li>There shall be a registration form to capture member's personal information which shall be in agreement with the constitution – done online.</li>
<li>Every registered member shall be required to pay a monthly contribution of Ksh 300.</li>
<li>A new member shall be required to wait for a period of about six months before enjoying the welfare packages.</li>
<li>Every registered member shall be required to participate fully in activities organized by the welfare.</li></ol></div>

<div class="section"><h3>D) DISCIPLINE</h3>
<ol><li>Monthly contribution shall be required on or before 15th of every month, failure to which it shall attract a penalty of Ksh 50 every month.</li>
<li>Personal contribution shall be required to be up to date for any member to benefit from the welfare.</li>
<li>Failure to pay monthly contribution for 2 consecutive months will lead to the member getting a warning. In the event that such a member, one month after the warning, does not pay up, he(s) ceases to be a member of the welfare.</li>
<li>A newly employed person including officers transferred from elsewhere willing to join the welfare shall do so only in January.</li>
<li>In view of clause C.c. above on registration, if it is verified that a member willfully gave wrong information with intention to mislead/or to defraud the welfare of any amount of money, such a member shall be required:
<ol type="a"><li>To pay a fine of amount equivalent to one year contribution.</li>
<li>The member shall not benefit from the welfare with what may have been otherwise given to the relative as the case may be.</li></ol></li></ol></div>

<div class="section"><h3>E) OFFICE BEARERS</h3>
<h4>1. CHAIRPERSON</h4>
<ol type="i"><li>The chairperson responsibilities shall include:</li>
<li>Chairing all committees and general meetings</li>
<li>Signatory to the bank account</li>
<li>Chief executive of the welfare</li></ol>
<h4>2. VICE CHAIRPERSON</h4>
<p>Shall deputize the chairperson on all responsibilities except being signatory to the bank account.</p>
<h4>3. SECRETARY</h4>
<ol type="i"><li>Shall keep up records of welfare</li>
<li>Receive and file all correspondences</li>
<li>Send all correspondences</li>
<li>Take the minutes during the meetings</li>
<li>Be a signatory to the bank account</li></ol>
<h4>4. VICE SECRETARY</h4>
<p>Shall deputize the secretary on all responsibilities except being a signatory to the bank account</p>
<h4>5. TREASURER</h4>
<ol type="i"><li>Shall receive and pay all money of the welfare</li>
<li>Shall be a signatory to the bank account</li>
<li>Shall keep up to date financial records of the welfare</li>
<li>Prepare annual report and submit to the members during general meetings.</li></ol>
<h4>6. PATRON: KCRH MANAGER</h4>
<ol type="i"><li>Must be a member of the welfare</li>
<li>Shall oversee all the elections of the welfare</li>
<li>Shall link the welfare with administration and other important offices.</li></ol></div>

<div class="section"><h3>F) GENERAL ELECTIONS</h3>
<ol type="i"><li>Elections shall be held every 3 years</li>
<li>They will be done through secret ballot</li>
<li>Only registered active members will be allowed to participate in the elections</li>
<li>Elections shall be held on one person one vote basis</li>
<li>Departments shall forward representatives 3 days prior to elections</li>
<li>Any registered member can be elected to hold any office</li></ol></div>

<div class="section"><h3>G) BY ELECTION</h3>
<ul><li>If an official dies, resigns, transfers or ceases to be a member, a by-election shall be conducted within one month.</li>
<li>If more than half of the office bearers cease to be members, retires, transfers, resigns a general election shall be conducted within one month.</li></ul></div>

<div class="section"><h3>H) VOTE OF NO CONFIDENCE</h3>
<ol type="i"><li>A vote of no confidence can be passed on any office bearer.</li>
<li>A vote of no confidence shall require the support of more than two thirds (2/3) of the committee members</li>
<li>If a vote of no confidence is passed on more than half (1/2) of the office bearers a general election shall be conducted within one month.</li></ol></div>

<div class="section"><h3>I) FINANCES</h3>
<h4>a) Sources:</h4>
<ol type="i"><li>Members contribution</li><li>Projects</li><li>Well-wishers and friends</li></ol>
<h4>b) BANKING:</h4>
<ol type="i"><li>All moneys shall be banked at Cooperative bank Kerugoya branch:
<ul><li>through Lipa na M-pesa. Pay bill No. 400200 then Account No. 40088588</li>
<li>or direct deposit at Co-operative bank through A/C No. 01134568843700.</li></ul></li>
<li>The signatories shall be the Chairman, Secretary and the Treasurer.</li>
<li>Withdrawals shall be made by all the three signatories.</li></ol></div>

<div class="section"><h3>J) ACTIVITIES/EXPENDITURE</h3>
<h4>a. Joyous Moments</h4>
<p>In case of a wedding, the welfare shall contribute:</p>
<ul><li>One principal member – Ksh.25,000</li>
<li>Two principal members – Ksh.50,000</li></ul></div>

<div class="section"><h3>K) Somber Moments</h3>
<p>To support the members in case of death of nuclear family and the four (4) parents as follows:</p>
<ol type="i"><li>Principal members – Ksh.50,000</li>
<li>Nuclear family – Spouse- Ksh.40,000, Child – Ksh. 30,000</li>
<li>Parent – Ksh.20,000</li></ol>
<p>Members to have representation for burial with at least 5 members. If possible, every department ought to be represented.</p>
<p>In case of an occurrence where two principle members are involved, each member shall benefit equally as per the constitution.</p></div>

<div class="section"><h3>L) END OF YEAR</h3>
<p>There shall be an end of year AGM and teambuilding party in December each year. The remaining funds shall be appropriated in investment as per the AGM 2025 11th December Financial Statement and Investment report.</p></div>

<div class="section"><h3>M) RETIREMENT</h3>
<ul><li>During the AGM the retirees will be appreciated with a farewell gift of Ksh. 20,000</li>
<li>The retiree shall notify the welfare executive through the secretary by January each year.</li>
<li>Any member, after retirement, willing to continue being a member of the welfare shall be allowed to do so and therefore continue with the monthly contributions.</li>
<li>Such a member shall be eligible for all other benefits provided for by the welfare except for retirement.</li></ul></div>

<div class="section"><h3>N) MEETINGS</h3>
<h4>General meetings:</h4>
<h4>1. AGM</h4>
<ul><li>Shall be held annually</li>
<li>One (1) month notice shall be given</li>
<li>Financial report shall be required during meetings</li>
<li>A quorum of half (1/2) of the members shall be required</li></ul>
<h4>2. Ordinary meetings:</h4>
<p>Ordinary meetings shall be held anytime as need may arise.</p></div>

<div class="section"><h3>O) AMENDMENTS</h3>
<ol type="i"><li>Any clause in the constitution can be amended by not less than 2/3 of the members.</li>
<li>In case of a clause being repealed more than 2/3 of the members shall be required to support.</li></ol></div>

<div class="section"><h3>P) DISSOLUTION</h3>
<ol type="i"><li>Members can call for dissolution of the welfare.</li>
<li>Dissolution shall require the support of 2/3 or more members.</li>
<li>Upon dissolution the assets shall be divided amongst the registered members or dealt with in any other way the members shall deem appropriate.</li></ol></div>
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold">Downloads</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" /> Constitution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">KIRINYAGA Healthcare Workers' Welfare Constitution (2025 Dec. 11th Edition)</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConstitution(true)} className="flex-1">
              <Eye className="h-4 w-4 mr-2" /> Read
            </Button>
            <Button variant="outline" onClick={downloadConstitution}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> My Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Your contribution statement showing payment history and balances</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={previewStatement} className="flex-1">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button variant="outline" onClick={downloadStatement}>
              <Download className="h-4 w-4" />
            </Button>
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
          <Button onClick={downloadStatement} className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
        </DialogContent>
      </Dialog>

      {/* Constitution Dialog */}
      <Dialog open={showConstitution} onOpenChange={setShowConstitution}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>KIRINYAGA HCWW Constitution</DialogTitle>
            <DialogDescription>2025 Dec. 11th Edition</DialogDescription>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: constitutionHtml }} />
          <Button onClick={downloadConstitution} className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
