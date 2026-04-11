import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function BulkSms() {
  const [target, setTarget] = useState("all");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: members } = useQuery({
    queryKey: ["members-for-sms", target],
    queryFn: async () => {
      if (target === "defaulters") {
        const { data: overdue } = await supabase
          .from("contributions")
          .select("member_id")
          .eq("status", "overdue");
        const memberIds = [...new Set((overdue || []).map(c => c.member_id))];
        if (memberIds.length === 0) return [];
        const { data } = await supabase.from("members").select("id, name, phone").in("id", memberIds);
        return data || [];
      }
      const { data } = await supabase.from("members").select("id, name, phone").eq("is_active", true);
      return data || [];
    },
  });

  const sendBulk = async () => {
    if (!members?.length || !message.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-bulk-sms", {
        body: { phones: members.map(m => m.phone), message: message.trim() },
      });
      if (error) throw error;
      toast.success(`SMS queued for ${members.length} recipients`);
      setMessage("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send SMS. Make sure SMS integration is configured.");
    }
    setSending(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk SMS</CardTitle>
        <CardDescription>Send SMS to all members or defaulters only</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 text-sm">
          <AlertCircle className="h-4 w-4 text-accent shrink-0" />
          SMS integration requires Twilio connector setup. Configure it to enable sending.
        </div>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="defaulters">Defaulters Only</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{members?.length || 0} recipients</p>
        <Textarea placeholder="Type your message..." rows={4} value={message} onChange={e => setMessage(e.target.value)} />
        <Button onClick={sendBulk} disabled={sending || !message.trim()} className="w-full sm:w-auto">
          <Send className="h-4 w-4 mr-2" /> {sending ? "Sending..." : "Send Bulk SMS"}
        </Button>
      </CardContent>
    </Card>
  );
}
