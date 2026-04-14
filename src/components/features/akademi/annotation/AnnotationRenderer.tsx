"use client";

import type { Annotation } from "@/types/akademi";
import { cn } from "@/lib/utils";

interface AnnotationRendererProps {
  annotations: Annotation[];
  className?: string;
}

/** Salt-okunur SVG katmanı — görselin üzerinde notasyonları gösterir. */
export function AnnotationRenderer({ annotations, className }: AnnotationRendererProps) {
  if (annotations.length === 0) return null;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
    >
      {/* Ok ucu marker tanımı */}
      <defs>
        {annotations
          .filter((a): a is Extract<Annotation, { tool: "arrow" }> => a.tool === "arrow")
          .map((a) => (
            <marker
              key={`marker-${a.id}`}
              id={`arrowhead-${a.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={a.color} />
            </marker>
          ))}
      </defs>

      {annotations.map((a) => {
        switch (a.tool) {
          case "arrow":
            return (
              <line
                key={a.id}
                x1={a.x1}
                y1={a.y1}
                x2={a.x2}
                y2={a.y2}
                stroke={a.color}
                strokeWidth={a.strokeWidth}
                markerEnd={`url(#arrowhead-${a.id})`}
              />
            );
          case "rect":
            return (
              <rect
                key={a.id}
                x={a.x}
                y={a.y}
                width={a.width}
                height={a.height}
                fill="none"
                stroke={a.color}
                strokeWidth={a.strokeWidth}
              />
            );
          case "circle":
            return (
              <ellipse
                key={a.id}
                cx={a.cx}
                cy={a.cy}
                rx={a.rx}
                ry={a.ry}
                fill="none"
                stroke={a.color}
                strokeWidth={a.strokeWidth}
              />
            );
          case "text":
            return (
              <text
                key={a.id}
                x={a.x}
                y={a.y}
                fill={a.color}
                fontSize={a.fontSize}
                fontWeight="bold"
                dominantBaseline="hanging"
              >
                {a.text}
              </text>
            );
        }
      })}
    </svg>
  );
}
