import { useState } from "react";
import { MessageCircle, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";
import NewChatDialog from "./NewChatDialog";
import { usePresence } from "@/hooks/usePresence";
import chatLogo from "@/assets/chat-logo-watermark.png";

export default function FloatingChatBubble() {
  usePresence();
  const [open, setOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const showChat = activeConv !== null;

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110 md:bottom-6",
          open && "rotate-90"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel - full screen on mobile */}
      {open && (
        <div
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden animate-scale-in",
            // Mobile: full screen, Desktop: floating panel
            "inset-0 md:inset-auto md:bottom-24 md:right-4 md:w-[380px] md:h-[560px] md:rounded-2xl md:border md:border-border md:shadow-2xl",
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
                  ? "Group Chat"
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
