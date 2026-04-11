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
    const { phones, message } = await req.json();

    if (!phones?.length || !message) {
      return new Response(JSON.stringify({ error: "Missing phones or message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for Twilio config
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !TWILIO_FROM) {
      // Log SMS without sending (no Twilio configured)
      const logs = phones.map((phone: string) => ({
        recipient_phone: phone,
        message,
        status: "queued_no_provider",
      }));
      await supabase.from("sms_logs").insert(logs);

      return new Response(JSON.stringify({
        status: "queued",
        note: "SMS logged but not sent - Twilio not configured",
        count: phones.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Twilio gateway
    const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
    const results = [];

    for (const phone of phones) {
      try {
        const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TWILIO_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phone,
            From: TWILIO_FROM,
            Body: message,
          }),
        });

        const data = await response.json();

        await supabase.from("sms_logs").insert({
          recipient_phone: phone,
          message,
          status: response.ok ? "sent" : "failed",
          provider_ref: data.sid || null,
        });

        results.push({ phone, status: response.ok ? "sent" : "failed" });
      } catch (err) {
        await supabase.from("sms_logs").insert({
          recipient_phone: phone,
          message,
          status: "error",
        });
        results.push({ phone, status: "error" });
      }
    }

    return new Response(JSON.stringify({ status: "completed", results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Bulk SMS error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
