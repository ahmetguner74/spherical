"use client";

import type { ReactNode } from "react";

interface FracProps {
  p: ReactNode;
  q: ReactNode;
}

export function Frac({ p, q }: FracProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        verticalAlign: "middle",
        margin: "0 3px",
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: "0.85em", padding: "0 4px" }}>{p}</span>
      <span
        style={{
          width: "100%",
          height: 1.5,
          background: "currentColor",
          margin: "1px 0",
          minWidth: 18,
        }}
      />
      <span style={{ fontSize: "0.85em", padding: "0 4px" }}>{q}</span>
    </span>
  );
}

interface MixedProps {
  w: number;
  p: number;
  q: number;
}

export function Mixed({ w, p, q }: MixedProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "middle",
        gap: 2,
      }}
    >
      <span>{w}</span>
      <Frac p={p} q={q} />
    </span>
  );
}

export function Times() {
  return (
    <span style={{ margin: "0 3px", verticalAlign: "middle" }}>×</span>
  );
}
