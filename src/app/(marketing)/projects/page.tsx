import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Projeler | CBS İHA BİRİMİ",
  description: "Projeler.",
};

export default function ProjectsPage() {
  return (
    <main className="py-8">
      <Container size="md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Projeler
          </h1>
        </div>
      </Container>
    </main>
  );
}
