import { useSensorStore } from '../store/sensorStore';
import { Activity, AlertTriangle, Droplets, Radio } from 'lucide-react';

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
      {/* 面板标题 */}
      <div className="bg-black/60 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-cyan-400" />
          <span className="text-sm font-bold text-cyan-400">实时监控</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatItem label="站点总数" value={totalCount} color="text-white" />
          <StatItem label="泵站" value={pumpCount} color="text-blue-400" />
          <StatItem label="阀室" value={valveCount} color="text-purple-400" />
          <StatItem label="在线率" value="100%" color="text-green-400" />
        </div>
      </div>

      {/* 告警统计 */}
      <div className="bg-black/60 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">告警统计</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="预警" value={warnCount} color="text-yellow-400" icon={<Droplets size={12} />} />
          <StatItem label="告警" value={alarmCount} color="text-red-400" icon={<Radio size={12} />} />
        </div>
      </div>

      {/* 管道信息 */}
      <div className="bg-black/60 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Droplets size={16} className="text-amber-400" />
          <span className="text-sm font-bold text-amber-400">管道信息</span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
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
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
