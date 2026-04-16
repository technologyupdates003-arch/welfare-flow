import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatDialog from "@/components/chat/NewChatDialog";
import { usePresence } from "@/hooks/usePresence";

export default function Chat() {
  usePresence();
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState<string | null>("group");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const { data: chatName } = useQuery({
    queryKey: ["chat-name", activeConv, user?.id],
    queryFn: async () => {
      if (!activeConv || activeConv === "group") return "Welfare Chat";
      const { data: conv } = await supabase.from("conversations").select("type, name").eq("id", activeConv).single();
      if (!conv) return "Chat";
      if (conv.type === "group") return conv.name || "Group Chat";
      const { data: parts } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", activeConv).neq("user_id", user!.id);
      if (!parts || parts.length === 0) return "Chat";
      const { data: member } = await supabase.from("members").select("name").eq("user_id", parts[0].user_id).maybeSingle();
      return member?.name || "Chat";
    },
    enabled: !!activeConv && !!user,
  });

  return (
    <div className="flex h-[calc(100vh-120px)] rounded-xl border border-border overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex-shrink-0 hidden md:flex flex-col">
        <ConversationList
          activeId={activeConv}
          onSelect={setActiveConv}
          onNewChat={() => setNewChatOpen(true)}
          onGroupChat={() => setNewGroupOpen(true)}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-3 bg-card">
          <h3 className="font-semibold text-sm">
            {chatName || "Chat"}
          </h3>
        </div>
        <ChatWindow conversationId={activeConv} />
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} onCreated={setActiveConv} />
      <NewChatDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} onCreated={setActiveConv} isGroup />
    </div>
  );
}
