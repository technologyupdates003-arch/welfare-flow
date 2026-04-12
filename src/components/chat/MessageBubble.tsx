import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reply } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  senderName: string;
  isOwn: boolean;
  time: string;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  replyTo: { senderName: string; content: string } | null;
  onReply: () => void;
  onReact: (emoji: string) => void;
  isOnline: boolean;
  darkMode?: boolean;
}

const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function MessageBubble({
  content, senderName, isOwn, time, reactions, replyTo, onReply, onReact, isOnline, darkMode = false,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn("flex flex-col mb-1", isOwn ? "items-end" : "items-start")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={() => setShowActions(true)}
    >
      <div className={cn(
        "max-w-[85%] rounded-lg px-3 py-1.5 relative group text-sm shadow-sm",
        isOwn
          ? darkMode ? "bg-[#005C4B] text-white rounded-tr-none" : "bg-[#DCF8C6] text-gray-900 rounded-tr-none"
          : darkMode ? "bg-[#1F2C34] text-gray-100 rounded-tl-none" : "bg-white text-gray-900 rounded-tl-none"
      )}>
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn("text-xs font-semibold", darkMode ? "text-[#00A884]" : "text-primary")}>
              {senderName}
            </span>
            {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
          </div>
        )}

        {replyTo && (
          <div className={cn(
            "text-xs rounded px-2 py-1 mb-1 border-l-2",
            darkMode
              ? "bg-[#0B141A]/50 border-[#00A884] text-gray-300"
              : "bg-black/5 border-primary/50"
          )}>
            <span className="font-semibold">{replyTo.senderName}</span>
            <p className="truncate opacity-70">{replyTo.content}</p>
          </div>
        )}

        <p className="whitespace-pre-wrap break-words">{content}</p>
        <span className={cn(
          "text-[10px] float-right mt-1 ml-3",
          darkMode ? "text-gray-400" : "text-gray-500"
        )}>{time}</span>

        {showActions && (
          <div className={cn(
            "absolute -top-8 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 shadow-md z-10",
            isOwn ? "right-0" : "left-0",
            darkMode ? "bg-[#2A3942]" : "bg-white border border-gray-200"
          )}>
            <button onClick={onReply} className="p-1 hover:bg-muted/30 rounded-full">
              <Reply className="h-3.5 w-3.5" />
            </button>
            {quickEmojis.slice(0, 4).map((e) => (
              <button key={e} onClick={() => onReact(e)} className="p-0.5 hover:scale-125 transition-transform text-sm">
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {reactions.length > 0 && (
        <div className="flex gap-1 mt-0.5 px-2">
          {reactions.map(({ emoji, count, reacted }) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className={cn(
                "flex items-center gap-0.5 text-xs rounded-full px-1.5 py-0.5 transition-colors",
                reacted
                  ? darkMode ? "bg-[#005C4B] text-white" : "bg-primary/20 text-primary"
                  : darkMode ? "bg-[#2A3942] text-gray-300" : "bg-muted"
              )}
            >
              {emoji} {count > 1 && count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
