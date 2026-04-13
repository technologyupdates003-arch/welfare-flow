import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("+254") && cleaned.length === 13) return cleaned;
  if (cleaned.startsWith("254") && cleaned.length === 12) return "+" + cleaned;
  if (cleaned.startsWith("07") && cleaned.length === 10) return "+254" + cleaned.slice(1);
  if (cleaned.startsWith("7") && cleaned.length === 9) return "+254" + cleaned;
  if (cleaned.startsWith("01") && cleaned.length === 10) return "+254" + cleaned.slice(1);
  // Try to handle other formats
  if (/^\d{9}$/.test(cleaned)) return "+254" + cleaned;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "No rows provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      total: rows.length,
      success: 0,
      failed: 0,
      created_members: 0,
      existing_members: 0,
      failures: [] as { row: number; reason: string }[],
    };

    // Pre-fetch all members for dedup
    const { data: allMembers } = await supabase.from("members").select("id, phone");
    const memberMap = new Map((allMembers || []).map(m => [m.phone, m.id]));

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // Excel row (header = row 1)
      const row = rows[i];
      try {
        const name = String(row.name || "").trim();
        const phone = normalizePhone(String(row.phone || ""));
        const amount = Number(row.amount);
        const dateStr = String(row.date || "").trim();

        // Validate
        if (!name) { results.failures.push({ row: rowNum, reason: "Missing name" }); results.failed++; continue; }
        if (!phone) { results.failures.push({ row: rowNum, reason: `Invalid phone: "${row.phone}"` }); results.failed++; continue; }
        if (isNaN(amount) || amount <= 0) { results.failures.push({ row: rowNum, reason: `Invalid amount: "${row.amount}"` }); results.failed++; continue; }
        if (!dateStr) { results.failures.push({ row: rowNum, reason: "Missing date" }); results.failed++; continue; }

        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) { results.failures.push({ row: rowNum, reason: `Invalid date: "${dateStr}"` }); results.failed++; continue; }

        const month = parsedDate.getMonth() + 1;
        const year = parsedDate.getFullYear();
        const paidDate = parsedDate.toISOString().split("T")[0];

        let memberId = memberMap.get(phone);

        if (!memberId) {
          // Create auth user + member
          const email = `${phone.replace("+", "")}@welfare.local`;
          const password = Math.random().toString(36).slice(-8) + "A1!";

          const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
            email, password, email_confirm: true,
          });

          if (authErr) {
            // If user already exists in auth but not members, try to find
            if (authErr.message?.includes("already")) {
              results.failures.push({ row: rowNum, reason: `Auth user exists for ${phone} but member record missing` });
              results.failed++;
              continue;
            }
            throw new Error(authErr.message);
          }

          const { data: newMember, error: memberErr } = await supabase
            .from("members")
            .insert({ name, phone, user_id: authData.user.id })
            .select("id")
            .single();

          if (memberErr) throw new Error(memberErr.message);

          await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "member" });

          memberId = newMember.id;
          memberMap.set(phone, memberId);
          results.created_members++;
        } else {
          results.existing_members++;
        }

        // Insert contribution (upsert to avoid duplicates)
        const dueDate = `${year}-${String(month).padStart(2, "0")}-05`;
        const { error: contribErr } = await supabase.from("contributions").upsert(
          {
            member_id: memberId,
            amount,
            month,
            year,
            due_date: dueDate,
            status: "paid",
            paid_date: paidDate,
          },
          { onConflict: "member_id,month,year" }
        );

        if (contribErr) throw new Error(contribErr.message);

        // Update member totals
        const { data: totalData } = await supabase
          .from("contributions")
          .select("amount")
          .eq("member_id", memberId)
          .eq("status", "paid");
        const total = (totalData || []).reduce((s: number, c: any) => s + Number(c.amount), 0);
        await supabase.from("members").update({ total_contributions: total }).eq("id", memberId);

        results.success++;
      } catch (err: any) {
        results.failures.push({ row: rowNum, reason: err.message || "Unknown error" });
        results.failed++;
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
