import type { Metadata } from "next";

import { DashboardHeader } from "@/components/features/dashboard";
import { DashboardGrid } from "@/components/features/dashboard";

export const metadata: Metadata = {
  title: "Spherical",
  description: "Yazılım projeleri, 3D görselleştirme ve teknik blog platformu.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DashboardHeader />
      <DashboardGrid />
    </div>
  );
}
