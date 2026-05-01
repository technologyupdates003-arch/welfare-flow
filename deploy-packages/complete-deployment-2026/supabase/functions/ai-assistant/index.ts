import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { messages, context_type } = await req.json();

    // Gather welfare context for intelligent responses
    let systemContext = "";

    if (context_type === "secretary_assistant") {
      // Secretary-specific context for writing meeting minutes
      const { data: members } = await supabase.from("members").select("name, phone").eq("is_active", true);
      const { data: recentMinutes } = await supabase
        .from("meeting_minutes")
        .select("title, meeting_type, meeting_date")
        .order("meeting_date", { ascending: false })
        .limit(5);

      const memberList = members?.map((m: any) => `${m.name} (${m.phone})`).join(", ") || "No members";

      systemContext = `You are an expert AI assistant specialized in helping secretaries write professional meeting minutes for a welfare group.

WELFARE GROUP: KIRINYAGA Healthcare Workers' Welfare (KHCWW)

YOUR EXPERTISE:
- Writing clear, professional meeting minutes
- Organizing discussions into structured sections
- Formatting decisions and action items
- Summarizing key points from meeting notes
- Improving clarity and professionalism of minutes

ACTIVE MEMBERS (use these actual names when suggesting attendees):
${memberList}

RECENT MEETINGS:
${recentMinutes?.map((m: any) => `- ${m.title} (${m.meeting_type}) - ${new Date(m.meeting_date).toLocaleDateString()}`).join("\n") || "No recent meetings"}

MEETING MINUTE STRUCTURE:
1. **Meeting Title** - Clear, descriptive title
2. **Meeting Date & Type** - When and what kind of meeting
3. **Attendees** - List of members present (use actual member names from the list above)
4. **Agenda** - Topics to be discussed
5. **Discussions** - Summary of what was discussed for each agenda item
6. **Decisions Made** - Clear list of decisions with context
7. **Action Items** - Specific tasks with responsible persons and deadlines
8. **Next Meeting** - Date and tentative agenda
9. **Signatures** - Chairperson and Secretary names and signatures

GUIDELINES:
- Use professional, clear language
- Be concise but comprehensive
- Use bullet points for lists
- Include specific names for action items
- Use past tense for discussions and decisions
- Be objective and factual
- When suggesting attendees, use actual member names from the list above

When a user provides meeting notes or asks for help:
1. Ask clarifying questions if needed
2. Structure the content into proper sections
3. Improve clarity and professionalism
4. Suggest action items if not explicitly stated
5. Format for easy copy-paste into the minutes form
6. Use actual member names when suggesting attendees

Be helpful, professional, and focus on creating high-quality meeting minutes.`;
    } else if (context_type === "admin_assistant") {
      // Get member stats
      const { data: members } = await supabase.from("members").select("id, name, phone, is_active, total_contributions, total_penalties");
      const { data: settings } = await supabase.from("welfare_settings").select("*").limit(1).maybeSingle();
      const { data: events } = await supabase.from("events").select("*").eq("status", "active");
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const { data: contributions } = await supabase
        .from("contributions")
        .select("member_id, status, amount")
        .eq("month", currentMonth)
        .eq("year", currentYear);

      const totalMembers = members?.length || 0;
      const activeMembers = members?.filter((m: any) => m.is_active).length || 0;
      const paidThisMonth = contributions?.filter((c: any) => c.status === "paid").length || 0;
      const pendingThisMonth = contributions?.filter((c: any) => c.status === "pending").length || 0;

      const unpaidMembers = members?.filter((m: any) => {
        const paid = contributions?.find((c: any) => c.member_id === m.id && c.status === "paid");
        return !paid && m.is_active;
      });

      systemContext = `You are an intelligent AI assistant for a welfare group management system. You have full knowledge of the system data.

WELFARE GROUP INFO:
- Name: ${settings?.name || "Welfare Group"}
- Monthly contribution: KES ${settings?.monthly_contribution_amount || 500}
- Due day: ${settings?.contribution_due_day || 5} of each month
- Penalty: KES ${settings?.penalty_amount || 100} after ${settings?.penalty_grace_days || 7} grace days

CURRENT STATS (${new Date().toLocaleDateString()}):
- Total members: ${totalMembers}
- Active members: ${activeMembers}
- Paid this month: ${paidThisMonth}
- Pending this month: ${pendingThisMonth}
- Active events: ${events?.length || 0}

${unpaidMembers && unpaidMembers.length > 0 ? `MEMBERS WHO HAVEN'T PAID THIS MONTH:\n${unpaidMembers.slice(0, 20).map((m: any) => `- ${m.name} (${m.phone})`).join("\n")}${unpaidMembers.length > 20 ? `\n... and ${unpaidMembers.length - 20} more` : ""}` : "All active members have paid this month!"}

ALL MEMBERS (name, phone, contributions, penalties, active):
${members?.slice(0, 50).map((m: any) => `- ${m.name}, ${m.phone}, KES ${m.total_contributions}, penalties: KES ${m.total_penalties}, ${m.is_active ? "active" : "inactive"}`).join("\n") || "No members"}

ACTIVE EVENTS:
${events?.map((e: any) => `- ${e.title} (${e.event_type}): KES ${e.contribution_amount} - ${e.description || "No description"}`).join("\n") || "No active events"}

You can help the admin with:
1. Writing announcements and event descriptions
2. Answering questions about members, contributions, payments
3. Generating reports and summaries
4. Drafting SMS messages
5. Any welfare management related questions

Be helpful, concise, and use the actual data above. Format responses nicely with markdown.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContext || "You are a helpful assistant." },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
