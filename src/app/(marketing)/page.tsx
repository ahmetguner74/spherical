import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { IhaBirimiContainer } from "@/components/features/iha/IhaBirimiContainer";

export const metadata: Metadata = {
  title: "CBS İHA BİRİMİ — Operasyon Yönetim Paneli",
  description: "CBS İHA Birimi operasyon yönetim sistemi.",
};

export default function HomePage() {
  return (
    <Container size="full">
      <IhaBirimiContainer />
    </Container>
  );
}
