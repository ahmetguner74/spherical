import { Container } from "@/components/ui";
import { DesignSystemContent } from "@/components/features/design-system/DesignSystemContent";

export const metadata = {
  title: "Design System — Spherical",
  description: "Spherical tasarim sistemi referans sayfasi",
};

export default function DesignPage() {
  return (
    <Container size="lg">
      <DesignSystemContent />
    </Container>
  );
}
