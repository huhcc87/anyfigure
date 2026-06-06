"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const QUICK_PDB = [
  { id: "4OO8", label: "Cas9" },
  { id: "3THY", label: "MSH2" },
  { id: "3THX", label: "MSH3" },
  { id: "3THR", label: "MLH1" },
  { id: "4PMS", label: "PMS2" },
];

interface MolecularViewerProps {
  initialPdbId?: string;
}

export default function MolecularViewer({ initialPdbId = "4OO8" }: MolecularViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ removeAllModels: () => void; addModel: (url: string, format: string) => unknown; setStyle: (style: object, sel?: object) => void; zoomTo: () => void; render: () => void } | null>(null);
  const [pdbId, setPdbId] = useState(initialPdbId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPdb = useCallback(async (id: string) => {
    if (!containerRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const mod = await import("3dmol");
      const $3Dmol = mod.default ?? mod;
      if (!viewerRef.current) {
        viewerRef.current = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#0C1120",
        });
      }
      const viewer = viewerRef.current;
      viewer.removeAllModels();
      const url = `https://files.rcsb.org/download/${id.toUpperCase()}.pdb`;
      viewer.addModel(url, "pdb");
      viewer.setStyle({}, { cartoon: { color: "spectrum" } });
      viewer.zoomTo();
      viewer.render();
    } catch (err) {
      setError(`Failed to load PDB ${id}: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!containerRef.current) return;
      try {
        const mod = await import("3dmol");
        if (cancelled) return;
        setLoading(true);
        setError(null);
        const $3Dmol = mod.default ?? mod;
        if (!viewerRef.current) {
          viewerRef.current = $3Dmol.createViewer(containerRef.current, {
            backgroundColor: "#0C1120",
          });
        }
        const viewer = viewerRef.current;
        viewer.removeAllModels();
        const url = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`;
        viewer.addModel(url, "pdb");
        viewer.setStyle({}, { cartoon: { color: "spectrum" } });
        viewer.zoomTo();
        viewer.render();
      } catch (err) {
        if (!cancelled) setError(`Failed to load PDB ${pdbId}: ${String(err)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdbId]);

  return (
    <div className="flex flex-col h-full min-h-[320px]">
      <div className="p-2 border-b border-white/10 flex flex-wrap gap-1 items-center">
        <input
          type="text"
          value={pdbId}
          onChange={(e) => setPdbId(e.target.value.toUpperCase())}
          placeholder="PDB ID"
          className="w-20 bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1 outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => void loadPdb(pdbId)}
          className="px-2 py-1 text-[10px] rounded bg-indigo-600 text-white"
        >
          Load
        </button>
        {QUICK_PDB.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPdbId(p.id)}
            className="px-2 py-1 text-[10px] rounded bg-white/5 text-zinc-400 hover:text-white"
          >
            {p.label}
          </button>
        ))}
      </div>
      {loading && <p className="text-[10px] text-zinc-500 px-2 py-1">Loading structure…</p>}
      {error && <p className="text-[10px] text-red-400 px-2 py-1">{error}</p>}
      <div ref={containerRef} className="flex-1 min-h-[260px] relative w-full" style={{ height: 280 }} />
    </div>
  );
}
