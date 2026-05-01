import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Eye, AlertTriangle, CheckCircle, Clock, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function TreasurerContributions() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch all members with real contribution data
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["treasurer-members-contributions"],
    queryFn: async () => {
      const { data: membersData, error } = await supabase
        .from("members")
        .select(`
          id,
          name,
          phone,
          is_active,
          created_at,
          total_contributions,
          total_penalties
        `)
        .order("name");

      if (error) {
        console.error("Error fetching members:", error);
        return [];
      }

      if (!membersData) return [];

      // Get contribution data for each member
      const membersWithContributions = await Promise.all(
        membersData.map(async (member) => {
          const { data: contributions } = await supabase
            .from("contributions")
            .select("amount, status, month, year, created_at")
            .eq("member_id", member.id)
            .order("created_at", { ascending: false });

          const { data: penalties } = await supabase
            .from("penalty_payments")
            .select("amount, status, created_at")
            .eq("member_id", member.id);

          // Use stored totals from members table
          const totalContributions = member.total_contributions || 0;
          const paidMonths = contributions?.filter(c => c.status === "paid").length || 0;
          const pendingMonths = contributions?.filter(c => c.status === "pending").length || 0;
          const totalPenalties = member.total_penalties || 0;
          
          // Get last contribution date
          const lastContribution = contributions?.[0]?.created_at;
          const monthsSinceLastContribution = lastContribution 
            ? Math.floor((new Date().getTime() - new Date(lastContribution).getTime()) / (1000 * 60 * 60 * 24 * 30))
            : 999;

          // Determine status based on real data
          let status = "active";
          if (!member.is_active) {
            status = "suspended";
          } else if (totalPenalties > 0) {
            // If member has pending penalties, they're a defaulter
            status = "defaulter";
          } else if (pendingMonths > 3 || monthsSinceLastContribution > 3) {
            status = "defaulter";
          } else if (pendingMonths > 1) {
            status = "warning";
          }

          return {
            ...member,
            totalContributions,
            paidMonths,
            pendingMonths,
            totalPenalties,
            monthsSinceLastContribution,
            lastContribution,
            status,
          };
        })
      );

      return membersWithContributions;
    },
  });

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // AI Assistant function
  const generateAIResponse = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setAiLoading(true);
    try {
      // Get context data for AI
      const defaulters = members.filter(m => m.status === "defaulter");
      const warnings = members.filter(m => m.status === "warning");
      const totalPendingAmount = members.reduce((sum, m) => sum + m.totalPenalties, 0);

      const context = `
You are a financial assistant for KHCWW (Kirinyaga Healthcare Workers' Welfare). 
Current data:
- Total Members: ${members.length}
- Active Members: ${members.filter(m => m.status === "active").length}
- Defaulters (>3 months): ${defaulters.length}
- Warning (1-3 months): ${warnings.length}
- Total Pending Penalties: Ksh ${totalPendingAmount.toLocaleString()}

Defaulters: ${defaulters.map(m => `${m.name} (${m.pendingMonths} months pending, Ksh ${m.totalPenalties})`).join(", ")}

User request: ${aiPrompt}

Provide helpful, professional financial advice or document suggestions.`;

      // Simulate AI response (in production, this would call an API)
      const response = await generateMockAIResponse(context);
      setAiResponse(response);
    } catch (error) {
      toast.error("Failed to generate AI response");
    } finally {
      setAiLoading(false);
    }
  };

  // Mock AI response generator
  const generateMockAIResponse = async (context: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (context.includes("memo") || context.includes("letter")) {
      return `📝 SUGGESTED MEMO TEMPLATE:

SUBJECT: Contribution Payment Reminder

Dear Members,

We hope this message finds you well. Our records indicate that several members have outstanding contributions. 

CURRENT STATUS:
- Members with pending payments: ${members.filter(m => m.pendingMonths > 0).length}
- Total amount pending: Ksh ${members.reduce((sum, m) => sum + m.totalPenalties, 0).toLocaleString()}

ACTION REQUIRED:
Please settle your outstanding contributions by [DATE] to avoid penalties.

For payment details, contact the treasurer.

Best regards,
KHCWW Treasurer`;
    } else if (context.includes("defaulter") || context.includes("follow")) {
      const defaulters = members.filter(m => m.status === "defaulter");
      return `📊 DEFAULTER FOLLOW-UP ANALYSIS:

Total Defaulters: ${defaulters.length}
Total Amount at Risk: Ksh ${defaulters.reduce((sum, m) => sum + m.totalPenalties, 0).toLocaleString()}

RECOMMENDED ACTIONS:
1. Send formal notice to defaulters
2. Schedule follow-up calls
3. Consider suspension if unpaid after 30 days
4. Document all communication attempts

TOP DEFAULTERS TO CONTACT:
${defaulters.slice(0, 5).map(m => `- ${m.name}: ${m.pendingMonths} months pending (Ksh ${m.totalPenalties})`).join("\n")}`;
    } else if (context.includes("report") || context.includes("summary")) {
      return `📈 FINANCIAL SUMMARY REPORT:

MEMBERSHIP STATUS:
- Active: ${members.filter(m => m.status === "active").length}
- Warning: ${members.filter(m => m.status === "warning").length}
- Defaulters: ${members.filter(m => m.status === "defaulter").length}
- Suspended: ${members.filter(m => m.status === "suspended").length}

FINANCIAL METRICS:
- Total Contributions: Ksh ${members.reduce((sum, m) => sum + m.totalContributions, 0).toLocaleString()}
- Pending Penalties: Ksh ${members.reduce((sum, m) => sum + m.totalPenalties, 0).toLocaleString()}
- Collection Rate: ${((members.filter(m => m.paidMonths > 0).length / members.length) * 100).toFixed(1)}%

RECOMMENDATIONS:
- Focus on defaulter recovery
- Implement automated reminders
- Consider incentives for early payment`;
    } else {
      return `💡 AI ASSISTANT RESPONSE:

Based on the current data, here are some insights:

1. COLLECTION STATUS: ${((members.filter(m => m.paidMonths > 0).length / members.length) * 100).toFixed(1)}% of members are current with payments.

2. RISK AREAS: ${members.filter(m => m.status === "defaulter").length} members are in default status (>3 months).

3. IMMEDIATE ACTION: Contact ${members.filter(m => m.totalPenalties > 0).length} members with pending penalties.

4. RECOMMENDATIONS:
   - Implement automated payment reminders
   - Schedule follow-up meetings with defaulters
   - Consider payment plans for members in difficulty
   - Document all communication for compliance

How can I help you further?`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case "defaulter":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Defaulter</Badge>;
      case "suspended":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <Card className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Total Members</p>
                <h3 className="text-2xl font-bold text-[#111827] mt-2">{members.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Active Members</p>
                <h3 className="text-2xl font-bold text-green-600 mt-2">
                  {members.filter(m => m.status === "active").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Warning</p>
                <h3 className="text-2xl font-bold text-yellow-600 mt-2">
                  {members.filter(m => m.status === "warning").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Defaulters</p>
                <h3 className="text-2xl font-bold text-red-600 mt-2">
                  {members.filter(m => m.status === "defaulter").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] font-medium">Suspended</p>
                <h3 className="text-2xl font-bold text-red-700 mt-2">
                  {members.filter(m => m.status === "suspended").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg font-bold text-[#111827]">Member Contributions</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* AI Assistant Button */}
              <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Assistant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>AI Financial Assistant</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Ask AI for help</label>
                      <Input
                        placeholder="e.g., Generate defaulter memo, Create follow-up letter, Summarize collection status..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={generateAIResponse}
                      disabled={aiLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
                    >
                      {aiLoading ? "Generating..." : "Generate Response"}
                    </Button>
                    {aiResponse && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-900 whitespace-pre-wrap">{aiResponse}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => {
                            navigator.clipboard.writeText(aiResponse);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          Copy to Clipboard
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <Input
                  placeholder="Search member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="defaulter">Defaulters</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">Phone</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#6B7280]">Months Paid</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#6B7280]">Pending</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B7280]">Total Contributions</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B7280]">Penalties</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#6B7280]">Last Payment</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#6B7280]">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{member.name}</p>
                          <p className="text-xs text-[#6B7280]">{member.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#111827]">{member.phone}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="font-mono">
                          {member.paidMonths}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {member.pendingMonths > 0 ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {member.pendingMonths}
                          </Badge>
                        ) : (
                          <span className="text-[#6B7280]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-[#111827]">
                        Ksh {member.totalContributions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {member.totalPenalties > 0 ? (
                          <span className="text-sm font-medium text-red-600">
                            Ksh {member.totalPenalties.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[#6B7280]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-[#6B7280]">
                        {member.lastContribution 
                          ? new Date(member.lastContribution).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(member.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMember(member)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Member Contribution History</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <h3 className="font-semibold text-[#111827]">{selectedMember.name}</h3>
                <p className="text-sm text-[#6B7280]">{selectedMember.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-700 font-medium">Months Paid</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{selectedMember.paidMonths}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium">Total Contributions</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    Ksh {selectedMember.totalContributions.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedMember.totalPenalties > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700 font-medium">Pending Penalties</p>
                      <p className="text-2xl font-bold text-red-900 mt-1">
                        Ksh {selectedMember.totalPenalties.toLocaleString()}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
