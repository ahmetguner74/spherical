import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { ProjectsContainer } from "@/components/features/projects";

export const metadata: Metadata = {
  title: "Projeler | Spherical",
  description: "Açık kaynak projeler ve kişisel çalışmalar.",
};

export default function ProjectsPage() {
  return (
    <main className="py-8">
      <Container size="md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Projeler
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Üzerinde çalıştığım projeler.
          </p>
        </div>
        <ProjectsContainer />
      </Container>
    </main>
  );
}
