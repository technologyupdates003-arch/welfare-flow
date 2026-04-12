import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onGroupChat: () => void;
  darkMode?: boolean;
}

export default function ConversationList({ activeId, onSelect, onNewChat, onGroupChat, darkMode = false }: ConversationListProps) {
  const { user } = useAuth();

  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      const ids = (participations || []).map(p => p.conversation_id);
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .in("id", ids)
        .order("updated_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: presenceData } = useQuery({
    queryKey: ["presence"],
    queryFn: async () => {
      const { data } = await supabase.from("user_presence").select("user_id, is_online");
      return new Map((data || []).map((p: any) => [p.user_id, p.is_online]));
    },
    refetchInterval: 10000,
  });

  const onlineCount = presenceData ? Array.from(presenceData.values()).filter(Boolean).length : 0;

  return (
    <div className={cn("flex flex-col h-full", darkMode ? "text-gray-100" : "")}>
      <div className={cn(
        "p-3 flex gap-2 border-b",
        darkMode ? "border-[#2A3942]" : "border-border"
      )}>
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onNewChat}>
          <UserPlus className="h-3.5 w-3.5 mr-1" /> New Chat
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onGroupChat}>
          <Users className="h-3.5 w-3.5 mr-1" /> New Group
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <button
          onClick={() => onSelect("group")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b",
            darkMode ? "border-[#2A3942] hover:bg-[#2A3942]" : "border-border hover:bg-muted/50",
            activeId === "group" && (darkMode ? "bg-[#2A3942]" : "bg-muted")
          )}
        >
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
            darkMode ? "bg-[#00A884]" : "bg-primary"
          )}>
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm">Group Chat</p>
            <p className={cn("text-xs", darkMode ? "text-gray-400" : "text-muted-foreground")}>
              {onlineCount} online
            </p>
          </div>
        </button>

        {conversations?.map((c: any) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b",
              darkMode ? "border-[#2A3942] hover:bg-[#2A3942]" : "border-border hover:bg-muted/50",
              activeId === c.id && (darkMode ? "bg-[#2A3942]" : "bg-muted")
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              darkMode ? "bg-[#2A3942]" : "bg-secondary"
            )}>
              {c.type === "group" ? <Users className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{c.name || "Private Chat"}</p>
              <p className={cn("text-xs", darkMode ? "text-gray-400" : "text-muted-foreground")}>{c.type}</p>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
