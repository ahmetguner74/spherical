"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useProgress } from "@/hooks/useProgress";
import { getLevel, getNextLevel, getLevelProgress } from "@/config/levels";

const dersler = [
  {
    baslik: "Matematik",
    aciklama: "Kesirler, geometri, ondalık sayılar",
    ikon: "🧮",
    href: "/matematik",
    renk: "#7CFC00",
    quizSayisi: 1,
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

export default function HomePage() {
  const { progress, loaded } = useProgress();
  const level = getLevel(progress.totalXP);
  const nextLevel = getNextLevel(progress.totalXP);
  const levelPct = getLevelProgress(progress.totalXP);

  return (
    <Container>
      <div style={{ padding: "32px 0" }}>
        {/* Hoş geldin kartı */}
        <div style={styles.welcomeCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 48 }}>{level.ikon}</div>
            <div>
              <h1 style={styles.welcomeTitle}>
                Hoş geldin, Selim!
              </h1>
              <p style={styles.welcomeSub}>
                Seviye: <strong style={{ color: "#7CFC00" }}>{level.name}</strong>
                {" \u00b7 "}
                <span style={{ color: "#FFD700" }}>
                  {loaded ? progress.totalXP : "\u2014"} XP
                </span>
              </p>
            </div>
          </div>

          {/* XP bar */}
          <div style={{ marginTop: 16 }}>
            <div style={styles.xpLabelRow}>
              <span>{level.ikon} {level.name}</span>
              {nextLevel && <span>{nextLevel.ikon} {nextLevel.name}</span>}
            </div>
            <div style={styles.xpBarOuter}>
              <div
                style={{
                  ...styles.xpBarInner,
                  width: `${levelPct}%`,
                }}
              />
            </div>
          </div>

          {/* \u0130statistikler */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {loaded ? progress.quizResults.length : "\u2014"}
              </div>
              <div style={styles.statLabel}>Quiz \u00c7\u00f6z\u00fcld\u00fc</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {loaded ? progress.totalXP : "\u2014"}
              </div>
              <div style={styles.statLabel}>Toplam XP</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>
                {loaded && progress.quizResults.length > 0
                  ? Math.round(
                      progress.quizResults.reduce((a, r) => a + r.score, 0) /
                        progress.quizResults.length
                    )
                  : "\u2014"}
              </div>
              <div style={styles.statLabel}>Ort. Puan</div>
            </div>
          </div>
        </div>

        {/* Dersler */}
        <h2 style={styles.sectionTitle}>\ud83d\udcda Dersler</h2>
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          }}
        >
          {dersler.map((d) => (
            <Link
              key={d.baslik}
              href={d.href}
              style={{
                ...styles.dersCard,
                opacity: d.yakinda ? 0.45 : 1,
                pointerEvents: d.yakinda ? "none" : "auto",
                borderColor: d.yakinda ? "rgba(255,255,255,0.06)" : `${d.renk}33`,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>{d.ikon}</div>
              <h3 style={{ ...styles.dersTitle, color: d.renk }}>
                {d.baslik}
              </h3>
              <p style={styles.dersDesc}>{d.aciklama}</p>
              {d.yakinda && (
                <span style={styles.yakindaBadge}>Yak\u0131nda</span>
              )}
              {!d.yakinda && d.quizSayisi && (
                <span style={styles.quizBadge}>
                  {d.quizSayisi} Quiz
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}

const styles: Record<string, React.CSSProperties> = {
  welcomeCard: {
    background: "linear-gradient(170deg, rgba(30,40,55,0.95), rgba(20,28,40,0.98))",
    borderRadius: 16,
    padding: "24px",
    border: "1px solid rgba(124,252,0,0.15)",
    marginBottom: 32,
  },
  welcomeTitle: {
    fontFamily: "'Silkscreen', monospace",
    fontSize: 20,
    color: "#7CFC00",
    letterSpacing: 1,
  },
  welcomeSub: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
  xpLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    fontWeight: 700,
    color: "#A0D468",
    fontFamily: "monospace",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  xpBarOuter: {
    height: 14,
    background: "#1a1a2e",
    borderRadius: 3,
    border: "2px solid #333",
    overflow: "hidden",
  },
  xpBarInner: {
    height: "100%",
    background: "linear-gradient(90deg, #7CFC00, #48A800)",
    borderRadius: 2,
    transition: "width 0.8s ease-out",
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    textAlign: "center",
    padding: "10px 8px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "#FFD700",
    fontFamily: "monospace",
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#E8F5E9",
    marginBottom: 16,
  },
  dersCard: {
    display: "block",
    background: "rgba(30,40,55,0.8)",
    borderRadius: 14,
    padding: "20px",
    border: "1px solid",
    textDecoration: "none",
    transition: "all 0.2s",
  },
  dersTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 4,
  },
  dersDesc: {
    fontSize: 13,
    color: "#999",
    lineHeight: 1.4,
  },
  yakindaBadge: {
    display: "inline-block",
    marginTop: 10,
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.06)",
    color: "#888",
  },
  quizBadge: {
    display: "inline-block",
    marginTop: 10,
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    background: "rgba(124,252,0,0.1)",
    color: "#A0D468",
    border: "1px solid rgba(124,252,0,0.2)",
  },
};
