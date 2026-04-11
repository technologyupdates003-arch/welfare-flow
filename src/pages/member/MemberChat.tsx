import { useState } from "react";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatDialog from "@/components/chat/NewChatDialog";
import { usePresence } from "@/hooks/usePresence";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, User } from "lucide-react";

export default function MemberChat() {
  usePresence();
  const [activeConv, setActiveConv] = useState<string | null>("group");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [showList, setShowList] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      {/* Mobile: toggle between list and chat */}
      <div className="md:hidden">
        {showList ? (
          <div className="h-full">
            <ConversationList
              activeId={activeConv}
              onSelect={(id) => { setActiveConv(id); setShowList(false); }}
              onNewChat={() => setNewChatOpen(true)}
              onGroupChat={() => setNewGroupOpen(true)}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowList(true)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-sm">
                {activeConv === "group" ? "General Group" : "Chat"}
              </h3>
            </div>
            <ChatWindow conversationId={activeConv} />
          </div>
        )}
      </div>

      {/* Desktop: side by side */}
      <div className="hidden md:flex h-full rounded-xl border border-border overflow-hidden bg-background">
        <div className="w-72 border-r border-border flex-shrink-0 flex flex-col">
          <ConversationList
            activeId={activeConv}
            onSelect={setActiveConv}
            onNewChat={() => setNewChatOpen(true)}
            onGroupChat={() => setNewGroupOpen(true)}
          />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-border px-4 py-3 bg-card">
            <h3 className="font-semibold text-sm">
              {activeConv === "group" ? "General Group Chat" : "Private Chat"}
            </h3>
          </div>
          <ChatWindow conversationId={activeConv} />
        </div>
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} onCreated={(id) => { setActiveConv(id); setShowList(false); }} />
      <NewChatDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} onCreated={(id) => { setActiveConv(id); setShowList(false); }} isGroup />
    </div>
  );
}
