import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { PasswordGate } from "@/components/providers/PasswordGate";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Nunito:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
