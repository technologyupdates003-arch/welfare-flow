import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

type Msg = { role: "user" | "assistant"; content: string };

const GREETING = "👋 Welcome back! I'm your AI assistant. I can help you with:\n\n- **Writing announcements** and event descriptions\n- **Checking contributions** — who paid, who didn't\n- **Member information** and stats\n- **Drafting SMS** messages\n- Any questions about your welfare group\n\nWhat would you like help with?";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show greeting popup on first load
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, context_type: "admin_assistant" }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Failed" }));
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${err.error || "Something went wrong"}` }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > newMessages.length) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Failed to connect to AI. Please try again." }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Greeting tooltip */}
      {showGreeting && !open && (
        <div className="fixed bottom-24 right-20 z-50 bg-card border border-border rounded-xl shadow-lg p-3 max-w-[240px] animate-fade-in md:bottom-20">
          <p className="text-sm">👋 Need help? I can assist with announcements, member data, and more!</p>
          <button onClick={() => setShowGreeting(false)} className="absolute -top-2 -right-2 bg-muted rounded-full p-0.5">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* AI Bubble */}
      <button
        onClick={() => { setOpen(!open); setShowGreeting(false); }}
        className="fixed bottom-20 right-20 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 md:bottom-6 md:right-20"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {/* AI Panel */}
      {open && (
        <div className="fixed bottom-36 right-20 z-50 w-[380px] h-[520px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-scale-in md:bottom-24">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-3 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-semibold text-sm flex-1">AI Assistant</h3>
            <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-1 [&_ul]:mb-1 [&_li]:mb-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-border flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-full bg-muted border-0 text-sm"
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button size="icon" className="rounded-full h-8 w-8" onClick={send} disabled={isLoading}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
