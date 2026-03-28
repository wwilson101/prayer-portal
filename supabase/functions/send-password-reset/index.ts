import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  console.log("send-password-reset function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const rawText = await req.text();
    console.log("Raw request body:", rawText);
    let body: any = {};
    try { body = JSON.parse(rawText); } catch { body = {}; }
    const emailFromBody = body?.email || body?.Email || body?.EMAIL;
    const userId = body?.userId || body?.user_id;
    console.log("Received email:", emailFromBody, "userId:", userId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabaseAdmin = createClient(
      supabaseUrl!,
      serviceRoleKey!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let targetUser: any = null;

    if (userId) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userError) {
        console.error("Get user by ID error:", userError);
      } else {
        targetUser = userData.user;
      }
    } else if (emailFromBody) {
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        console.error("List users error:", listError);
      } else {
        targetUser = users.users.find(u => u.email?.toLowerCase() === emailFromBody.toLowerCase());
      }
    } else {
      console.error("No email or userId in body:", rawText);
      return new Response(JSON.stringify({ error: "Email or userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = emailFromBody;

    if (!targetUser) {
      console.log("No user found with email:", email);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appUrl = Deno.env.get("APP_URL") || "https://prayer-portal.bolt.host";

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: targetUser.email!,
      options: { redirectTo: `${appUrl}/update-password` },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Generate link error:", JSON.stringify(linkError));
      console.error("Link data:", JSON.stringify(linkData));
      return new Response(JSON.stringify({ error: "Failed to generate reset link", details: linkError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resetLink = linkData.properties.action_link;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Prayer Portal <noreply@teamwilsonllc.com>",
        to: [targetUser.email],
        subject: "Reset your Prayer Portal password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1a1a1a;">Reset Your Password</h2>
            <p style="color: #444; line-height: 1.6;">
              You requested to reset your password for your Prayer Portal account.
              Click the button below to set a new password.
            </p>
            <a href="${resetLink}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: #888; font-size: 13px;">
              This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });

    const resendResult = await emailRes.text();
    console.log("Resend response status:", emailRes.status);
    console.log("Resend response:", resendResult);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-password-reset error:", err);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
