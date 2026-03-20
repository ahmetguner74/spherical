import { Container } from "@/components/ui";
import { WorksContainer } from "@/components/features/works";

export default function WorksPage() {
  return (
    <main className="py-8">
      <Container>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">İşlerim</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Ortak çalışmalar ve tamamlanan projeler
          </p>
        </div>
        <WorksContainer />
      </Container>
    </main>
  );
}
