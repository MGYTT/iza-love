import webpush from "web-push";

export type PushPayload = {
  title: string;
  body:  string;
  icon?: string;
  url?:  string;
  tag?:  string;
};

/* ── Inicjalizacja WEWNĄTRZ funkcji — nie na poziomie modułu ── */
function getWebPush() {
  const subject    = process.env.VAPID_SUBJECT;
  const publicKey  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    throw new Error(
      "Brak zmiennych środowiskowych VAPID. " +
      "Sprawdź VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY w .env.local"
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export async function sendPush(
  subscription: webpush.PushSubscription,
  payload: PushPayload
) {
  const wp = getWebPush();
  await wp.sendNotification(subscription, JSON.stringify(payload));
}