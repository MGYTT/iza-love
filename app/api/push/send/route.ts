import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPush } from "@/lib/push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, url, icon, scheduledFor } = await req.json();

  if (!title || !body) {
    return NextResponse.json({ error: "Brak title lub body" }, { status: 400 });
  }

  /* Jeśli scheduledFor — zapisz do Supabase zamiast wysyłać od razu */
  if (scheduledFor) {
    await supabase.from("scheduled_notifications").insert({
      title, body, url: url ?? "/", icon: icon ?? "/icon-192.png",
      scheduled_for: scheduledFor,
      sent: false,
    });
    return NextResponse.json({ ok: true, scheduled: true });
  }

  /* Wyślij od razu */
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription");

  let sent = 0;
  for (const row of subs ?? []) {
    try {
      await sendPush(row.subscription, {
        title, body,
        url:  url   ?? "/",
        icon: icon  ?? "/icon-192.jpg",
        tag:  "custom",
      });
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent });
}