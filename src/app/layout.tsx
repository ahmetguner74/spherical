import type { Metadata } from "next";
import { ThemeProvider, PasswordGate } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spherical - Ahmet Guner",
  description:
    "Yazılım projeleri, 3D görselleştirme, proje yönetimi ve teknik blog.",
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
          <PasswordGate>{children}</PasswordGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
