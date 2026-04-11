import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Users, User, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onGroupChat: () => void;
}

export default function ConversationList({ activeId, onSelect, onNewChat, onGroupChat }: ConversationListProps) {
  const { user } = useAuth();

  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(id, type, name, updated_at)")
        .eq("user_id", user!.id)
        .order("joined_at", { ascending: false });

      if (!data) return [];

      const convos = data
        .map((d: any) => d.conversations)
        .filter(Boolean)
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      // Get participant names for private chats
      const enriched = await Promise.all(
        convos.map(async (c: any) => {
          if (c.type === "private") {
            const { data: parts } = await supabase
              .from("conversation_participants")
              .select("user_id")
              .eq("conversation_id", c.id)
              .neq("user_id", user!.id);
            if (parts?.[0]) {
              const { data: member } = await supabase
                .from("members")
                .select("name")
                .eq("user_id", parts[0].user_id)
                .maybeSingle();
              return { ...c, displayName: member?.name || "Admin" };
            }
          }
          return { ...c, displayName: c.name || "Group Chat" };
        })
      );

      return enriched;
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">Chats</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewChat} title="New private chat">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onGroupChat} title="Group chat">
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {/* Group chat entry */}
        <button
          onClick={() => onSelect("group")}
          className={cn(
            "w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors border-b border-border",
            activeId === "group" && "bg-accent"
          )}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">General Group</p>
            <p className="text-xs text-muted-foreground">Everyone</p>
          </div>
        </button>
        {conversations?.map((c: any) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors border-b border-border",
              activeId === c.id && "bg-accent"
            )}
          >
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              {c.type === "group" ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{c.displayName}</p>
              <p className="text-xs text-muted-foreground">{c.type}</p>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
