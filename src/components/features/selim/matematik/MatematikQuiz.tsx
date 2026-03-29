"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { Particles } from "./Particles";
import { XPBar } from "./XPBar";
import { Hearts } from "./Hearts";
import { sorular } from "./sorular";
import { quizStyles as S, keyframes } from "./styles";

type Feedback = "correct" | "wrong" | null;

export function MatematikQuiz() {
  const [cur, setCur] = useState(0);
  const [hIdx, setHIdx] = useState(0);
  const [hints, setHints] = useState<number[]>([]);
  const [fb, setFb] = useState<Feedback>(null);
  const [wc, setWc] = useState(0);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const [entering, setEntering] = useState(true);
  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 400);
    return () => clearTimeout(t);
  }, [cur]);

  useEffect(() => {
    return () => {
      if (tmr.current) clearTimeout(tmr.current);
    };
  }, []);

  const q = sorular[cur] || null;

  const handleAnswer = (idx: number) => {
    if (fb === "correct" || !q) return;
    setSelIdx(idx);

    if (idx === q.dogruCevap) {
      setFb("correct");
      setScore((s) => s + Math.max(10 - wc * 3, 3));
      tmr.current = setTimeout(() => {
        if (cur + 1 >= sorular.length) {
          setDone(true);
        } else {
          setCur((c) => c + 1);
          setFb(null);
          setHIdx(0);
          setHints([]);
          setWc(0);
          setSelIdx(null);
        }
      }, 1400);
    } else {
      setFb("wrong");
      setWc((w) => w + 1);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setFb(null);
        setSelIdx(null);
      }, 800);
    }
  };

  const showHint = () => {
    if (q && hIdx < q.ipuclari.length) {
      setHints((h) => [...h, hIdx]);
      setHIdx((i) => i + 1);
    }
  };

  const reset = () => {
    setCur(0);
    setScore(0);
    setDone(false);
    setFb(null);
    setHIdx(0);
    setHints([]);
    setWc(0);
    setSelIdx(null);
  };

  if (done) {
    return (
      <div style={S.page}>
        <Particles />
        <style>{keyframes}</style>
        <div
          style={{
            ...S.card,
            animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div
            style={{
              fontSize: 64,
              marginBottom: 12,
              animation: "bounce 1s infinite",
              textAlign: "center",
            }}
          >
            🏆
          </div>
          <h1 style={S.title}>TEBRİKLER!</h1>
          <p
            style={{
              fontSize: 18,
              color: "#c8e6c9",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            20 sorunun tamamını bitirdin!
          </p>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <div
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "linear-gradient(135deg, #FFD700, #FFA000)",
                borderRadius: 8,
                border: "2px solid #E65100",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: "#3E2723",
                  fontFamily: "monospace",
                }}
              >
                {score} XP
              </span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={reset} style={S.restartBtn}>
              🔄 Tekrar Oyna
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const seviyeRenk =
    q.seviye === "Zor"
      ? {
          bg: "rgba(229,57,53,0.12)",
          border: "1px solid rgba(229,57,53,0.35)",
          color: "#EF9A9A",
        }
      : {
          bg: "rgba(124,252,0,0.08)",
          border: "1px solid rgba(124,252,0,0.2)",
          color: "#A0D468",
        };

  const btnStyle = (idx: number): CSSProperties => {
    const base = { ...S.optionBtn };
    if (fb === "correct" && idx === q.dogruCevap) {
      return {
        ...base,
        background: "linear-gradient(135deg, #2E7D32, #43A047)",
        borderColor: "#1B5E20",
        color: "#fff",
        transform: "scale(1.03)",
        boxShadow: "0 0 20px rgba(76,175,80,0.5)",
      };
    }
    if (fb === "wrong" && idx === selIdx) {
      return {
        ...base,
        background: "linear-gradient(135deg, #C62828, #E53935)",
        borderColor: "#B71C1C",
        color: "#fff",
        animation: "headShake 0.5s",
      };
    }
    return base;
  };

  return (
    <div style={S.page}>
      <Particles />
      <style>{keyframes}</style>
      <div
        style={{
          ...S.card,
          animation: shake ? "headShake 0.4s" : undefined,
        }}
      >
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>⛏️</span>
            <span style={S.headerTitle}>Matematik Macerası</span>
          </div>
          <div style={S.scoreBadge}>
            <span style={{ fontSize: 14 }}>⭐</span> {score} XP
          </div>
        </div>

        <XPBar current={cur} total={sorular.length} />
        <Hearts wrong={wc} />

        <div
          style={{
            ...S.questionArea,
            opacity: entering ? 0 : 1,
            transform: entering ? "translateY(16px)" : "translateY(0)",
            transition: "all 0.4s ease-out",
          }}
        >
          <div
            style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}
          >
            <span
              style={{
                ...S.topicBadge,
                background: seviyeRenk.bg,
                border: seviyeRenk.border,
                color: seviyeRenk.color,
              }}
            >
              {q.seviye === "Zor" ? "🔥" : "📗"} {q.seviye}
            </span>
            <span style={S.topicBadge}>
              <span>{q.ikon}</span> {q.konu}
            </span>
          </div>
          <p style={S.questionText}>{q.soru}</p>
          {q.soruAlt && <p style={S.questionSub}>{q.soruAlt}</p>}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            opacity: entering ? 0 : 1,
            transform: entering ? "translateY(12px)" : "translateY(0)",
            transition: "all 0.4s ease-out 0.1s",
          }}
        >
          {q.secenekler.map((s, i) => (
            <button
              key={`${cur}-${i}`}
              onClick={() => handleAnswer(i)}
              style={btnStyle(i)}
              onMouseEnter={(e) => {
                if (!fb) {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.15)";
                  el.style.borderColor = "#7CFC00";
                  el.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!fb) {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.06)";
                  el.style.borderColor = "rgba(255,255,255,0.12)";
                  el.style.transform = "translateX(0)";
                }
              }}
            >
              <span style={S.optionLetter}>
                {String.fromCharCode(65 + i)}
              </span>
              <span>{s}</span>
            </button>
          ))}
        </div>

        {fb === "correct" && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "rgba(76,175,80,0.15)",
              border: "1px solid #4CAF50",
              borderRadius: 8,
              color: "#A5D6A7",
              fontWeight: 700,
              fontSize: 15,
              animation: "popIn 0.3s ease-out",
            }}
          >
            ✅ Doğru Cevap! Harikasın!
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {hints.length > 0 && (
            <div style={S.hintsBox}>
              {hints.map((hintIndex) => (
                <div
                  key={hintIndex}
                  style={{
                    ...S.hintItem,
                    animation: "slideIn 0.3s ease-out",
                  }}
                >
                  <span
                    style={{
                      color: "#FFD54F",
                      marginRight: 8,
                      flexShrink: 0,
                    }}
                  >
                    💡
                  </span>
                  <span>{q.ipuclari[hintIndex]}</span>
                </div>
              ))}
            </div>
          )}
          {hIdx < (q?.ipuclari?.length || 0) ? (
            <button onClick={showHint} style={S.hintBtn}>
              💡 {hints.length === 0 ? "Bana Yardım Et" : "Başka İpucu Ver"}
            </button>
          ) : hints.length > 0 ? (
            <p
              style={{
                color: "#aaa",
                fontSize: 13,
                fontStyle: "italic",
                margin: "8px 0 0",
              }}
            >
              Başka ipucu kalmadı — yapabileceğine inanıyorum!
            </p>
          ) : null}
        </div>

        <div style={S.footer}>
          Soru {cur + 1} / {sorular.length}
        </div>
      </div>
    </div>
  );
}
