/**
 * 右下角图例组件
 * 绿色=正常, 黄色=预警, 红色=告警, 橙色线=管道
 */
export default function Legend() {
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-[rgba(0,21,41,0.7)] backdrop-blur-md rounded-lg border border-[rgba(0,160,233,0.3)] px-4 py-3">
      <div className="text-xs text-[#00e5ff] mb-2 font-bold">状态图例</div>
      <div className="flex gap-4">
        <LegendItem color="#69f0ae" label="正常" />
        <LegendItem color="#ffd54f" label="预警" />
        <LegendItem color="#ff5252" label="告警" />
      </div>
      <div className="flex gap-4 mt-2">
        <LineLegend color="#00bcd4" label="正常管道" />
        <LineLegend color="#ffd54f" label="预警管道" />
        <LineLegend color="#ff5252" label="告警管道" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
      <span className="text-xs text-[#b0bec5]">{label}</span>
    </div>
  );
}

function LineLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-4 h-0.5 inline-block rounded" style={{ backgroundColor: color }} />
      <span className="text-xs text-[#b0bec5]">{label}</span>
    </div>
  );
}
