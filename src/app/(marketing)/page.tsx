import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { IhaBirimiContainer } from "@/components/features/iha/IhaBirimiContainer";

export const metadata: Metadata = {
  title: "Spherical — CBS İHA Birimi",
  description: "CBS İHA Birimi operasyon yönetim sistemi.",
};

export default function HomePage() {
  return (
    <Container>
      <IhaBirimiContainer />
    </Container>
  );
}
