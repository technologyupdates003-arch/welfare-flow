import { useState } from "react";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatDialog from "@/components/chat/NewChatDialog";
import { usePresence } from "@/hooks/usePresence";

export default function Chat() {
  usePresence();
  const [activeConv, setActiveConv] = useState<string | null>("group");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

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
            {activeConv === "group" ? "General Group Chat" : "Private Chat"}
          </h3>
        </div>
        <ChatWindow conversationId={activeConv} />
      </div>

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} onCreated={setActiveConv} />
      <NewChatDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} onCreated={setActiveConv} isGroup />
    </div>
  );
}
