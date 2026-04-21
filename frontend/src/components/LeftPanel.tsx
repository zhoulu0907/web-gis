import { useSensorStore } from '../store/sensorStore';
import { Activity, AlertTriangle, Droplets, Radio } from 'lucide-react';

/** 深蓝科技风格面板通用样式 */
const panelCls = 'bg-[rgba(0,21,41,0.7)] backdrop-blur-md rounded-lg border border-[rgba(0,160,233,0.3)] p-4';

/**
 * 左侧统计面板
 * 显示站点总数、泵站数、阀室数、实时告警数
 */
export default function LeftPanel() {
  const stations = useSensorStore((s) => s.stations);
  const latestData = useSensorStore((s) => s.latestData);

  if (!stations) return null;

  const features = stations.features;
  const totalCount = features.length;
  const pumpCount = features.filter((f) => f.properties?.type === 'pump').length;
  const valveCount = features.filter((f) => f.properties?.type === 'valve').length;
  const alarmCount = Array.from(latestData.values()).filter((d) => d.status === 2).length;
  const warnCount = Array.from(latestData.values()).filter((d) => d.status === 1).length;

  return (
    <div className="absolute top-4 left-4 z-10 w-56 space-y-3">
      <div className={panelCls}>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-[#00e5ff]" />
          <span className="text-sm font-bold text-[#00e5ff]">实时监控</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="站点总数" value={totalCount} color="text-white" />
          <StatItem label="泵站" value={pumpCount} color="text-[#4fc3f7]" />
          <StatItem label="阀室" value={valveCount} color="text-[#ce93d8]" />
          <StatItem label="在线率" value="100%" color="text-[#69f0ae]" />
        </div>
      </div>

      <div className={panelCls}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-[#ffd54f]" />
          <span className="text-sm font-bold text-[#ffd54f]">告警统计</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="预警" value={warnCount} color="text-[#ffd54f]" icon={<Droplets size={12} />} />
          <StatItem label="告警" value={alarmCount} color="text-[#ff5252]" icon={<Radio size={12} />} />
        </div>
      </div>

      <div className={panelCls}>
        <div className="flex items-center gap-2 mb-2">
          <Droplets size={16} className="text-[#ffab40]" />
          <span className="text-sm font-bold text-[#ffab40]">管道信息</span>
        </div>
        <div className="text-xs text-[#8ea4b8] space-y-1">
          <div className="flex justify-between">
            <span>管线名称</span>
            <span className="text-white">浦东新区输油管线</span>
          </div>
          <div className="flex justify-between">
            <span>站点数</span>
            <span className="text-white">{totalCount} 个</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color, icon }: {
  label: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color} flex items-center justify-center gap-1`}>
        {icon}
        {value}
      </div>
      <div className="text-xs text-[#8ea4b8] mt-1">{label}</div>
    </div>
  );
}
