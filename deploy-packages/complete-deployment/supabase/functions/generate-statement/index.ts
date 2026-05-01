import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get member data
    const { data: member } = await supabase
      .from("members")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get contributions
    const { data: contributions } = await supabase
      .from("contributions")
      .select("*")
      .eq("member_id", member.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    // Get penalties
    const { data: penalties } = await supabase
      .from("penalties")
      .select("*")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false });

    // Generate HTML statement
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Member Statement - ${member.name}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
            .member-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #16a34a; color: white; }
            .total { font-weight: bold; background-color: #f0f9ff; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>KIRINYAGA HCWW</h1>
            <h2>Member Statement</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="member-info">
            <h3>Member Information</h3>
            <p><strong>Name:</strong> ${member.name}</p>
            <p><strong>Phone:</strong> ${member.phone}</p>
            <p><strong>Member ID:</strong> ${member.member_id || 'Not assigned'}</p>
            <p><strong>Total Contributions:</strong> KES ${Number(member.total_contributions).toLocaleString()}</p>
            <p><strong>Total Penalties:</strong> KES ${Number(member.total_penalties).toLocaleString()}</p>
        </div>

        <div class="section">
            <h3>Contribution History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Month/Year</th>
                        <th>Amount (KES)</th>
                        <th>Due Date</th>
                        <th>Paid Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${contributions?.map(c => `
                        <tr>
                            <td>${c.month}/${c.year}</td>
                            <td>${Number(c.amount).toLocaleString()}</td>
                            <td>${c.due_date}</td>
                            <td>${c.paid_date || 'Not paid'}</td>
                            <td>${c.status}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="5">No contributions found</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h3>Penalty History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Reason</th>
                        <th>Amount (KES)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${penalties?.map(p => `
                        <tr>
                            <td>${new Date(p.created_at).toLocaleDateString()}</td>
                            <td>${p.reason}</td>
                            <td>${Number(p.amount).toLocaleString()}</td>
                            <td>${p.is_paid ? 'Paid' : 'Unpaid'}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="4">No penalties found</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>This statement was generated automatically by KIRINYAGA HCWW Management System</p>
            <p>For any queries, please contact the administration</p>
        </div>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="statement-${member.name.replace(/\s+/g, '-')}.html"`,
      },
    });

  } catch (error: any) {
    console.error("Generate statement error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});