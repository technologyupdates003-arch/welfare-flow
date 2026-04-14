import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phone, password, name } = await req.json();
    if (!phone || !password || !name) {
      return new Response(JSON.stringify({ error: "Missing phone, password, or name" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const normalizedPhone = phone.startsWith("+254") ? phone : `+254${phone.replace(/^0/, "")}`;
    const email = `${normalizedPhone.replace("+", "")}@welfare.local`;

    // Check if member already exists
    const { data: existing } = await supabase.from("members").select("id").eq("phone", normalizedPhone).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ error: "Member with this phone already exists" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authErr) throw authErr;

    // Create member record
    await supabase.from("members").insert({
      name, phone: normalizedPhone, user_id: authData.user.id,
    });

    // Assign member role
    await supabase.from("user_roles").insert({
      user_id: authData.user.id, role: "member",
    });

    return new Response(JSON.stringify({
      status: "success",
      message: "Member account created.",
      phone: normalizedPhone,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Create member error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
