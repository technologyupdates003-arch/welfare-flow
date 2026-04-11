import { useState } from "react";
import { Reply, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const REACTION_EMOJIS = ["👍","❤️","😂","😮","😢","🙏"];

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface MessageBubbleProps {
  content: string;
  senderName: string;
  isOwn: boolean;
  time: string;
  reactions: Reaction[];
  replyTo?: { senderName: string; content: string } | null;
  onReply: () => void;
  onReact: (emoji: string) => void;
  isOnline?: boolean;
}

export default function MessageBubble({ content, senderName, isOwn, time, reactions, replyTo, onReply, onReact, isOnline }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className={cn("group flex flex-col max-w-[80%] mb-1", isOwn ? "self-end items-end" : "self-start items-start")}>
      <div className="flex items-center gap-1.5 mb-0.5 px-1">
        <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-muted-foreground/30")} />
        <span className="text-[11px] font-medium text-muted-foreground">{senderName}</span>
      </div>

      {replyTo && (
        <div className={cn(
          "text-[11px] px-2.5 py-1 rounded-t-lg border-l-2 mb-[-4px] z-0",
          isOwn ? "bg-primary/10 border-primary/40 text-primary-foreground/70" : "bg-muted/60 border-muted-foreground/30 text-muted-foreground"
        )}>
          <span className="font-semibold">{replyTo.senderName}</span>
          <p className="truncate max-w-[200px]">{replyTo.content}</p>
        </div>
      )}

      <div className="relative">
        <div className={cn(
          "px-3 py-2 rounded-2xl text-sm shadow-sm relative",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        )}>
          {content}
          <span className={cn("text-[10px] ml-2 inline-block opacity-60", isOwn ? "text-primary-foreground" : "text-muted-foreground")}>
            {time}
          </span>
        </div>

        {/* Action buttons on hover */}
        <div className={cn(
          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-card border border-border rounded-full shadow-sm px-1 py-0.5",
          isOwn ? "-left-20" : "-right-20"
        )}>
          <button onClick={onReply} className="p-1 hover:bg-accent rounded-full" title="Reply">
            <Reply className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => setShowReactions(!showReactions)} className="p-1 hover:bg-accent rounded-full" title="React">
            <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {showReactions && (
          <div className={cn("absolute -top-8 z-50 flex gap-0.5 bg-card border border-border rounded-full shadow-lg px-1 py-0.5", isOwn ? "right-0" : "left-0")}>
            {REACTION_EMOJIS.map((e) => (
              <button key={e} className="text-base hover:scale-125 transition-transform p-0.5" onClick={() => { onReact(e); setShowReactions(false); }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {reactions.length > 0 && (
        <div className="flex gap-1 mt-0.5 px-1">
          {reactions.map((r) => (
            <button key={r.emoji} onClick={() => onReact(r.emoji)} className={cn(
              "text-xs px-1.5 py-0.5 rounded-full border transition-colors",
              r.reacted ? "bg-primary/10 border-primary/30" : "bg-muted border-border"
            )}>
              {r.emoji} {r.count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
