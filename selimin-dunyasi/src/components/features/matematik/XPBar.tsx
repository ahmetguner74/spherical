"use client";

interface XPBarProps {
  current: number;
  total: number;
}

export function XPBar({ current, total }: XPBarProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#A0D468",
          fontFamily: "monospace",
        }}
      >
        <span>Seviye \u0130lerlemesi</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div
        style={{
          height: 18,
          background: "#1a1a2e",
          borderRadius: 3,
          border: "2px solid #333",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 14px, rgba(0,0,0,0.15) 14px, rgba(0,0,0,0.15) 16px)",
          }}
        />
        <div
          style={{
            height: "100%",
            width: `${(current / total) * 100}%`,
            background:
              "linear-gradient(180deg, #7CFC00 0%, #48A800 50%, #3A8A00 100%)",
            transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              right: 2,
              height: 4,
              background: "rgba(255,255,255,0.25)",
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}
