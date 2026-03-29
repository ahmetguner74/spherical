"use client";

const chars = ["✦", "⬥", "◆", "✧"];

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  dur: 6 + Math.random() * 6,
  size: 4 + Math.random() * 8,
  char: chars[i % 4],
}));

export function Particles() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: "-20px",
            fontSize: `${p.size}px`,
            color: "#7CFC0044",
            animation: `floatUp ${p.dur}s ${p.delay}s linear infinite`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
