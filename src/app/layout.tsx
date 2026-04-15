import type { Metadata } from "next";
import { ThemeProvider, AuthProvider } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBS İHA BİRİMİ",
  description:
    "CBS İHA Birimi operasyon yönetim sistemi ve 3D görselleştirme platformu.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
