import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
  isGroup?: boolean;
}

export default function NewChatDialog({ open, onOpenChange, onCreated, isGroup = false }: NewChatDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const { data: members } = useQuery({
    queryKey: ["all-members-chat"],
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("id, name, phone, user_id, profile_picture_url")
        .eq("is_active", true)
        .order("name");
      return (data || []).filter((m: any) => m.user_id && m.user_id !== user?.id);
    },
    enabled: open,
  });

  const filtered = members?.filter((m: any) =>
    search ? (m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)) : true
  );

  const createChat = useMutation({
    mutationFn: async () => {
      if (!isGroup && selected.length !== 1) throw new Error("Select one member");
      if (isGroup && selected.length < 1) throw new Error("Select at least one member");

      // For private: check if conversation already exists
      if (!isGroup) {
        const targetUserId = members?.find((m: any) => m.id === selected[0])?.user_id;
        const { data: existing } = await supabase
          .from("conversation_participants")
          .select("conversation_id, conversations!inner(type)")
          .eq("user_id", user!.id);

        if (existing) {
          for (const e of existing) {
            if ((e as any).conversations?.type === "private") {
              const { data: other } = await supabase
                .from("conversation_participants")
                .select("user_id")
                .eq("conversation_id", e.conversation_id)
                .eq("user_id", targetUserId!);
              if (other && other.length > 0) return e.conversation_id;
            }
          }
        }
      }

      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({ type: isGroup ? "group" : "private", name: isGroup ? groupName || "Group" : null, created_by: user!.id })
        .select("id")
        .single();
      if (error) throw error;

      // Add participants
      const userIds = selected.map((id) => members?.find((m: any) => m.id === id)?.user_id).filter(Boolean);
      userIds.push(user!.id);

      const { error: pError } = await supabase
        .from("conversation_participants")
        .insert(userIds.map((uid) => ({ conversation_id: conv.id, user_id: uid! })));
      if (pError) throw pError;

      return conv.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onCreated(id as string);
      onOpenChange(false);
      setSelected([]);
      setGroupName("");
      setSearch("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggle = (id: string) => {
    if (!isGroup) {
      setSelected([id]);
    } else {
      setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isGroup ? "New Group Chat" : "New Private Chat"}</DialogTitle>
        </DialogHeader>
        {isGroup && (
          <Input placeholder="Group name..." value={groupName} onChange={(e) => setGroupName(e.target.value)} className="mb-2" />
        )}
        <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <ScrollArea className="h-[300px] mt-2">
          {filtered?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{search ? `No members found matching "${search}"` : "No members available"}</p>
            </div>
          )}
          {filtered?.map((m: any) => (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 flex items-center gap-3 rounded-lg transition-colors",
                selected.includes(m.id) ? "bg-primary/10 text-primary" : "hover:bg-accent"
              )}
            >
              <div className="relative">
                {m.profile_picture_url ? (
                  <img src={m.profile_picture_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {m.name.charAt(0)}
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.phone}</p>
              </div>
              {selected.includes(m.id) && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </ScrollArea>
        <Button onClick={() => createChat.mutate()} disabled={selected.length === 0 || createChat.isPending} className="w-full">
          {createChat.isPending ? "Creating..." : "Start Chat"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
