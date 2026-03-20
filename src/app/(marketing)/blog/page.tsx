import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog | Spherical",
  description: "Yazılım, teknoloji ve kişisel deneyimler üzerine yazılar.",
};

const posts = [
  {
    title: "Next.js App Router ile Modern Web Uygulamaları",
    description: "App Router, React Server Components ve yeni nesil veri çekme yöntemleri.",
    tags: ["Next.js", "React"],
    date: "12 Mar 2026",
  },
  {
    title: "Three.js ve React ile 3D Web Deneyimleri",
    description: "React Three Fiber kullanarak tarayıcıda etkileyici 3D sahneler.",
    tags: ["3D", "Three.js"],
    date: "28 Şub 2026",
  },
  {
    title: "TypeScript ile Tip Güvenli API Tasarımı",
    description: "Zod, tRPC ve TypeScript kullanarak uçtan uca tip güvenliği.",
    tags: ["TypeScript", "API"],
    date: "15 Şub 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="py-12">
      <Container size="md">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Blog</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Yazılım, teknoloji ve kişisel deneyimler.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-hover)]"
            >
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {post.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {post.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
                  >
                    {tag}
                  </span>
                ))}
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                  {post.date}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
