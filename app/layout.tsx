import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import HeartParticles from "@/components/HeartParticles";
import GeoBackground from "@/components/GeoBackground";
import AmbientPlayer from "@/components/AmbientPlayer";
import NightModeProvider from "@/components/NightModeProvider";
import StoreHydration from "@/components/StoreHydration";
import LoadingWrapper from "@/components/LoadingWrapper";

export const metadata: Metadata = {
  title: "Nasza Historia ♥ Iza",
  description: "Chronologiczna historia miłości opowiedziana przez nasze piosenki.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <NightModeProvider>
          <LoadingWrapper>
          {children}
        </LoadingWrapper>
          <GeoBackground />
          <StoreHydration />
          <HeartParticles />
          {children}
          <AmbientPlayer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(45,16,24,0.9)",
                border: "1px solid rgba(240,160,184,0.2)",
                color: "#f7cdd8",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </NightModeProvider>
      </body>
    </html>
  );
}