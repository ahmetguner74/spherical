import {
  type MapNode,
  type MapEdge,
  CATEGORIES,
  LAYER_LABELS,
} from "@/config/codeMap";

export interface NodePos {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

const NODE_H = 36;
const NODE_PAD = 12;
const LAYER_GAP = 130;
const TOP_PAD = 60;
const FONT = "bold 11px sans-serif";
const EMOJI_FONT = "13px sans-serif";

export function layoutHierarchical(
  nodeList: MapNode[],
  viewW: number
): NodePos[] {
  const layers: number[][] = [];
  nodeList.forEach((n, i) => {
    if (!layers[n.layer]) layers[n.layer] = [];
    layers[n.layer].push(i);
  });

  const positions: NodePos[] = [];

  for (let li = 0; li < layers.length; li++) {
    const ids = layers[li] || [];
    const y = TOP_PAD + li * LAYER_GAP;
    const nodeW = 110;
    const totalW = ids.length * (nodeW + NODE_PAD);
    const startX = Math.max(40, (Math.max(viewW, totalW + 80) - totalW) / 2);

    ids.forEach((ni, xi) => {
      positions[ni] = {
        x: startX + xi * (nodeW + NODE_PAD),
        y,
        w: nodeW,
        h: NODE_H,
      };
    });
  }

  return positions;
}

export function getWorldBounds(pos: NodePos[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pos) {
    if (!p) continue;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + p.w);
    maxY = Math.max(maxY, p.y + p.h);
  }
  return { minX, minY, maxX, maxY };
}

export function autoFitTransform(
  pos: NodePos[],
  viewW: number,
  viewH: number
): Transform {
  const b = getWorldBounds(pos);
  const pad = 60;
  const cw = b.maxX - b.minX + pad * 2;
  const ch = b.maxY - b.minY + pad * 2;
  const scale = Math.min(viewW / cw, viewH / ch, 1.2);
  const tx = (viewW - cw * scale) / 2 - (b.minX - pad) * scale;
  const ty = (viewH - ch * scale) / 2 - (b.minY - pad) * scale;
  return { x: tx, y: ty, scale };
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

  // Arka plan
  ctx.fillStyle = "#0B0E18";
  ctx.fillRect(0, 0, W, H);
  drawGridBg(ctx, transform, W, H);

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.scale, transform.scale);

  drawLayerBands(ctx, nodeList, pos);
  drawGroupBoxes(ctx, nodeList, pos);
  drawEdges(ctx, edgeList, pos, idxMap, selected, connEdges);
  drawNodes(ctx, nodeList, pos, selected, connNodes);

  ctx.restore();
}

function drawGridBg(
  ctx: CanvasRenderingContext2D,
  t: Transform,
  W: number,
  H: number
): void {
  const gap = 30 * t.scale;
  if (gap < 6) return;
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
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

function drawLayerBands(
  ctx: CanvasRenderingContext2D,
  nodeList: MapNode[],
  pos: NodePos[]
): void {
  const b = getWorldBounds(pos);
  const bandW = b.maxX - b.minX + 120;
  const bandX = b.minX - 60;

  for (let li = 0; li < LAYER_LABELS.length; li++) {
    const nodesInLayer = nodeList
      .map((n, i) => ({ n, i }))
      .filter((x) => x.n.layer === li);
    if (nodesInLayer.length === 0) continue;

    const yMin = Math.min(...nodesInLayer.map((x) => pos[x.i].y)) - 25;
    const yMax =
      Math.max(...nodesInLayer.map((x) => pos[x.i].y + pos[x.i].h)) + 15;

    ctx.fillStyle =
      li % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.008)";
    ctx.fillRect(bandX, yMin, bandW, yMax - yMin);

    // Katman başlığı
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(LAYER_LABELS[li], bandX + 8, yMin + 4);
  }
}

function drawGroupBoxes(
  ctx: CanvasRenderingContext2D,
  nodeList: MapNode[],
  pos: NodePos[]
): void {
  const groups = new Map<string, number[]>();
  nodeList.forEach((n, i) => {
    if (n.group && n.layer >= 2) {
      if (!groups.has(n.group)) groups.set(n.group, []);
      groups.get(n.group)!.push(i);
    }
  });

  const groupColors: Record<string, string> = {
    iha: "rgba(96,165,250,0.06)",
    works: "rgba(251,191,36,0.06)",
    selim: "rgba(52,211,153,0.06)",
  };
  const groupBorders: Record<string, string> = {
    iha: "rgba(96,165,250,0.15)",
    works: "rgba(251,191,36,0.15)",
    selim: "rgba(52,211,153,0.15)",
  };
  const groupLabels: Record<string, string> = {
    iha: "🚁 İHA Birimi",
    works: "💼 İş Takip",
    selim: "🎮 Selim Eğitim",
  };

  for (const [gk, indices] of groups) {
    const pad = 12;
    const xMin = Math.min(...indices.map((i) => pos[i].x)) - pad;
    const yMin = Math.min(...indices.map((i) => pos[i].y)) - pad - 16;
    const xMax = Math.max(...indices.map((i) => pos[i].x + pos[i].w)) + pad;
    const yMax = Math.max(...indices.map((i) => pos[i].y + pos[i].h)) + pad;

    ctx.fillStyle = groupColors[gk] || "rgba(255,255,255,0.03)";
    ctx.strokeStyle = groupBorders[gk] || "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    roundRect(ctx, xMin, yMin, xMax - xMin, yMax - yMin, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(groupLabels[gk] || gk, xMin + 8, yMin + 4);
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
    if (!pos[si] || !pos[ti]) return;

    const hl = connEdges.has(ei);
    const dim = selected !== null && !hl;

    const sx = pos[si].x + pos[si].w / 2;
    const sy = pos[si].y + pos[si].h;
    const ex = pos[ti].x + pos[ti].w / 2;
    const ey = pos[ti].y;

    ctx.beginPath();
    ctx.strokeStyle = hl
      ? "#7CFC00"
      : dim
        ? "rgba(255,255,255,0.02)"
        : "rgba(255,255,255,0.06)";
    ctx.lineWidth = hl ? 2.5 : 0.8;

    const my = (sy + ey) / 2;
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx, my, ex, my, ex, ey);
    ctx.stroke();

    // Ok ucu
    if (hl) {
      const al = 6;
      ctx.beginPath();
      ctx.moveTo(ex - al, ey - al);
      ctx.lineTo(ex, ey);
      ctx.lineTo(ex + al, ey - al);
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
    if (!pos[i]) return;
    const { x, y, w, h } = pos[i];
    const cat = CATEGORIES[n.category];
    const isSel = n.id === selected;
    const isConn = connNodes.has(n.id);
    const dim = selected !== null && !isSel && !isConn;
    const alpha = dim ? 0.2 : 1;

    // Glow
    if (isSel) {
      ctx.shadowColor = cat.color;
      ctx.shadowBlur = 16;
    }

    // Node kutusu
    ctx.fillStyle = dim
      ? `rgba(40,40,50,${alpha})`
      : hexToRgba(cat.color, 0.15);
    ctx.strokeStyle = dim
      ? `rgba(80,80,80,${alpha})`
      : isSel
        ? "#fff"
        : hexToRgba(cat.color, 0.5);
    ctx.lineWidth = isSel ? 2 : 1;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Emoji
    ctx.font = EMOJI_FONT;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = dim ? `rgba(255,255,255,${alpha})` : "white";
    ctx.fillText(n.emoji, x + 6, y + h / 2);

    // Label
    ctx.font = FONT;
    ctx.fillStyle = dim
      ? `rgba(200,200,200,${alpha})`
      : "rgba(255,255,255,0.9)";
    ctx.textAlign = "left";

    const maxTextW = w - 30;
    let label = n.label;
    if (ctx.measureText(label).width > maxTextW) {
      while (ctx.measureText(label + "…").width > maxTextW && label.length > 3) {
        label = label.slice(0, -1);
      }
      label += "…";
    }
    ctx.fillText(label, x + 24, y + h / 2 + 1);

    // Kategori çizgisi (alt)
    if (!dim) {
      ctx.fillStyle = cat.color;
      ctx.fillRect(x + 4, y + h - 3, w - 8, 2);
    }
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
    if (!pos[i]) continue;
    const { x, y, w, h } = pos[i];
    if (wx >= x && wx <= x + w && wy >= y && wy <= y + h) return i;
  }
  return -1;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function hexToRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
