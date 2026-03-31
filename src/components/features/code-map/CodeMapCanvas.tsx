"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { nodes, edges } from "@/config/codeMap";
import {
  layoutHierarchical,
  autoFitTransform,
  drawGraph,
  hitTest,
  type NodePos,
  type Transform,
} from "./graphUtils";
import { CodeMapLegend } from "./CodeMapLegend";
import { CodeMapInfoPanel } from "./CodeMapInfoPanel";

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
  const readyRef = useRef(false);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !readyRef.current) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const rect = c.getBoundingClientRect();
    drawGraph(
      ctx, nodes, edges, posRef.current, tRef.current,
      selectedRef.current, rect.width, rect.height
    );
  }, []);

  useEffect(() => {
    selectedRef.current = selected;
    redraw();
  }, [selected, redraw]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const setup = () => {
      const rect = c.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      c.width = rect.width * dpr;
      c.height = rect.height * dpr;
      const ctx = c.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      if (posRef.current.length === 0) {
        posRef.current = layoutHierarchical(nodes, rect.width * 2.5);
        tRef.current = autoFitTransform(
          posRef.current, rect.width, rect.height
        );
      }
      readyRef.current = true;
      redraw();
    };

    requestAnimationFrame(setup);

    const onResize = () => {
      const rect = c.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      c.width = rect.width * dpr;
      c.height = rect.height * dpr;
      const ctx = c.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      redraw();
    };

    window.addEventListener("resize", onResize);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const t = tRef.current;
      const ns = Math.max(0.15, Math.min(5, t.scale * factor));
      t.x = mx - ((mx - t.x) / t.scale) * ns;
      t.y = my - ((my - t.y) / t.scale) * ns;
      t.scale = ns;
      redraw();
    };
    c.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("resize", onResize);
      c.removeEventListener("wheel", handleWheel);
    };
  }, [redraw]);

  const getXY = (e: React.PointerEvent): [number, number] => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return [0, 0];
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const [mx, my] = getXY(e);
    const idx = hitTest(posRef.current, mx, my, tRef.current);
    if (idx >= 0) {
      const p = posRef.current[idx];
      const wx = (mx - tRef.current.x) / tRef.current.scale;
      const wy = (my - tRef.current.y) / tRef.current.scale;
      dragRef.current = { idx, ox: p.x - wx, oy: p.y - wy };
      setSelected(nodes[idx].id);
    } else {
      panRef.current = {
        sx: mx, sy: my, tx: tRef.current.x, ty: tRef.current.y,
      };
      setSelected(null);
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
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
  }, [redraw]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    panRef.current = null;
  }, []);

  const zoom = useCallback((dir: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const factor = dir > 0 ? 1.3 : 0.7;
    const t = tRef.current;
    const ns = Math.max(0.15, Math.min(5, t.scale * factor));
    t.x = cx - ((cx - t.x) / t.scale) * ns;
    t.y = cy - ((cy - t.y) / t.scale) * ns;
    t.scale = ns;
    redraw();
  }, [redraw]);

  const selectedNode = selected
    ? nodes.find((n) => n.id === selected) ?? null
    : null;

  return (
    <div className="relative w-full h-[calc(100vh-120px)] overflow-hidden bg-[#0B0E18]">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <CodeMapLegend />
      <ZoomControls onZoom={zoom} />
      <CodeMapInfoPanel node={selectedNode} onClose={() => setSelected(null)} />
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
