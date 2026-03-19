import type { Metadata } from "next";

import {
  Badge,
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
  Container,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Projeler | Spherical",
  description: "Acik kaynak projeler ve kisisel calismalar.",
};

const projects = [
  {
    title: "Spherical",
    description:
      "Kisisel web sitesi ve blog platformu. Next.js, Tailwind CSS ve TypeScript ile gelistirildi. SSR, dark mode ve responsive tasarim destegi.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "3D Portfolio",
    description:
      "Three.js tabanli interaktif 3D portfolyo deneyimi. WebGL ile gercek zamanli render, shader efektleri ve animasyonlar.",
    tags: ["Three.js", "3D", "WebGL"],
  },
  {
    title: "CLI Task Manager",
    description:
      "Terminal tabanli gorev yonetim araci. Rust ile yazildi, yerel dosya sistemi uzerinde calisir. Hizli ve hafif.",
    tags: ["Rust", "CLI", "Acik Kaynak"],
  },
];

export default function ProjectsPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container size="md">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Projeler
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Uzerinde calistigim acik kaynak projeler ve kisisel denemeler.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.title}>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription className="mt-2">
                {project.description}
              </CardDescription>
              <CardFooter>
                {project.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
