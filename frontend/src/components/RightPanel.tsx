import { useSensorStore } from '../store/sensorStore';
import { AlertTriangle } from 'lucide-react';

/**
 * 右侧告警日志面板
 * 实时滚动显示最近 10 条告警/预警信息
 */
export default function RightPanel() {
  const alarmLogs = useSensorStore((s) => s.alarmLogs);

  return (
    <div className="absolute top-4 right-4 z-10 w-72 bg-black/60 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-red-400" />
        <span className="text-sm font-bold text-red-400">实时告警</span>
        {alarmLogs.length > 0 && (
          <span className="ml-auto bg-red-500/30 text-red-400 text-xs px-2 py-0.5 rounded-full">
            {alarmLogs.length}
          </span>
        )}
      </div>

      {alarmLogs.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-4">暂无告警</div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {alarmLogs.map((log, index) => (
            <div
              key={`${log.stationId}-${log.timestamp}-${index}`}
              className={`rounded px-3 py-2 text-xs border ${
                log.status === 2
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold ${log.status === 2 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {log.status === 2 ? '告警' : '预警'}
                </span>
                <span className="text-gray-500">{log.timestamp}</span>
              </div>
              <div className="text-gray-300">
                {log.stationName}
              </div>
              <div className="flex gap-3 mt-1 text-gray-400">
                <span>压力: <span className="text-white">{log.pressure} MPa</span></span>
                <span>流量: <span className="text-white">{log.flow} m³/h</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
