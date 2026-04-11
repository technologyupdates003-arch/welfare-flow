import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, members(name)")
        .order("created_at", { ascending: true })
        .limit(100);
      return data || [];
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { data: member } = await supabase.from("members").select("id").eq("user_id", user!.id).maybeSingle();
      const { error } = await supabase.from("messages").insert({
        user_id: user!.id,
        member_id: member?.id || null,
        content: message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  return (
    <Card className="flex flex-col h-[calc(100vh-160px)]">
      <CardHeader><CardTitle>Group Chat</CardTitle></CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-2 pb-2">
        {messages?.map((m: any) => (
          <div key={m.id} className={`flex flex-col ${m.user_id === user?.id ? "items-end" : "items-start"}`}>
            <span className="text-xs text-muted-foreground">{m.members?.name || "Admin"}</span>
            <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${
              m.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </CardContent>
      <div className="p-4 border-t border-border flex gap-2">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => e.key === "Enter" && message.trim() && sendMessage.mutate()}
        />
        <Button size="icon" onClick={() => message.trim() && sendMessage.mutate()} disabled={sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
