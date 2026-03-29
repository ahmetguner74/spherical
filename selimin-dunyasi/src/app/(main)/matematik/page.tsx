"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useProgress } from "@/hooks/useProgress";

const quizler = [
  {
    id: "matematik-temel",
    baslik: "Temel Matematik",
    aciklama: "Kesirler, geometri, ondal\u0131k say\u0131lar \u2014 20 soru",
    ikon: "\ud83d\udcd0",
    href: "/matematik/quiz",
    soruSayisi: 20,
  },
];

export default function MatematikPage() {
  const { progress, loaded } = useProgress();

  const getQuizStats = (quizId: string) => {
    const results = progress.quizResults.filter((r) => r.quizId === quizId);
    if (results.length === 0) return null;
    const best = Math.max(...results.map((r) => r.score));
    return { attempts: results.length, best };
  };

  return (
    <Container>
      <div style={{ padding: "32px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
            \u2190 Ana Sayfa
          </Link>
        </div>

        <h1 style={styles.title}>\ud83e\uddee Matematik</h1>
        <p style={styles.subtitle}>5. s\u0131n\u0131f matematik konular\u0131 ve quizler</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {quizler.map((q) => {
            const stats = loaded ? getQuizStats(q.id) : null;
            return (
              <Link key={q.id} href={q.href} style={styles.quizCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={styles.quizIcon}>{q.ikon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.quizTitle}>{q.baslik}</h3>
                    <p style={styles.quizDesc}>{q.aciklama}</p>
                  </div>
                  <div style={styles.playBtn}>\u25b6</div>
                </div>
                {stats && (
                  <div style={styles.statsBar}>
                    <span>\ud83c\udfc6 En iyi: <strong>{stats.best} XP</strong></span>
                    <span>\ud83d\udd04 {stats.attempts} deneme</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontFamily: "'Silkscreen', monospace", fontSize: 24, color: "#7CFC00", letterSpacing: 2 },
  subtitle: { fontSize: 14, color: "#999", marginTop: 4 },
  quizCard: { display: "block", background: "rgba(30,40,55,0.9)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(124,252,0,0.15)", textDecoration: "none", transition: "all 0.2s" },
  quizIcon: { fontSize: 32, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,252,0,0.08)", borderRadius: 12, flexShrink: 0 },
  quizTitle: { fontSize: 16, fontWeight: 800, color: "#E8F5E9" },
  quizDesc: { fontSize: 13, color: "#999", marginTop: 2 },
  playBtn: { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #43A047, #2E7D32)", borderRadius: 10, color: "#fff", fontSize: 16, fontWeight: 800, flexShrink: 0 },
  statsBar: { display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#A0D468" },
};
