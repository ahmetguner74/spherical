import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { DesignShowcase } from "@/components/features/design/DesignShowcase";

export const metadata: Metadata = {
  title: "Tasarım Rehberi | CBS İHA BİRİMİ",
  description: "Renk paleti, ikonlar, tipografi ve bileşen örnekleri.",
};

export default function DesignPage() {
  return (
    <div className="py-8">
      <Container size="lg">
        <DesignShowcase />
      </Container>
    </div>
  );
}
