"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell,
  ReferenceLine,
} from "recharts";

type ChartVariant = "bar" | "line" | "scatter" | "pie" | "volcano" | "survival" | "heatmap";

interface ChartPanelProps {
  variant?: ChartVariant;
  title?: string;
  color?: string;
  height?: number;
}

const COLORS = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

// Deterministic mock data generators
function barData(color: string) {
  const groups = ["Ctrl", "siRNA", "Drug A", "Drug B", "Combo"];
  return groups.map((name, i) => ({
    name,
    value: [100, 48, 62, 71, 18][i],
    sem: [6, 5, 4, 6, 3][i],
    sig: ["ns", "**", "*", "**", "***"][i],
    fill: i === 0 ? "#475569" : color,
  }));
}

function lineData() {
  return [0, 7, 14, 21, 28, 35, 42].map((day, i) => ({
    day,
    treated: [100, 92, 81, 66, 52, 41, 33][i],
    control: [100, 99, 97, 95, 93, 91, 88][i],
  }));
}

function volcanoData() {
  const points = [];
  const genes = ["KRAS","TP53","MUC4","EGFR","PD-L1","BRCA1","MYC","VEGF","IL-6","TNF"];
  for (let i = 0; i < 200; i++) {
    const fc = (Math.sin(i * 47.3) * 3.5);
    const pval = Math.abs(Math.cos(i * 13.7)) * 4;
    points.push({ x: fc, y: pval, sig: Math.abs(fc) > 1.5 && pval > 1.3, name: i < 10 ? genes[i] : "" });
  }
  return points;
}

function pieData() {
  return [
    { name: "CD8+ T cells", value: 28 },
    { name: "Treg", value: 15 },
    { name: "MDSC", value: 22 },
    { name: "NK cells", value: 12 },
    { name: "Macrophages", value: 23 },
  ];
}

function heatmapData() {
  const genes = ["KRAS","TP53","EGFR","MUC4","PD-L1","CTLA4","MYC","BRCA1"];
  const samples = ["S1","S2","S3","S4","S5","S6"];
  return genes.map((gene, gi) =>
    samples.map((s, si) => {
      const val = Math.sin(gi * 1.3 + si * 0.9) * 2;
      return { gene, sample: s, value: val };
    })
  ).flat();
}

function getColor(val: number) {
  if (val > 1.5) return "#EF4444";
  if (val > 0.5) return "#F97316";
  if (val > -0.5) return "#94A3B8";
  if (val > -1.5) return "#60A5FA";
  return "#3B82F6";
}

export default function ChartPanel({ variant = "bar", title, color = "#6366F1", height = 200 }: ChartPanelProps) {
  if (variant === "bar") {
    const data = barData(color);
    return (
      <div className="w-full h-full flex flex-col">
        {title && <p className="text-[10px] font-semibold text-zinc-300 mb-1 px-1">{title}</p>}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 18, right: 8, bottom: 20, left: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false}
              label={{ value: "% Relative expression", angle: -90, position: "insideLeft", dx: -4, style: { fontSize: 7, fill: "#64748B" } }} />
            <Tooltip
              contentStyle={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 10 }}
              formatter={(v) => [`${v ?? 0}%`, "Value"]}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={28}
              label={{ position: "top", content: (props) => {
                const { x, y, width, index } = props as { x: number; y: number; width: number; index: number };
                const sig = data[index]?.sig;
                if (!sig || sig === "ns") return null;
                return <text x={(x as number) + (width as number) / 2} y={(y as number) - 3} textAnchor="middle" fontSize={8} fill="#F59E0B" fontWeight="bold">{sig}</text>;
              }}}
            >
              {data.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-3 mt-0.5">
          <span className="text-[7px] text-zinc-600">n=3, mean ± SEM</span>
          <span className="text-[7px] text-amber-400/80">* p&lt;0.05  ** p&lt;0.01  *** p&lt;0.001</span>
        </div>
      </div>
    );
  }

  if (variant === "survival" || variant === "line") {
    const data = lineData();
    return (
      <div className="w-full h-full flex flex-col">
        {title && <p className="text-[10px] font-semibold text-zinc-300 mb-1 px-1">{title}</p>}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 16, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} label={{ value: "Days", position: "insideBottom", offset: -8, style: { fontSize: 8, fill: "#64748B" } }} />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} label={{ value: "Survival %", angle: -90, position: "insideLeft", style: { fontSize: 8, fill: "#64748B" } }} />
            <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 10 }} />
            <Line type="stepAfter" dataKey="treated" stroke={color} strokeWidth={2} dot={false} name="Treated" />
            <Line type="stepAfter" dataKey="control" stroke="#475569" strokeWidth={2} dot={false} name="Control" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-1">
          <span className="text-[8px] text-zinc-400 flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: color }} />Treated</span>
          <span className="text-[8px] text-zinc-500 flex items-center gap-1"><span className="w-3 h-0.5 inline-block bg-zinc-500" />Control</span>
        </div>
      </div>
    );
  }

  if (variant === "volcano") {
    const data = volcanoData();
    return (
      <div className="w-full h-full flex flex-col">
        {title && <p className="text-[10px] font-semibold text-zinc-300 mb-1 px-1">{title}</p>}
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 4, right: 8, bottom: 16, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" dataKey="x" tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[-4, 4]} label={{ value: "log₂FC", position: "insideBottom", offset: -8, style: { fontSize: 8, fill: "#64748B" } }} />
            <YAxis type="number" dataKey="y" tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false} label={{ value: "-log₁₀(p)", angle: -90, position: "insideLeft", style: { fontSize: 8, fill: "#64748B" } }} />
            <ReferenceLine x={1.5} stroke="rgba(239,68,68,0.3)" strokeDasharray="3 3" />
            <ReferenceLine x={-1.5} stroke="rgba(59,130,246,0.3)" strokeDasharray="3 3" />
            <ReferenceLine y={1.3} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
            <Scatter
              data={data}
              fill="#475569"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.sig ? (entry.x > 0 ? "#EF4444" : "#6366F1") : "#334155"} opacity={entry.sig ? 0.9 : 0.4} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-1">
          <span className="text-[8px] text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block bg-red-500" />Up-regulated</span>
          <span className="text-[8px] text-indigo-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block bg-indigo-500" />Down-regulated</span>
        </div>
      </div>
    );
  }

  if (variant === "pie") {
    const data = pieData();
    return (
      <div className="w-full h-full flex flex-col">
        {title && <p className="text-[10px] font-semibold text-zinc-300 mb-1 px-1">{title}</p>}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="35%" outerRadius="65%" paddingAngle={2} dataKey="value" label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={8}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {data.map((d, i) => (
            <span key={i} className="text-[8px] text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{d.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "heatmap") {
    const data = heatmapData();
    const genes = [...new Set(data.map((d) => d.gene))];
    const samples = [...new Set(data.map((d) => d.sample))];
    return (
      <div className="w-full h-full flex flex-col">
        {title && <p className="text-[10px] font-semibold text-zinc-300 mb-1 px-1">{title}</p>}
        <div className="flex-1 flex flex-col gap-0.5 px-1">
          <div className="flex gap-0.5 mb-0.5 ml-10">
            {samples.map(s => <div key={s} className="flex-1 text-center text-[7px] text-zinc-500">{s}</div>)}
          </div>
          {genes.map((gene) => (
            <div key={gene} className="flex items-center gap-0.5">
              <div className="w-9 text-right text-[7px] text-zinc-500 pr-1 truncate">{gene}</div>
              {samples.map((s) => {
                const val = data.find((d) => d.gene === gene && d.sample === s)?.value ?? 0;
                return (
                  <div
                    key={s}
                    className="flex-1 rounded-sm"
                    style={{ height: 14, backgroundColor: getColor(val), opacity: 0.85 }}
                    title={`${gene}/${s}: ${val.toFixed(2)}`}
                  />
                );
              })}
            </div>
          ))}
          <div className="flex items-center gap-1 mt-1.5 justify-center">
            {[-2,-1,0,1,2].map(v => (
              <div key={v} className="flex flex-col items-center gap-0.5">
                <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: getColor(v) }} />
                <span className="text-[6px] text-zinc-600">{v}</span>
              </div>
            ))}
            <span className="text-[7px] text-zinc-600 ml-1">log₂FC</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
