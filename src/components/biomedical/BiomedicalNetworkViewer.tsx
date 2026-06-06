"use client";

import { useEffect, useRef, useState } from "react";
import { BIOMEDICAL_NETWORK_TEMPLATES } from "@/data/biomedicalNetworkTemplates";

export default function BiomedicalNetworkViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<{ destroy: () => void } | null>(null);
  const [active, setActive] = useState(BIOMEDICAL_NETWORK_TEMPLATES[0]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!containerRef.current) return;
      const cytoscape = (await import("cytoscape")).default;

      cyRef.current?.destroy();

      if (cancelled) return;

      const elements = [
        ...active.nodes.map((n) => ({ data: { id: n.id, label: n.label } })),
        ...active.edges.map((e, i) => ({
          data: { id: `e-${i}`, source: e.source, target: e.target, label: e.label ?? "" },
        })),
      ];

      cyRef.current = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              "background-color": "#6366f1",
              color: "#e2e8f0",
              "font-size": 10,
              "text-valign": "center",
              width: 48,
              height: 48,
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#475569",
              "target-arrow-color": "#475569",
              "target-arrow-shape": "triangle",
              label: "data(label)",
              "font-size": 8,
              color: "#94a3b8",
              "curve-style": "bezier",
            },
          },
        ],
        layout: { name: "circle", padding: 24 },
      });
    })();

    return () => {
      cancelled = true;
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, [active]);

  return (
    <div className="flex flex-col h-full min-h-[320px]">
      <div className="p-2 border-b border-white/10 flex gap-1 overflow-x-auto flex-shrink-0">
        {BIOMEDICAL_NETWORK_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t)}
            className={`px-2 py-1 rounded text-[10px] whitespace-nowrap flex-shrink-0 ${
              active.id === t.id
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-white/5 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.name.split(" ")[0]}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-500 px-2 py-1">{active.description}</p>
      <div ref={containerRef} className="flex-1 min-h-[260px] w-full bg-[#0C1120]" />
    </div>
  );
}
