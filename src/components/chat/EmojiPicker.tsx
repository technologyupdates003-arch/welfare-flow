import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_EMOJIS = ["😀","😂","❤️","👍","🙏","🔥","😢","😮","🎉","👋","💯","🤔","😊","🥰","😎","🤣","😇","🙌","💪","✅"];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(!open)}>
        <Smile className="h-5 w-5 text-muted-foreground" />
      </Button>
      {open && (
        <div className="absolute bottom-10 left-0 z-50 bg-card border border-border rounded-xl shadow-lg p-2 grid grid-cols-5 gap-1 w-[220px]">
          {QUICK_EMOJIS.map((e) => (
            <button key={e} className="text-xl hover:bg-accent rounded p-1 transition-colors" onClick={() => { onSelect(e); setOpen(false); }}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
