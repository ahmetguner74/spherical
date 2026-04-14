import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AkademiContainer } from "@/components/features/akademi";

export const metadata: Metadata = {
  title: "Akademi | CBS İHA BİRİMİ",
  description: "Yazılım iş akışları ve eğitim rehberleri.",
};

export default function AkademiPage() {
  return (
    <div className="py-4">
      <Container size="xl">
        <AkademiContainer />
      </Container>
    </div>
  );
}
