"use client";

interface CellPanelProps {
  variant?: "cell" | "western-blot" | "microscopy" | "flow-cytometry" | "schematic";
  color?: string;
  title?: string;
}

export default function CellPanel({ variant = "cell", color = "#6366F1", title }: CellPanelProps) {

  if (variant === "western-blot") {
    const bands = [
      { label: "KRAS", mw: "21 kDa", ctrl: [0.3, 0.35, 0.28], trt: [0.05, 0.08, 0.06] },
      { label: "p-AKT", mw: "60 kDa", ctrl: [0.4, 0.38, 0.42], trt: [0.1, 0.12, 0.09] },
      { label: "p-ERK", mw: "44 kDa", ctrl: [0.35, 0.33, 0.37], trt: [0.08, 0.11, 0.07] },
      { label: "β-Actin", mw: "42 kDa", ctrl: [0.5, 0.5, 0.5], trt: [0.5, 0.5, 0.5] },
    ];
    return (
      <div className="w-full h-full flex flex-col px-2 py-1">
        {title && <p className="text-[10px] font-semibold text-zinc-300 mb-1">{title}</p>}
        <div className="flex gap-1 mb-1 ml-16">
          {["Ctrl","Ctrl","Ctrl","Trt","Trt","Trt"].map((l,i) => (
            <div key={i} className="flex-1 text-center text-[7px] text-zinc-500">{l}</div>
          ))}
        </div>
        {bands.map((band) => (
          <div key={band.label} className="flex items-center gap-1 mb-1">
            <div className="w-10 text-right text-[7px] text-zinc-400 pr-1">{band.label}</div>
            <div className="w-6 text-[6px] text-zinc-600">{band.mw}</div>
            <div className="flex-1 h-4 bg-[#0A0E1F] rounded flex gap-0.5 items-center px-0.5">
              {band.ctrl.map((opacity, i) => (
                <div key={i} className="flex-1 h-3 rounded-sm" style={{ backgroundColor: "#CBD5E1", opacity }} />
              ))}
              <div className="w-px h-3 bg-zinc-700 mx-0.5" />
              {band.trt.map((opacity, i) => (
                <div key={i} className="flex-1 h-3 rounded-sm" style={{ backgroundColor: "#CBD5E1", opacity }} />
              ))}
            </div>
          </div>
        ))}
        <p className="text-[7px] text-zinc-600 mt-1">Representative of n=3 experiments. β-Actin loading control.</p>
      </div>
    );
  }

  if (variant === "flow-cytometry") {
    return (
      <svg viewBox="0 0 220 180" className="w-full h-full" style={{ maxHeight: 180 }}>
        {title && <text x={110} y={12} textAnchor="middle" fontSize="8" fontWeight="600" fill="#CBD5E1">{title}</text>}
        {/* Axes */}
        <line x1={30} y1={20} x2={30} y2={155} stroke="#334155" strokeWidth="1" />
        <line x1={30} y1={155} x2={205} y2={155} stroke="#334155" strokeWidth="1" />
        <text x={118} y={170} textAnchor="middle" fontSize="7" fill="#64748B">CD8 FITC</text>
        <text x={14} y={90} textAnchor="middle" fontSize="7" fill="#64748B" transform="rotate(-90,14,90)">PD-1 PE</text>
        {/* Quadrant lines */}
        <line x1={115} y1={20} x2={115} y2={155} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 2" />
        <line x1={30} y1={88} x2={205} y2={88} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 2" />
        {/* Q1 top-left: CD8-PD1+ */}
        <text x={72} y={35} textAnchor="middle" fontSize="7" fill="#F59E0B">Q1: 8.3%</text>
        {/* Q2 top-right: CD8+PD1+ exhausted */}
        <text x={160} y={35} textAnchor="middle" fontSize="7" fill="#EF4444">Q2: 34.7%</text>
        {/* Q3 bot-left */}
        <text x={72} y={148} textAnchor="middle" fontSize="7" fill="#64748B">Q3: 12.1%</text>
        {/* Q4 bot-right: CD8+PD1- */}
        <text x={160} y={148} textAnchor="middle" fontSize="7" fill="#6366F1">Q4: 44.9%</text>
        {/* Scatter dots */}
        {Array.from({ length: 180 }).map((_, i) => {
          const seed1 = Math.sin(i * 127.1) * 0.5 + 0.5;
          const seed2 = Math.cos(i * 311.7) * 0.5 + 0.5;
          let x, y;
          if (i < 80) { x = 120 + seed1 * 78; y = 95 + seed2 * 52; }
          else if (i < 115) { x = 120 + seed1 * 78; y = 25 + seed2 * 58; }
          else if (i < 138) { x = 35 + seed1 * 72; y = 25 + seed2 * 58; }
          else { x = 35 + seed1 * 72; y = 95 + seed2 * 52; }
          const color = i < 80 ? "#6366F1" : i < 115 ? "#EF4444" : i < 138 ? "#F59E0B" : "#475569";
          return <circle key={i} cx={x} cy={y} r="1.5" fill={color} fillOpacity="0.5" />;
        })}
      </svg>
    );
  }

  if (variant === "microscopy") {
    return (
      <svg viewBox="0 0 220 180" className="w-full h-full" style={{ maxHeight: 180 }}>
        {title && <text x={110} y={12} textAnchor="middle" fontSize="8" fontWeight="600" fill="#CBD5E1">{title}</text>}
        {/* Dark microscopy background */}
        <rect x={20} y={16} width={180} height={140} rx="4" fill="#050810" />
        {/* Cells */}
        {[
          { cx: 70, cy: 70, rx: 28, ry: 22, color: "#6366F1", nucleus: true },
          { cx: 140, cy: 65, rx: 24, ry: 20, color: "#8B5CF6", nucleus: true },
          { cx: 100, cy: 120, rx: 26, ry: 21, color: "#6366F1", nucleus: false },
          { cx: 170, cy: 115, rx: 20, ry: 17, color: "#EF4444", nucleus: true },
          { cx: 45, cy: 125, rx: 18, ry: 15, color: "#8B5CF6", nucleus: false },
        ].map((cell, i) => (
          <g key={i}>
            <ellipse cx={cell.cx} cy={cell.cy} rx={cell.rx} ry={cell.ry} fill={cell.color} fillOpacity="0.15" stroke={cell.color} strokeWidth="0.8" strokeOpacity="0.5" />
            {cell.nucleus && (
              <ellipse cx={cell.cx} cy={cell.cy} rx={cell.rx * 0.45} ry={cell.ry * 0.45} fill={cell.color} fillOpacity="0.5" />
            )}
          </g>
        ))}
        {/* Scale bar */}
        <line x1={155} y1={148} x2={185} y2={148} stroke="white" strokeWidth="1.5" />
        <text x={170} y={156} textAnchor="middle" fontSize="6" fill="#94A3B8">10 μm</text>
        {/* Channel labels */}
        <text x={25} y={30} fontSize="7" fill="#6366F1">DAPI</text>
        <text x={55} y={30} fontSize="7" fill="#8B5CF6">Ki-67</text>
        <text x={88} y={30} fontSize="7" fill="#EF4444">γH2AX</text>
      </svg>
    );
  }

  if (variant === "schematic") {
    return (
      <svg viewBox="0 0 240 190" className="w-full h-full" style={{ maxHeight: 190 }}>
        {title && <text x={120} y={12} textAnchor="middle" fontSize="8" fontWeight="600" fill="#CBD5E1">{title}</text>}
        {/* Cell membrane */}
        <ellipse cx={120} cy={105} rx={100} ry={75} fill={`${color}08`} stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="4 2" />
        <text x={20} y={70} fontSize="7" fill="#475569">Plasma</text>
        <text x={20} y={79} fontSize="7" fill="#475569">membrane</text>
        {/* Nucleus */}
        <ellipse cx={120} cy={115} rx={40} ry={30} fill="#6366F108" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 2" />
        <text x={120} y={112} textAnchor="middle" fontSize="7" fill="#818CF8">Nucleus</text>
        <text x={120} y={121} textAnchor="middle" fontSize="7" fill="#6366F1">TF binding</text>
        {/* Receptor */}
        <rect x={58} y={42} width={30} height={18} rx="4" fill={`${color}30`} stroke={color} strokeWidth="1" />
        <text x={73} y={54} textAnchor="middle" fontSize="7" fill="#CBD5E1">Receptor</text>
        {/* Ligand */}
        <circle cx={73} cy={28} r={9} fill="#06B6D430" stroke="#06B6D4" strokeWidth="1" />
        <text x={73} y={31} textAnchor="middle" fontSize="7" fill="#67E8F9">Ligand</text>
        <line x1={73} y1={37} x2={73} y2={42} stroke="#06B6D4" strokeWidth="1" strokeDasharray="2 1" />
        {/* Kinase cascade */}
        <rect x={82} y={70} width={34} height={16} rx="3" fill={`${color}25`} stroke={color} strokeWidth="0.8" />
        <text x={99} y={81} textAnchor="middle" fontSize="7" fill="#CBD5E1">p-Kinase</text>
        <line x1={80} y1={60} x2={92} y2={70} stroke={color} strokeWidth="1" markerEnd="url(#arr)" />
        <rect x={145} y={70} width={36} height={16} rx="3" fill="#8B5CF625" stroke="#8B5CF6" strokeWidth="0.8" />
        <text x={163} y={81} textAnchor="middle" fontSize="7" fill="#CBD5E1">Adaptor</text>
        <line x1={116} y1={78} x2={145} y2={78} stroke={color} strokeWidth="1" strokeDasharray="2 1" />
        <line x1={163} y1={86} x2={140} y2={100} stroke="#8B5CF6" strokeWidth="1" />
        <text x={163} y={108} textAnchor="middle" fontSize="6" fill="#94A3B8">mRNA↑</text>
        <text x={120} y={175} textAnchor="middle" fontSize="7" fill="#475569">Cell Signaling Schematic</text>
      </svg>
    );
  }

  // default: cell diagram
  return (
    <svg viewBox="0 0 240 190" className="w-full h-full" style={{ maxHeight: 190 }}>
      {title && <text x={120} y={12} textAnchor="middle" fontSize="8" fontWeight="600" fill="#CBD5E1">{title}</text>}
      <ellipse cx={120} cy={105} rx={95} ry={72} fill={`${color}08`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      <ellipse cx={120} cy={115} rx={32} ry={25} fill="#6366F115" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.5" />
      <text x={120} y={112} textAnchor="middle" fontSize="8" fill="#818CF8">Nucleus</text>
      <text x={120} y={122} textAnchor="middle" fontSize="7" fill="#6366F1">DNA</text>
      {/* Mitochondria */}
      <ellipse cx={72} cy={88} rx={18} ry={10} fill="#10B98115" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.6" />
      <text x={72} y={91} textAnchor="middle" fontSize="6" fill="#6EE7B7">Mito</text>
      {/* Ribosomes */}
      {[[155,82],[162,95],[170,86],[158,105]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#F59E0B40" stroke="#F59E0B" strokeWidth="0.6" />
      ))}
      <text x={165} y={118} textAnchor="middle" fontSize="6" fill="#FCD34D">Ribosomes</text>
      {/* ER */}
      <path d="M 88 138 Q 105 128 120 138 Q 135 148 152 138" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.6" />
      <text x={120} y={155} textAnchor="middle" fontSize="6" fill="#A78BFA">ER</text>
      {/* Membrane proteins */}
      {[30,70,110,150,190,210].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 120 + 95 * Math.cos(rad);
        const y = 105 + 72 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="4" fill={`${color}40`} stroke={color} strokeWidth="0.8" />;
      })}
      <text x={120} y={185} textAnchor="middle" fontSize="7" fill="#475569">Eukaryotic Cell</text>
    </svg>
  );
}
