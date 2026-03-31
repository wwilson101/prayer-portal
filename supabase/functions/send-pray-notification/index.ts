import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ONESIGNAL_APP_ID = "88c00dad-fbdc-4b65-9f12-6108c045c57e";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prayerId, prayerOwnerId, prayerOwnerName, prayerTitle, prayerByName, ownerPlayerId } =
      await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("prayer_notifications_sent")
      .select("id")
      .eq("prayer_id", prayerId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ skipped: true, reason: "already_notified" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await supabase
      .from("prayer_notifications_sent")
      .insert({ prayer_id: prayerId, user_id: user.id });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let resolvedPlayerId = ownerPlayerId;
    if (!resolvedPlayerId && prayerOwnerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onesignal_player_id")
        .eq("id", prayerOwnerId)
        .maybeSingle();
      resolvedPlayerId = profile?.onesignal_player_id || null;
    }

    if (!resolvedPlayerId || !oneSignalApiKey) {
      return new Response(JSON.stringify({ sent: false, reason: resolvedPlayerId ? "onesignal_not_configured" : "no_player_id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderName = prayerByName || "Someone";
    const notifBody = `${senderName} is praying for you!`;

    const osRes = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${oneSignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_subscription_ids: [resolvedPlayerId],
        headings: { en: "Prayer Portal" },
        contents: { en: notifBody },
        subtitle: { en: `"${prayerTitle}"` },
        data: { prayerId, type: "pray" },
      }),
    });

    if (!osRes.ok) {
      const errText = await osRes.text();
      console.error("OneSignal error:", errText);
      return new Response(JSON.stringify({ sent: false, reason: "onesignal_error" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
