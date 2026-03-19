import type { Metadata } from "next";

import { Badge, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hakkimda | Spherical",
  description: "Ahmet Guner - Yazilim gelistirici. Hakkimda sayfasi.",
};

const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind CSS",
  "Three.js",
  "PostgreSQL",
  "Docker",
  "Git",
  "REST API",
  "GraphQL",
  "Rust",
];

const experience = [
  {
    role: "Full-Stack Gelistirici",
    company: "Freelance",
    period: "2023 - Devam Ediyor",
    description:
      "Modern web uygulamalari ve 3D deneyimler gelistiriyorum. Next.js, React ve Three.js ile cesitli projeler uzerinde calisiyorum.",
  },
  {
    role: "Frontend Gelistirici",
    company: "Teknoloji Startup",
    period: "2021 - 2023",
    description:
      "React ve TypeScript ile kullanici arayuzleri gelistirdim. Performans optimizasyonu ve erisilebilirlik uzerine calistim.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container size="md">
        {/* ---------- Baslik ---------- */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Hakkimda
          </h1>
        </header>

        {/* ---------- Giris ---------- */}
        <section className="mb-16">
          <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Merhaba! Ben Ahmet Guner, yazilim gelistiriciyim. Modern web
            teknolojileri, acik kaynak projeler ve 3D web deneyimleri ile
            ilgileniyorum. Temiz kod, iyi tasarim ve kullanici deneyimine onem
            veriyorum.
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Bos zamanlarimda yeni teknolojiler denemeyi, blog yazilari yazmay
            i ve acik kaynak projelere katki saglamayi seviyorum.
          </p>
        </section>

        {/* ---------- Yetenekler ---------- */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Yetenekler
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} className="px-3 py-1 text-sm">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* ---------- Deneyim ---------- */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Deneyim
          </h2>
          <div className="flex flex-col gap-8">
            {experience.map((item) => (
              <div
                key={item.role}
                className="border-l-2 border-gray-200 pl-6 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.role}
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {item.company} &middot; {item.period}
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
