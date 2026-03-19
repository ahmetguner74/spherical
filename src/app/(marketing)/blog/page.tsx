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
  title: "Blog | Spherical",
  description:
    "Yazilim gelistirme, web teknolojileri ve 3D deneyimler uzerine yazilar.",
};

const posts = [
  {
    title: "Next.js App Router ile Modern Web Uygulamalari",
    description:
      "App Router, React Server Components ve yeni nesil veri cekme yontemleri hakkinda detayli bir inceleme.",
    tags: ["Next.js", "React"],
    date: "12 Mar 2026",
  },
  {
    title: "Three.js ve React ile 3D Web Deneyimleri",
    description:
      "React Three Fiber kullanarak tarayicida etkileyici 3D sahneler olusturmanin yollari.",
    tags: ["3D", "Three.js"],
    date: "28 Sub 2026",
  },
  {
    title: "TypeScript ile Tip Guvenli API Tasarimi",
    description:
      "Zod, tRPC ve TypeScript kullanarak uctan uca tip guvenligi saglayan API mimarisi.",
    tags: ["TypeScript", "API"],
    date: "15 Sub 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container size="md">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Blog
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Yazilim, teknoloji ve kisisel deneyimlerim uzerine yazilar.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Card key={post.title}>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription className="mt-2">
                {post.description}
              </CardDescription>
              <CardFooter>
                {post.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                <span className="ml-auto text-xs text-gray-400">
                  {post.date}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
