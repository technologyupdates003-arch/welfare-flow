import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatWindow from "./ChatWindow";
import { usePresence } from "@/hooks/usePresence";

export default function FloatingChatBubble() {
  usePresence();
  const [open, setOpen] = useState(false);

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

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-36 right-4 z-50 w-[360px] h-[500px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-scale-in md:bottom-24">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Group Chat</h3>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <ChatWindow conversationId="group" />
        </div>
      )}
    </>
  );
}
