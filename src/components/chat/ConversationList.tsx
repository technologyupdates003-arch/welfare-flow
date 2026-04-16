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

  const { data: conversations, error: conversationsError } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Loading conversations for user:", user.id);
      
      // Get user's conversation participations
      const { data: participations, error: partError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      
      console.log("Participations:", participations, "Error:", partError);
      
      if (!participations || participations.length === 0) {
        console.log("No participations found");
        return [];
      }
      
      const conversationIds = participations.map(p => p.conversation_id);
      
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });
      
      if (!conversations) return [];
      
      // For private chats, resolve the other participant's name
      const conversationsWithData = await Promise.all(conversations.map(async (conv) => {
        let displayName = conv.name;
        let profilePicture: string | null = null;
        
        if (conv.type === "private") {
          const { data: parts } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id)
            .neq("user_id", user.id);
          
          if (parts && parts.length > 0) {
            const otherUserId = parts[0].user_id;
            // Check if admin
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", otherUserId)
              .maybeSingle();
            
            if (roleData?.role === "admin") {
              displayName = "Admin";
            } else {
              const { data: memberData } = await supabase
                .from("members")
                .select("name, profile_picture_url")
                .eq("user_id", otherUserId)
                .maybeSingle();
              displayName = memberData?.name || "Unknown";
              profilePicture = memberData?.profile_picture_url || null;
            }
          }
        }
        
        return { ...conv, displayName, profilePicture, unreadCount: 0 };
      }));
      
      return conversationsWithData;
    },
    enabled: !!user,
    refetchInterval: 5000,
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
        {/* Debug info */}
        {conversationsError && (
          <div className="p-4 text-center text-red-500">
            <p className="text-sm">Error loading conversations</p>
            <p className="text-xs">{conversationsError.message}</p>
          </div>
        )}
        
        {conversations?.length === 0 && !conversationsError && (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new chat to begin messaging</p>
          </div>
        )}
        
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
            <p className="font-medium text-sm">Welfare Chat</p>
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
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
              darkMode ? "bg-[#2A3942]" : "bg-secondary"
            )}>
              {c.profilePicture ? (
                <img src={c.profilePicture} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : c.type === "group" ? (
                <Users className="h-5 w-5" />
              ) : (
                <span className="text-sm font-bold">{(c.displayName || "?").charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate">
                  {c.displayName || c.name || (c.type === "group" ? "Group Chat" : "Chat")}
                </p>
                <span className={cn("text-xs", darkMode ? "text-gray-400" : "text-muted-foreground")}>
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={cn("text-xs truncate", darkMode ? "text-gray-400" : "text-muted-foreground")}>
                  {c.type === "private" ? "Private conversation" : "Group conversation"}
                </p>
                {c.unreadCount > 0 && (
                  <span className={cn(
                    "ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium text-white min-w-[18px] text-center",
                    darkMode ? "bg-[#00A884]" : "bg-primary"
                  )}>
                    {c.unreadCount > 99 ? "99+" : c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
