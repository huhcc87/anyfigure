"use client";

interface PathwayPanelProps {
  variant?: "signaling" | "crispr" | "immune" | "metabolic" | "generic";
  color?: string;
}

const Arrow = ({ x1, y1, x2, y2, color = "#6366F1" }: { x1: number; y1: number; x2: number; y2: number; color?: string }) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const tip = { x: x2, y: y2 };
  const b1 = { x: x2 - ux * 8 + px * 4, y: y2 - uy * 8 + py * 4 };
  const b2 = { x: x2 - ux * 8 - px * 4, y: y2 - uy * 8 - py * 4 };
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - ux * 6} y2={y2 - uy * 6} stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
      <polygon points={`${tip.x},${tip.y} ${b1.x},${b1.y} ${b2.x},${b2.y}`} fill={color} fillOpacity="0.8" />
    </g>
  );
};

const Node = ({ x, y, w = 70, h = 26, label, sub, color = "#6366F1", active = false }: {
  x: number; y: number; w?: number; h?: number; label: string; sub?: string; color?: string; active?: boolean;
}) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="5" fill={active ? color : `${color}25`} stroke={color} strokeWidth="1.2" strokeOpacity="0.6" />
    <text x={x} y={y + (sub ? -3 : 4)} textAnchor="middle" fontSize="9" fontWeight="600" fill={active ? "white" : "#CBD5E1"}>{label}</text>
    {sub && <text x={x} y={y + 8} textAnchor="middle" fontSize="7" fill="#64748B">{sub}</text>}
  </g>
);

const InhibitArrow = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 2" strokeOpacity="0.7" />
    <line x1={x2 - 5} y1={y2 - 5} x2={x2 + 5} y2={y2 + 5} stroke="#EF4444" strokeWidth="2" strokeOpacity="0.8" />
    <line x1={x2 + 5} y1={y2 - 5} x2={x2 - 5} y2={y2 + 5} stroke="#EF4444" strokeWidth="2" strokeOpacity="0.8" />
  </g>
);

export default function PathwayPanel({ variant = "signaling", color = "#6366F1" }: PathwayPanelProps) {
  if (variant === "crispr") {
    return (
      <svg viewBox="0 0 280 200" className="w-full h-full" style={{ maxHeight: 200 }}>
        {/* Guide RNA */}
        <Node x={60} y={30} label="sgRNA" sub="20nt guide" color="#06B6D4" />
        {/* Cas9 */}
        <Node x={140} y={30} w={60} label="Cas9" sub="SpCas9" color={color} active />
        {/* Complex */}
        <Node x={200} y={30} label="RNP" sub="complex" color="#8B5CF6" />
        <Arrow x1={90} y1={30} x2={112} y2={30} color="#06B6D4" />
        <Arrow x1={168} y1={30} x2={178} y2={30} color={color} />
        {/* DNA */}
        <rect x={60} y={85} width={160} height={14} rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <rect x={60} y={101} width={160} height={14} rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1" />
        <text x={140} y={96} textAnchor="middle" fontSize="8" fill="#64748B">5'————PAM————3'</text>
        <text x={140} y={112} textAnchor="middle" fontSize="8" fill="#64748B">3'——————————5'</text>
        {/* Cut */}
        <Arrow x1={140} y1={48} x2={140} y2={82} color={color} />
        <line x1={112} y1={90} x2={112} y2={108} stroke="#EF4444" strokeWidth="2" strokeDasharray="2 1" />
        <text x={104} y={120} fontSize="7" fill="#EF4444" textAnchor="middle">DSB</text>
        {/* Repair paths */}
        <Node x={80} y={165} w={65} label="NHEJ" sub="Indels" color="#F59E0B" />
        <Node x={190} y={165} w={65} label="HDR" sub="Precise edit" color="#10B981" />
        <Arrow x1={100} y1={118} x2={82} y2={148} color="#F59E0B" />
        <Arrow x1={130} y1={118} x2={188} y2={148} color="#10B981" />
        <text x={140} y={190} textAnchor="middle" fontSize="7" fill="#475569">DSB = Double-strand break</text>
      </svg>
    );
  }

  if (variant === "immune") {
    return (
      <svg viewBox="0 0 280 200" className="w-full h-full" style={{ maxHeight: 200 }}>
        {/* Tumor cell */}
        <ellipse cx={200} cy={110} rx={45} ry={38} fill="#EF444415" stroke="#EF4444" strokeWidth="1.2" strokeOpacity="0.5" />
        <text x={200} y={107} textAnchor="middle" fontSize="9" fill="#EF4444">Tumor</text>
        <text x={200} y={118} textAnchor="middle" fontSize="7" fill="#94A3B8">PD-L1+</text>
        {/* T cell */}
        <circle cx={75} cy={110} r={28} fill="#6366F115" stroke="#6366F1" strokeWidth="1.2" strokeOpacity="0.6" />
        <text x={75} y={107} textAnchor="middle" fontSize="9" fill="#818CF8">CD8+</text>
        <text x={75} y={118} textAnchor="middle" fontSize="7" fill="#94A3B8">T cell</text>
        {/* PD1-PDL1 axis */}
        <Node x={140} y={68} w={52} h={22} label="PD-1" color="#F59E0B" />
        <Node x={140} y={150} w={52} h={22} label="PD-L1" color="#EF4444" />
        <Arrow x1={100} y1={82} x2={116} y2={72} color="#F59E0B" />
        <Arrow x1={165} y1={138} x2={170} y2={125} color="#EF4444" />
        <line x1={140} y1={79} x2={140} y2={139} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" />
        <text x={152} y={112} fontSize="7" fill="#64748B" textAnchor="middle">binding</text>
        {/* Anti-PD1 */}
        <Node x={60} y={35} w={68} h={22} label="Anti-PD-1" sub="nivolumab" color="#10B981" />
        <InhibitArrow x1={80} y1={46} x2={128} y2={62} />
        {/* Perforin/Granzyme */}
        <Node x={140} y={192} w={75} h={16} label="Perforin/GzmB" color="#8B5CF6" />
        <Arrow x1={100} y1={130} x2={120} y2={182} color="#8B5CF6" />
        <text x={140} y={10} textAnchor="middle" fontSize="8" fontWeight="700" fill="#CBD5E1">Immune Checkpoint Axis</text>
      </svg>
    );
  }

  if (variant === "metabolic") {
    return (
      <svg viewBox="0 0 280 200" className="w-full h-full" style={{ maxHeight: 200 }}>
        <text x={140} y={14} textAnchor="middle" fontSize="8" fontWeight="700" fill="#CBD5E1">PI3K / AKT / mTOR Pathway</text>
        <Node x={140} y={35} w={60} label="RTK" sub="EGF/IGF-1R" color="#06B6D4" active />
        <Arrow x1={140} y1={48} x2={140} y2={63} color="#06B6D4" />
        <Node x={140} y={76} label="PI3K" color={color} />
        <InhibitArrow x1={218} y1={76} x2={168} y2={76} />
        <Node x={230} y={76} w={50} label="PTEN" color="#EF4444" />
        <Arrow x1={140} y1={89} x2={140} y2={103} color={color} />
        <Node x={140} y={116} label="PIP3" color={color} />
        <Arrow x1={140} y1={129} x2={140} y2={143} color={color} />
        <Node x={140} y={156} label="AKT" sub="p-Ser473" color="#8B5CF6" active />
        <Arrow x1={165} y1={156} x2={195} y2={156} color="#8B5CF6" />
        <Node x={220} y={156} w={48} label="mTORC1" color="#F59E0B" active />
        <Arrow x1={220} y1={167} x2={220} y2={182} color="#F59E0B" />
        <Node x={220} y={192} w={56} h={16} label="S6K / 4EBP1" color="#10B981" />
        <Arrow x1={115} y1={156} x2={70} y2={156} color="#8B5CF6" />
        <Node x={46} y={156} w={46} label="FOXO" color="#EC4899" />
        <text x={46} y={175} textAnchor="middle" fontSize="7" fill="#64748B">Apoptosis↓</text>
        <Node x={46} y={116} w={52} h={18} label="Alpelisib" color="#10B981" />
        <InhibitArrow x1={60} y1={109} x2={115} y2={80} />
      </svg>
    );
  }

  if (variant === "generic") {
    return (
      <svg viewBox="0 0 280 200" className="w-full h-full" style={{ maxHeight: 200 }}>
        <Node x={140} y={28} w={80} label="Signal Input" color="#06B6D4" active />
        <Arrow x1={140} y1={41} x2={140} y2={58} color="#06B6D4" />
        <Node x={80} y={80} w={65} label="Receptor A" color={color} />
        <Node x={200} y={80} w={65} label="Receptor B" color="#8B5CF6" />
        <Arrow x1={120} y1={41} x2={88} y2={68} color="#06B6D4" />
        <Arrow x1={160} y1={41} x2={192} y2={68} color="#06B6D4" />
        <Arrow x1={80} y1={93} x2={80} y2={113} color={color} />
        <Arrow x1={200} y1={93} x2={200} y2={113} color="#8B5CF6" />
        <Node x={80} y={126} w={65} label="Kinase A" color={color} active />
        <Node x={200} y={126} w={65} label="Kinase B" color="#8B5CF6" active />
        <Arrow x1={113} y1={126} x2={167} y2={126} color="#F59E0B" />
        <text x={140} y={122} textAnchor="middle" fontSize="7" fill="#F59E0B">crosstalk</text>
        <Arrow x1={140} y1={133} x2={140} y2={153} color="#F59E0B" />
        <Node x={140} y={166} w={80} label="TF / Effector" color="#10B981" active />
        <Arrow x1={140} y1={179} x2={140} y2={192} color="#10B981" />
        <text x={140} y={200} textAnchor="middle" fontSize="8" fill="#10B981">Gene expression</text>
      </svg>
    );
  }

  // default: signaling
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full" style={{ maxHeight: 200 }}>
      <text x={140} y={14} textAnchor="middle" fontSize="8" fontWeight="700" fill="#CBD5E1">MAPK / ERK Signaling</text>
      <Node x={140} y={35} w={70} label="Growth Factor" sub="EGF/FGF" color="#06B6D4" active />
      <Arrow x1={140} y1={48} x2={140} y2={63} color="#06B6D4" />
      <Node x={140} y={76} w={55} label="RAS" sub="GTP-bound" color={color} active />
      <InhibitArrow x1={220} y1={76} x2={167} y2={76} />
      <Node x={240} y={76} w={40} label="GAP" color="#EF4444" />
      <Arrow x1={140} y1={89} x2={140} y2={103} color={color} />
      <Node x={140} y={116} label="RAF" color={color} />
      <Arrow x1={140} y1={129} x2={140} y2={143} color={color} />
      <Node x={140} y={156} label="MEK1/2" color="#8B5CF6" active />
      <Arrow x1={140} y1={169} x2={140} y2={183} color="#8B5CF6" />
      <Node x={140} y={193} w={55} h={16} label="ERK1/2→nucleus" color="#10B981" active />
      <Node x={35} y={156} w={50} label="Trametinib" color="#10B981" />
      <InhibitArrow x1={58} y1={150} x2={114} y2={156} />
      <Node x={245} y={156} w={42} label="RSK/MNK" color="#F59E0B" />
      <Arrow x1={165} y1={156} x2={224} y2={156} color="#8B5CF6" />
    </svg>
  );
}
