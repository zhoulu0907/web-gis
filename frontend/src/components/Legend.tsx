/**
 * 右下角图例组件
 * 绿色=正常, 黄色=预警, 红色=告警
 */
export default function Legend() {
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-lg border border-cyan-500/20 px-4 py-3">
      <div className="text-xs text-gray-400 mb-2 font-bold">状态图例</div>
      <div className="flex gap-4">
        <LegendItem color="#22c55e" label="正常" />
        <LegendItem color="#eab308" label="预警" />
        <LegendItem color="#ef4444" label="告警" />
      </div>
      <div className="flex gap-4 mt-2">
        <LineLegend color="#f59e0b" label="管道" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-300">{label}</span>
    </div>
  );
}

function LineLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-4 h-0.5 inline-block rounded"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-300">{label}</span>
    </div>
  );
}
