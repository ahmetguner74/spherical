import Link from "next/link";
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
  title: "Ana Sayfa | Spherical",
  description:
    "Ahmet Guner - Yazilim gelistirici. Web, mobil ve 3D projeler.",
};

export default function HomePage() {
  return (
    <div className="py-16 sm:py-24">
      {/* ---------- Hero ---------- */}
      <Container size="md">
        <section className="mb-20">
          <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            Merhaba, ben
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Ahmet Guner
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Yazilim gelistirici, acik kaynak meraklisi. Modern web teknolojileri
            ve 3D deneyimler uzerine calismalar yapiyorum. Bu site kisisel
            blogum ve proje vitrinim.
          </p>
        </section>

        {/* ---------- Son Yazilar ---------- */}
        <section className="mb-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Son Yazilar
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Tumu &rarr;
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardTitle>Next.js App Router ile Modern Web Uygulamalari</CardTitle>
              <CardDescription className="mt-2">
                App Router, React Server Components ve yeni nesil veri cekme
                yontemleri hakkinda detayli bir inceleme.
              </CardDescription>
              <CardFooter>
                <Badge>Next.js</Badge>
                <Badge variant="info">React</Badge>
                <span className="ml-auto text-xs text-gray-400">
                  12 Mar 2026
                </span>
              </CardFooter>
            </Card>

            <Card>
              <CardTitle>Three.js ve React ile 3D Web Deneyimleri</CardTitle>
              <CardDescription className="mt-2">
                React Three Fiber kullanarak tarayicida etkileyici 3D sahneler
                olusturmanin yollari.
              </CardDescription>
              <CardFooter>
                <Badge>3D</Badge>
                <Badge variant="info">Three.js</Badge>
                <span className="ml-auto text-xs text-gray-400">
                  28 Sub 2026
                </span>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ---------- Projeler ---------- */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Projeler
            </h2>
            <Link
              href="/projects"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Tumu &rarr;
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardTitle>Spherical</CardTitle>
              <CardDescription className="mt-2">
                Kisisel web sitesi ve blog platformu. Next.js, Tailwind CSS ve
                TypeScript ile gelistirildi.
              </CardDescription>
              <CardFooter>
                <Badge>Next.js</Badge>
                <Badge variant="info">TypeScript</Badge>
              </CardFooter>
            </Card>

            <Card>
              <CardTitle>3D Portfolio</CardTitle>
              <CardDescription className="mt-2">
                Three.js tabanli interaktif 3D portfolyo deneyimi. WebGL ile
                gercek zamanli render.
              </CardDescription>
              <CardFooter>
                <Badge>Three.js</Badge>
                <Badge variant="info">WebGL</Badge>
              </CardFooter>
            </Card>
          </div>
        </section>
      </Container>
    </div>
  );
}
