"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { nodes, edges } from "@/config/codeMap";
import {
  initPositions,
  simulate,
  drawGraph,
  hitTest,
  type NodePos,
  type Transform,
} from "./graphUtils";
import { CodeMapLegend } from "./CodeMapLegend";

export function CodeMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef<NodePos[]>([]);
  const tRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{
    idx: number;
    ox: number;
    oy: number;
  } | null>(null);
  const panRef = useRef<{
    sx: number;
    sy: number;
    tx: number;
    ty: number;
  } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    drawGraph(
      ctx,
      nodes,
      edges,
      posRef.current,
      tRef.current,
      selectedRef.current,
      c.width,
      c.height
    );
  }, []);

  useEffect(() => {
    selectedRef.current = selected;
    redraw();
  }, [selected, redraw]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      c.width = c.offsetWidth * dpr;
      c.height = c.offsetHeight * dpr;
      const ctx = c.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      if (posRef.current.length === 0) {
        posRef.current = initPositions(nodes, c.offsetWidth, c.offsetHeight);
        simulate(
          nodes,
          edges,
          posRef.current,
          c.offsetWidth,
          c.offsetHeight,
          300
        );
      }
      redraw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  const getXY = (e: React.PointerEvent | React.WheelEvent): [number, number] => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return [0, 0];
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const [mx, my] = getXY(e);
      const idx = hitTest(posRef.current, mx, my, tRef.current);

      if (idx >= 0) {
        const wx = (mx - tRef.current.x) / tRef.current.scale;
        const wy = (my - tRef.current.y) / tRef.current.scale;
        dragRef.current = {
          idx,
          ox: posRef.current[idx].x - wx,
          oy: posRef.current[idx].y - wy,
        };
        setSelected(nodes[idx].id);
      } else {
        panRef.current = {
          sx: mx,
          sy: my,
          tx: tRef.current.x,
          ty: tRef.current.y,
        };
        setSelected(null);
      }
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const [mx, my] = getXY(e);

      if (dragRef.current) {
        const wx = (mx - tRef.current.x) / tRef.current.scale;
        const wy = (my - tRef.current.y) / tRef.current.scale;
        posRef.current[dragRef.current.idx].x = wx + dragRef.current.ox;
        posRef.current[dragRef.current.idx].y = wy + dragRef.current.oy;
        redraw();
      } else if (panRef.current) {
        tRef.current.x = panRef.current.tx + (mx - panRef.current.sx);
        tRef.current.y = panRef.current.ty + (my - panRef.current.sy);
        redraw();
      }
    },
    [redraw]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    panRef.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const [mx, my] = getXY(e);
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const t = tRef.current;
      const ns = Math.max(0.2, Math.min(5, t.scale * factor));

      t.x = mx - ((mx - t.x) / t.scale) * ns;
      t.y = my - ((my - t.y) / t.scale) * ns;
      t.scale = ns;
      redraw();
    },
    [redraw]
  );

  const zoom = useCallback(
    (dir: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const cx = c.offsetWidth / 2;
      const cy = c.offsetHeight / 2;
      const factor = dir > 0 ? 1.3 : 0.7;
      const t = tRef.current;
      const ns = Math.max(0.2, Math.min(5, t.scale * factor));
      t.x = cx - ((cx - t.x) / t.scale) * ns;
      t.y = cy - ((cy - t.y) / t.scale) * ns;
      t.scale = ns;
      redraw();
    },
    [redraw]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />
      <CodeMapLegend />
      <ZoomControls onZoom={zoom} />
      {selected && <ClearButton onClick={() => setSelected(null)} />}
    </div>
  );
}

function ZoomControls({ onZoom }: { onZoom: (dir: number) => void }) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <button
        onClick={() => onZoom(1)}
        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 transition"
      >
        +
      </button>
      <button
        onClick={() => onZoom(-1)}
        className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 transition"
      >
        −
      </button>
    </div>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition"
    >
      ✕ Seçimi Kaldır
    </button>
  );
}
