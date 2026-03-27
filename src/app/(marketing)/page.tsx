import type { Metadata } from "next";

import { DashboardGrid } from "@/components/features/dashboard";

export const metadata: Metadata = {
  title: "Spherical",
  description: "Yazılım projeleri, 3D görselleştirme ve teknik blog platformu.",
};

export default function HomePage() {
  return <DashboardGrid />;
}
