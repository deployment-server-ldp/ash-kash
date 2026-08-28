export function SalesTrendChart({ data }: { data: { date: string; total: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.total), 1);
  const width = 800;
  const height = 200;
  const step = width / Math.max(1, data.length - 1);

  const points = data.map((d, i) => `${i * step},${height - (d.total / max) * (height - 20)}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full min-w-[500px]" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#a97a3b" strokeWidth={2} />
        <polygon points={`0,${height} ${points} ${width},${height}`} fill="#a97a3b" opacity={0.08} />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-noir/40">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
