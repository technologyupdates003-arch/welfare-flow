import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, password, name } = await req.json();

    if (!phone || !password || !name) {
      return new Response(JSON.stringify({ error: "Missing phone, password, or name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if any admin exists
    const { data: existingAdmins } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(JSON.stringify({ error: "Admin already exists" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedPhone = phone.startsWith("+254") ? phone : `+254${phone.replace(/^0/, "")}`;
    const email = `${normalizedPhone.replace("+", "")}@welfare.local`;

    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authErr) throw authErr;

    // Create member record
    await supabase.from("members").insert({
      name,
      phone: normalizedPhone,
      user_id: authData.user.id,
    });

    // Assign admin role
    await supabase.from("user_roles").insert({
      user_id: authData.user.id,
      role: "admin",
    });

    return new Response(JSON.stringify({
      status: "success",
      message: "Admin account created. Login with your phone number and password.",
      phone: normalizedPhone,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Setup admin error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
