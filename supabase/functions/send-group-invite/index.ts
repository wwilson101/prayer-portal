import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { recipientEmail, groupName, groupCode, groupDescription, inviterName } = await req.json();

    if (!recipientEmail || !groupName || !groupCode) {
      return new Response(JSON.stringify({ error: "recipientEmail, groupName, and groupCode are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appUrl = Deno.env.get("APP_URL") || "https://prayer-portal.bolt.host";

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Prayer Portal <noreply@teamwilsonllc.com>",
        to: [recipientEmail],
        subject: `You're invited to join "${groupName}" on Prayer Portal`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#1a3d28,#2d5a3d);border-radius:20px;padding:16px 28px;">
        <span style="color:#f0ede0;font-size:20px;font-weight:700;letter-spacing:1px;">PRAYER PORTAL</span>
      </div>
    </div>

    <div style="background:#161610;border:1px solid #2a2520;border-radius:20px;padding:32px;margin-bottom:24px;">
      <p style="color:#c8b99a;font-size:15px;line-height:1.6;margin:0 0 20px;">
        ${inviterName ? `<strong style="color:#f0ede0;">${inviterName}</strong> has invited you to join a prayer group.` : "You've been invited to join a prayer group."}
      </p>

      <div style="background:#111111;border:1px solid #2a2520;border-radius:14px;padding:20px;margin-bottom:24px;">
        <p style="color:#a89060;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Group</p>
        <p style="color:#f0ede0;font-size:20px;font-weight:700;margin:0 0 8px;">${groupName}</p>
        ${groupDescription ? `<p style="color:#c8b99a;font-size:14px;line-height:1.5;margin:0;">${groupDescription}</p>` : ""}
      </div>

      <div style="background:#0d1f15;border:1px solid #1a3d28;border-radius:14px;padding:20px;text-align:center;margin-bottom:28px;">
        <p style="color:#a89060;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Your Invite Code</p>
        <p style="color:#6fcf97;font-size:36px;font-weight:700;letter-spacing:0.4em;margin:0;font-family:monospace;">${groupCode}</p>
      </div>

      <p style="color:#c8b99a;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">How to join:</p>
      <ol style="color:#c8b99a;font-size:14px;line-height:1.8;margin:0 0 28px;padding-left:20px;">
        <li>Open Prayer Portal using the button below</li>
        <li>Create your free account or sign in</li>
        <li>Tap <strong style="color:#f0ede0;">Groups</strong> in the bottom menu</li>
        <li>Tap <strong style="color:#f0ede0;">Join Group</strong> and enter the code above</li>
      </ol>

      <a href="${appUrl}" style="display:block;background:linear-gradient(135deg,#1a3d28,#2d5a3d);color:#f0ede0;text-decoration:none;border-radius:14px;padding:16px;text-align:center;font-weight:700;font-size:16px;letter-spacing:0.5px;">
        Open Prayer Portal
      </a>
    </div>

    <p style="color:#444;font-size:12px;text-align:center;margin:0;">
      Prayer Portal &mdash; A private space to share and lift each other up.
    </p>

  </div>
</body>
</html>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-group-invite error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
