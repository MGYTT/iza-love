import ReasonsClient from "./ReasonsClient";

export const metadata = {
  title: "Dlaczego Cię kocham ♥",
  robots: { index: false, follow: false },
};

export default function ReasonsPage() {
  return <ReasonsClient />;
}