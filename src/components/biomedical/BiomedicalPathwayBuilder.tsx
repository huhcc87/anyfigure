"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { PathwayTemplate } from "@/data/biomedicalPathwayTemplates";
import { BIOMEDICAL_PATHWAY_TEMPLATES } from "@/data/biomedicalPathwayTemplates";

interface BiomedicalPathwayBuilderProps {
  onInsertPathway?: (template: PathwayTemplate) => void;
}

function templateToFlow(template: PathwayTemplate): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = template.nodes.map((n, i) => ({
    id: n.id,
    data: { label: `${n.emoji ?? ""} ${n.label}`.trim() },
    position: { x: 40 + (i % 3) * 160, y: 40 + Math.floor(i / 3) * 100 },
    style: {
      background: "#1e293b",
      border: "1px solid rgba(99,102,241,0.4)",
      color: "#e2e8f0",
      fontSize: 11,
      borderRadius: 8,
      padding: "8px 12px",
    },
  }));
  const edges: Edge[] = template.edges.map((e, i) => ({
    id: `e-${template.id}-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: "#6366f1" },
    labelStyle: { fill: "#94a3b8", fontSize: 10 },
  }));
  return { nodes, edges };
}

function PathwayFlow({ template }: { template: PathwayTemplate }) {
  const flow = useMemo(() => templateToFlow(template), [template]);
  const [nodes, , onNodesChange] = useNodesState(flow.nodes);
  const [edges, , onEdgesChange] = useEdgesState(flow.edges);

  return (
    <ReactFlow
      key={template.id}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#334155" gap={16} />
      <Controls className="!bg-[#0F1629] !border-white/10" />
      <MiniMap className="!bg-[#0F1629]" nodeColor="#6366f1" />
    </ReactFlow>
  );
}

export default function BiomedicalPathwayBuilder({ onInsertPathway }: BiomedicalPathwayBuilderProps) {
  const [activeTemplate, setActiveTemplate] = useState(BIOMEDICAL_PATHWAY_TEMPLATES[0]);

  return (
    <div className="flex flex-col h-full min-h-[320px]">
      <div className="p-2 border-b border-white/10 flex gap-1 overflow-x-auto flex-shrink-0">
        {BIOMEDICAL_PATHWAY_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTemplate(t)}
            className={`px-2 py-1 rounded text-[10px] whitespace-nowrap flex-shrink-0 ${
              activeTemplate.id === t.id
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "bg-white/5 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-500 px-2 py-1">{activeTemplate.description}</p>
      <div className="flex-1 min-h-[240px]">
        <PathwayFlow template={activeTemplate} />
      </div>
      {onInsertPathway && (
        <button
          type="button"
          onClick={() => onInsertPathway(activeTemplate)}
          className="m-2 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Add pathway nodes to canvas
        </button>
      )}
    </div>
  );
}
