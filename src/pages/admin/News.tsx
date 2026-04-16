import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminNews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: news } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createNews = useMutation({
    mutationFn: async () => {
      const { data: newsItem, error } = await supabase.from("news").insert({ title, content, author_id: user!.id }).select("id").single();
      if (error) throw error;

      // Notify all active members
      const { data: allMembers } = await supabase.from("members").select("user_id").eq("is_active", true).not("user_id", "is", null);
      if (allMembers && allMembers.length > 0) {
        const notifications = allMembers
          .filter((m: any) => m.user_id !== user!.id)
          .map((m: any) => ({
            user_id: m.user_id,
            title: `📢 ${title}`,
            message: content.length > 100 ? content.substring(0, 100) + "..." : content,
            type: "news",
          }));
        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      setOpen(false);
      setTitle("");
      setContent("");
      toast.success("Announcement posted & members notified");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea placeholder="Content" rows={4} value={content} onChange={e => setContent(e.target.value)} />
              <Button onClick={() => createNews.mutate()} disabled={!title || !content || createNews.isPending} className="w-full">
                {createNews.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {news?.map(n => (
          <Card key={n.id}>
            <CardHeader><CardTitle className="text-base">{n.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
