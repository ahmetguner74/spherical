import { type MapNode, CATEGORIES, nodes, edges } from "@/config/codeMap";

interface Props {
  node: MapNode | null;
  onClose: () => void;
}

export function CodeMapInfoPanel({ node, onClose }: Props) {
  if (!node) return null;

  const cat = CATEGORIES[node.category];

  const outgoing = edges
    .filter((e) => e.source === node.id)
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter(Boolean) as MapNode[];

  const incoming = edges
    .filter((e) => e.target === node.id)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter(Boolean) as MapNode[];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#111827]/95 backdrop-blur-md border-t border-white/10 p-4 animate-slideUp max-h-[50vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{node.emoji}</span>
          <div>
            <h3 className="text-white font-bold text-base">{node.label}</h3>
            <span
              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
              style={{
                background: `${cat.color}22`,
                color: cat.color,
                border: `1px solid ${cat.color}44`,
              }}
            >
              {cat.label}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 text-lg px-2"
        >
          ✕
        </button>
      </div>

      <p className="text-white/70 text-sm leading-relaxed mb-3">
        {node.description}
      </p>

      {outgoing.length > 0 && (
        <ConnectionList
          title="Kullandığı modüller"
          icon="→"
          items={outgoing}
        />
      )}
      {incoming.length > 0 && (
        <ConnectionList
          title="Onu kullanan modüller"
          icon="←"
          items={incoming}
        />
      )}
    </div>
  );
}

function ConnectionList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: MapNode[];
}) {
  return (
    <div className="mb-2">
      <p className="text-[10px] text-white/30 font-bold tracking-wider mb-1">
        {title.toUpperCase()}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((n) => (
          <span
            key={n.id}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white/5 border border-white/8 text-white/60"
          >
            <span className="text-xs">{icon}</span>
            <span>{n.emoji}</span>
            <span>{n.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
