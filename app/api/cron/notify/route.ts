import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPush } from "@/lib/push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAILY_MESSAGES = [
  { title: "Dzień dobry, Izo ♥",     body: "Mam nadzieję że śnił Ci się piękny sen 🌙"        },
  { title: "Myślę o Tobie ♥",        body: "Właśnie usłyszałem naszą piosenkę..."              },
  { title: "Dobranoc, kochanie 🌙",   body: "Słodkich snów. Kocham Cię najbardziej na świecie" },
  { title: "Uśmiechnij się! 🌸",      body: "Bo jesteś najpiękniejszą osobą na świecie"         },
  { title: "Już tęsknię ♥",          body: "Liczę godziny do kiedy znów Cię zobaczę"           },
  { title: "Nasza Historia czeka ♥", body: "Mam dla Ciebie niespodziankę na stronie 🎵"        },
];

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription");

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  /* ── 1. Wyślij zaplanowane powiadomienia które już minęły ── */
  const now = new Date().toISOString();
  const { data: scheduled } = await supabase
    .from("scheduled_notifications")
    .select("*")
    .eq("sent", false)
    .lte("scheduled_for", now);

  let sentScheduled = 0;
  for (const notif of scheduled ?? []) {
    for (const row of subs) {
      try {
        await sendPush(row.subscription, {
          title: notif.title,
          body:  notif.body,
          url:   notif.url,
          icon:  notif.icon,
          tag:   "scheduled",
        });
        sentScheduled++;
      } catch {}
    }
    /* Oznacz jako wysłane */
    await supabase
      .from("scheduled_notifications")
      .update({ sent: true })
      .eq("id", notif.id);
  }

  /* ── 2. Codzienna losowa wiadomość (tylko rano o 8:00) ── */
  const hour = new Date().getUTCHours(); // 8 UTC = 10 CEST
  let sentDaily = 0;

  if (hour === 6) { // 6 UTC = 8:00 CEST
    const msg = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
    const expired: string[] = [];

    for (const row of subs) {
      try {
        await sendPush(row.subscription, { ...msg, tag: "daily" });
        sentDaily++;
      } catch (err: unknown) {
        if ((err as { statusCode?: number }).statusCode === 410) {
          expired.push(row.subscription.endpoint);
        }
      }
    }

    if (expired.length) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expired);
    }
  }

  return NextResponse.json({
    ok: true,
    sentScheduled,
    sentDaily,
  });
}