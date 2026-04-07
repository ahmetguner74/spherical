import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AboutContainer } from "@/components/features/about";

export const metadata: Metadata = {
  title: "Hakkımda | Spherical",
  description: "Ahmet Guner - Yazılım geliştirici.",
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <Container size="md">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Hakkımda</h1>
        </header>
        <AboutContainer />
      </Container>
    </div>
  );
}
