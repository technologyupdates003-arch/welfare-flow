import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Trusted bank senders
const TRUSTED_SENDERS = ["KCB", "EQUITY", "COOPBANK", "KCBBANK", "EQUITYBANK", "CO-OPBANK", "MPESA", "M-PESA"];

// Rate limiting: max 60 requests per minute per sender
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(sender: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sender);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sender, { count: 1, resetAt: now + 60000 });
    return false;
  }
  entry.count++;
  return entry.count > 60;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sender, timestamp } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate sender
    const senderUpper = (sender || "").toUpperCase().trim();
    const isTrusted = TRUSTED_SENDERS.some(s => senderUpper.includes(s));
    if (!isTrusted && sender) {
      return new Response(JSON.stringify({ error: "Untrusted sender", sender }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting
    if (isRateLimited(senderUpper)) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse SMS for amount and phone
    const amountMatch = message.match(/KES\s*([\d,]+\.?\d*)/i) ||
                        message.match(/Ksh\s*([\d,]+\.?\d*)/i) ||
                        message.match(/([\d,]+\.?\d*)\s*has been/i);
    const phoneMatch = message.match(/\+?254\d{9}/) ||
                       message.match(/0\d{9}/);
    const refMatch = message.match(/[A-Z0-9]{10,}/);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;
    const phone = phoneMatch ? phoneMatch[0].replace(/^0/, "+254") : null;
    const transactionRef = refMatch ? refMatch[0] : null;

    // Log the SMS
    await supabase.from("sms_logs").insert({
      recipient_phone: sender || "unknown",
      message: `RECEIVED: ${message}`,
      status: "received",
    });

    if (!amount) {
      return new Response(JSON.stringify({ status: "ignored", reason: "No amount found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Duplicate detection: check if same transaction_ref already processed
    if (transactionRef) {
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("transaction_ref", transactionRef)
        .maybeSingle();
      if (existingPayment) {
        return new Response(JSON.stringify({ status: "duplicate", transaction_ref: transactionRef }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Create payment record
    const { data: payment, error: paymentErr } = await supabase.from("payments").insert({
      amount,
      transaction_ref: transactionRef,
      raw_message: message,
      source: "bank_sms",
      received_at: timestamp || new Date().toISOString(),
    }).select("id").single();

    if (paymentErr) throw paymentErr;

    // Try to match by phone
    let matched = false;
    if (phone) {
      const normalizedPhone = phone.startsWith("+254") ? phone : `+254${phone.replace(/^0/, "")}`;
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (member) {
        // Update payment with member
        await supabase.from("payments").update({
          member_id: member.id,
          matched: true,
        }).eq("id", payment.id);

        // Find oldest pending/overdue contribution
        const { data: contribution } = await supabase
          .from("contributions")
          .select("id")
          .eq("member_id", member.id)
          .in("status", ["pending", "overdue"])
          .order("due_date")
          .limit(1)
          .maybeSingle();

        if (contribution) {
          await supabase.from("contributions").update({
            status: "paid",
            paid_date: new Date().toISOString().split("T")[0],
            payment_id: payment.id,
          }).eq("id", contribution.id);

          // Remove penalty for this contribution
          await supabase.from("penalties").delete().eq("contribution_id", contribution.id);

          // Update member totals
          const { data: paidContribs } = await supabase
            .from("contributions")
            .select("amount")
            .eq("member_id", member.id)
            .eq("status", "paid");
          const total = (paidContribs || []).reduce((s: number, c: any) => s + Number(c.amount), 0);
          await supabase.from("members").update({ total_contributions: total }).eq("id", member.id);

          const { data: penaltyData } = await supabase
            .from("penalties")
            .select("amount")
            .eq("member_id", member.id)
            .eq("is_paid", false);
          const penaltyTotal = (penaltyData || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
          await supabase.from("members").update({ total_penalties: penaltyTotal }).eq("id", member.id);

          // Create notification
          const { data: memberData } = await supabase
            .from("members")
            .select("user_id")
            .eq("id", member.id)
            .single();
          if (memberData?.user_id) {
            await supabase.from("notifications").insert({
              user_id: memberData.user_id,
              title: "Payment Received",
              message: `Your payment of KES ${amount.toLocaleString()} has been received and matched.`,
              type: "success",
            });
          }
        }

        matched = true;
      }
    }

    if (!matched) {
      await supabase.from("unmatched_payments").insert({
        payment_id: payment.id,
        raw_message: message,
        extracted_phone: phone,
        extracted_amount: amount,
      });
    }

    return new Response(JSON.stringify({
      status: matched ? "matched" : "unmatched",
      payment_id: payment.id,
      amount,
      phone,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("SMS webhook error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
