import { type MapNode, type MapEdge, CATEGORIES } from "@/config/codeMap";

export interface NodePos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

const NODE_R = 8;
const SELECTED_R = 11;
const FONT_SIZE = 11;

export function initPositions(
  nodeList: MapNode[],
  W: number,
  H: number
): NodePos[] {
  const groups: Record<string, number[]> = {};
  nodeList.forEach((n, i) => {
    if (!groups[n.category]) groups[n.category] = [];
    groups[n.category].push(i);
  });

  const keys = Object.keys(groups);
  const R = Math.min(W, H) * 0.32;
  const centers: Record<string, { cx: number; cy: number }> = {};

  keys.forEach((key, gi) => {
    const a = (gi / keys.length) * Math.PI * 2 - Math.PI / 2;
    centers[key] = {
      cx: W / 2 + R * Math.cos(a),
      cy: H / 2 + R * Math.sin(a),
    };
  });

  return nodeList.map((n, i) => {
    const gc = centers[n.category];
    const arr = groups[n.category];
    const li = arr.indexOf(i);
    const lr = 25 + arr.length * 10;
    const la = (li / arr.length) * Math.PI * 2;
    return {
      x: gc.cx + lr * Math.cos(la) + (Math.random() - 0.5) * 10,
      y: gc.cy + lr * Math.sin(la) + (Math.random() - 0.5) * 10,
      vx: 0,
      vy: 0,
    };
  });
}

export function simulate(
  nodeList: MapNode[],
  edgeList: MapEdge[],
  pos: NodePos[],
  W: number,
  H: number,
  iterations: number
): void {
  const idxMap = new Map<string, number>();
  nodeList.forEach((n, i) => idxMap.set(n.id, i));

  const cx = W / 2;
  const cy = H / 2;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d2 = dx * dx + dy * dy || 1;
        const d = Math.sqrt(d2);
        const f = 4000 / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        pos[i].vx += fx;
        pos[i].vy += fy;
        pos[j].vx -= fx;
        pos[j].vy -= fy;
      }
    }

    for (const e of edgeList) {
      const si = idxMap.get(e.source);
      const ti = idxMap.get(e.target);
      if (si === undefined || ti === undefined) continue;
      const dx = pos[ti].x - pos[si].x;
      const dy = pos[ti].y - pos[si].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 100) * 0.004;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      pos[si].vx += fx;
      pos[si].vy += fy;
      pos[ti].vx -= fx;
      pos[ti].vy -= fy;
    }

    for (let i = 0; i < pos.length; i++) {
      pos[i].vx += (cx - pos[i].x) * 0.002;
      pos[i].vy += (cy - pos[i].y) * 0.002;
      pos[i].vx *= 0.85;
      pos[i].vy *= 0.85;
      pos[i].x += pos[i].vx;
      pos[i].y += pos[i].vy;
    }
  }
}

export function drawGraph(
  ctx: CanvasRenderingContext2D,
  nodeList: MapNode[],
  edgeList: MapEdge[],
  pos: NodePos[],
  transform: Transform,
  selected: string | null,
  W: number,
  H: number
): void {
  const idxMap = new Map<string, number>();
  nodeList.forEach((n, i) => idxMap.set(n.id, i));

  const connNodes = new Set<string>();
  const connEdges = new Set<number>();
  if (selected) {
    edgeList.forEach((e, ei) => {
      if (e.source === selected || e.target === selected) {
        connNodes.add(e.source);
        connNodes.add(e.target);
        connEdges.add(ei);
      }
    });
  }

  ctx.clearRect(0, 0, W, H);

  // Arka plan grid
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, transform, W, H);

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.scale, transform.scale);

  drawEdges(ctx, edgeList, pos, idxMap, selected, connEdges);
  drawNodes(ctx, nodeList, pos, selected, connNodes);

  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  t: Transform,
  W: number,
  H: number
): void {
  const gap = 40 * t.scale;
  if (gap < 8) return;
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  const offX = t.x % gap;
  const offY = t.y % gap;
  for (let x = offX; x < W; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = offY; y < H; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawEdges(
  ctx: CanvasRenderingContext2D,
  edgeList: MapEdge[],
  pos: NodePos[],
  idxMap: Map<string, number>,
  selected: string | null,
  connEdges: Set<number>
): void {
  edgeList.forEach((e, ei) => {
    const si = idxMap.get(e.source);
    const ti = idxMap.get(e.target);
    if (si === undefined || ti === undefined) return;

    const hl = connEdges.has(ei);
    const dim = selected !== null && !hl;

    ctx.beginPath();
    ctx.strokeStyle = hl
      ? "#7CFC00"
      : dim
        ? "rgba(255,255,255,0.02)"
        : "rgba(255,255,255,0.07)";
    ctx.lineWidth = hl ? 2 : 0.5;

    const sx = pos[si].x;
    const sy = pos[si].y;
    const ex = pos[ti].x;
    const ey = pos[ti].y;
    const mx = (sx + ex) / 2 + (sy - ey) * 0.12;
    const my = (sy + ey) / 2 + (ex - sx) * 0.12;

    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();

    if (hl) {
      const angle = Math.atan2(ey - my, ex - mx);
      const al = 7;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(
        ex - al * Math.cos(angle - 0.35),
        ey - al * Math.sin(angle - 0.35)
      );
      ctx.moveTo(ex, ey);
      ctx.lineTo(
        ex - al * Math.cos(angle + 0.35),
        ey - al * Math.sin(angle + 0.35)
      );
      ctx.stroke();
    }
  });
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  nodeList: MapNode[],
  pos: NodePos[],
  selected: string | null,
  connNodes: Set<string>
): void {
  nodeList.forEach((n, i) => {
    const { x, y } = pos[i];
    const cat = CATEGORIES[n.category];
    const isSel = n.id === selected;
    const isConn = connNodes.has(n.id);
    const dim = selected !== null && !isSel && !isConn;

    const r = isSel ? SELECTED_R : NODE_R;

    // Glow
    if (isSel) {
      ctx.beginPath();
      ctx.arc(x, y, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = `${cat.color}22`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = dim ? "rgba(80,80,80,0.3)" : cat.color;
    ctx.fill();

    if (isSel) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.font = `${dim ? "normal" : "bold"} ${FONT_SIZE}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = dim ? "rgba(150,150,150,0.2)" : "rgba(255,255,255,0.85)";
    ctx.fillText(n.label, x, y + r + 4);
  });
}

export function hitTest(
  pos: NodePos[],
  mx: number,
  my: number,
  transform: Transform
): number {
  const wx = (mx - transform.x) / transform.scale;
  const wy = (my - transform.y) / transform.scale;

  for (let i = pos.length - 1; i >= 0; i--) {
    const dx = wx - pos[i].x;
    const dy = wy - pos[i].y;
    if (dx * dx + dy * dy < 14 * 14) return i;
  }
  return -1;
}
