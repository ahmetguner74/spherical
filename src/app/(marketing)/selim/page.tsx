import { Container } from "@/components/ui/Container";
import Link from "next/link";

const bolumler = [
  {
    baslik: "Matematik",
    aciklama: "Kesirler, geometri, ondalık sayılar ve daha fazlası",
    ikon: "🧮",
    href: "/selim/matematik",
    renk: "#7CFC00",
  },
  {
    baslik: "Türkçe",
    aciklama: "Yakında eklenecek",
    ikon: "📖",
    href: "#",
    renk: "#FFD54F",
    yakinda: true,
  },
  {
    baslik: "Fen Bilimleri",
    aciklama: "Yakında eklenecek",
    ikon: "🔬",
    href: "#",
    renk: "#64B5F6",
    yakinda: true,
  },
];

export default function SelimPage() {
  return (
    <Container size="md">
      <div className="py-10">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: "'Silkscreen', monospace",
              color: "var(--accent)",
              letterSpacing: 2,
            }}
          >
            ⛏️ Selim&apos;in Dünyası
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Eğlenceli dersler ve maceralar seni bekliyor!
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bolumler.map((b) => (
            <Link
              key={b.baslik}
              href={b.href}
              className={`block rounded-xl border p-6 transition-all duration-200 ${
                b.yakinda
                  ? "opacity-50 pointer-events-none"
                  : "hover:scale-[1.02] hover:shadow-lg"
              }`}
              style={{
                background: "var(--surface)",
                borderColor: b.yakinda
                  ? "var(--border)"
                  : `${b.renk}33`,
              }}
            >
              <div className="text-4xl mb-3">{b.ikon}</div>
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: b.renk }}
              >
                {b.baslik}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {b.aciklama}
              </p>
              {b.yakinda && (
                <span
                  className="inline-block mt-3 text-xs font-semibold px-2 py-1 rounded"
                  style={{
                    background: "var(--surface-hover)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Yakında
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
