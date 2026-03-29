"use client";

interface HeartsProps {
  wrong: number;
}

export function Hearts({ wrong }: HeartsProps) {
  const remaining = Math.max(0, 3 - wrong);

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        justifyContent: "center",
        marginBottom: 12,
      }}
    >
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          style={{
            fontSize: 22,
            filter:
              i < remaining ? "none" : "grayscale(1) opacity(0.3)",
            transition: "filter 0.3s, transform 0.3s",
            transform: i < remaining ? "scale(1)" : "scale(0.85)",
          }}
        >
          \u2764\ufe0f
        </span>
      ))}
    </div>
  );
}
