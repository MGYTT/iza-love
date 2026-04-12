import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPush } from "@/lib/push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ── Twoje romantyczne wiadomości ── */
const MESSAGES = [
  { title: "Dzień dobry, Izo ♥",      body: "Mam nadzieję że śnił Ci się piękny sen 🌙"       },
  { title: "Myślę o Tobie ♥",         body: "Właśnie usłyszałem naszą piosenkę..."             },
  { title: "Dobranoc, kochanie 🌙",    body: "Słodkich snów. Kocham Cię najbardziej na świecie" },
  { title: "Nasza Historia czeka ♥",  body: "Mam dla Ciebie niespodziankę na stronie 🎵"       },
  { title: "Już tęsknię ♥",           body: "Liczę godziny do kiedy znów Cię zobaczę"          },
  { title: "Uśmiechnij się! 🌸",       body: "Bo jesteś najpiękniejszą osobą na świecie"        },
];

export async function GET(req: NextRequest) {
  /* Zabezpieczenie przed nieautoryzowanym wywołaniem */
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription");

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  /* Wybierz losową wiadomość */
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  let sent = 0;
  const expired: string[] = [];

  for (const row of subs) {
    try {
      await sendPush(row.subscription, {
        ...msg,
        icon: "/icon-192.png",
        url:  "/",
        tag:  "love-daily",
      });
      sent++;
    } catch (err: unknown) {
      /* Subskrypcja wygasła — usuń */
      if ((err as { statusCode?: number }).statusCode === 410) {
        expired.push(row.subscription.endpoint);
      }
    }
  }

  /* Usuń wygasłe subskrypcje */
  if (expired.length) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expired);
  }

  return NextResponse.json({ sent, expired: expired.length });
}