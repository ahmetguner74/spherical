import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hakkımızda | CBS İHA BİRİMİ",
  description: "CBS İHA Birimi hakkında.",
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <Container size="md">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Hakkımızda</h1>
        </header>
      </Container>
    </div>
  );
}
