// app/love/page.tsx
import LoveLetter from "./LoveLetter";

export const metadata = {
  title: "Tylko dla Ciebie ♥",
  robots: { index: false, follow: false },
};

export default function LovePage() {
  return <LoveLetter />;
}