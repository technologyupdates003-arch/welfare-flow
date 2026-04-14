import { useState } from "react";
import { MessageCircle, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";
import NewChatDialog from "./NewChatDialog";
import { usePresence } from "@/hooks/usePresence";
import { useNotifications } from "@/hooks/useNotifications";
import chatLogo from "@/assets/chat-logo-watermark.png";

export default function FloatingChatBubble() {
  usePresence();
  useNotifications(); // Enable push notifications
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Get total unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["total-unread", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      // Get user's conversations
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      
      const conversationIds = (participations || []).map(p => p.conversation_id);
      if (conversationIds.length === 0) return 0;
      
      // Count unread messages across all conversations
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("user_id", user.id)
        .neq("status", "read");
      
      return count || 0;
    },
    enabled: !!user && !open, // Only fetch when closed
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const showChat = activeConv !== null;

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(!open)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}
        className={cn(
          "h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110 relative",
          open && "rotate-90"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat panel - full screen on mobile */}
      {open && (
        <div
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden animate-scale-in",
            // Mobile: full screen, Desktop: floating panel positioned from right
            "inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[380px] md:h-[560px] md:rounded-2xl md:border md:border-border md:shadow-2xl",
            darkMode ? "chat-dark" : "chat-light"
          )}
        >
          {/* Header */}
          <div className={cn(
            "px-4 py-3 flex items-center gap-2 shrink-0",
            darkMode
              ? "bg-[#075E54] text-white"
              : "bg-primary text-primary-foreground"
          )}>
            {showChat ? (
              <button onClick={() => setActiveConv(null)} className="mr-1">
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <h3 className="font-semibold text-sm flex-1">
              {showChat
                ? activeConv === "group"
                  ? "Welfare Chat"
                  : "Private Chat"
                : "Chats"
              }
            </h3>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-xs px-2 py-1 rounded-full bg-white/20 hover:bg-white/30"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body with watermark */}
          <div className={cn(
            "flex-1 relative min-h-0",
            darkMode ? "bg-[#0B141A]" : "bg-[#ECE5DD]"
          )}>
            {/* Watermark logo */}
            {showChat && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
                <img src={chatLogo} alt="" width={256} height={256} className="select-none" />
              </div>
            )}
            <div className="relative h-full flex flex-col">
              {showChat ? (
                <ChatWindow conversationId={activeConv} darkMode={darkMode} />
              ) : (
                <ConversationList
                  activeId={activeConv}
                  onSelect={setActiveConv}
                  onNewChat={() => setNewChatOpen(true)}
                  onGroupChat={() => setNewGroupOpen(true)}
                  darkMode={darkMode}
                />
              )}
            </div>
          </div>

          <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} onCreated={(id) => { setActiveConv(id); setNewChatOpen(false); }} />
          <NewChatDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} onCreated={(id) => { setActiveConv(id); setNewGroupOpen(false); }} isGroup />
        </div>
      )}
    </>
  );
}
