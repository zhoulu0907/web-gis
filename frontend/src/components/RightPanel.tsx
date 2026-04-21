import { useSensorStore } from '../store/sensorStore';
import { AlertTriangle } from 'lucide-react';

const panelCls = 'bg-[rgba(0,21,41,0.7)] backdrop-blur-md rounded-lg border border-[rgba(0,160,233,0.3)] p-4';

/**
 * 右侧告警日志面板
 * 实时滚动显示最近 10 条告警/预警信息
 * 点击可 FlyTo 定位到报警站点
 */
export default function RightPanel() {
  const alarmLogs = useSensorStore((s) => s.alarmLogs);
  const flyToStation = useSensorStore((s) => s.flyToStation);

  return (
    <div className={`absolute top-4 right-4 z-10 w-72 ${panelCls}`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-[#ff5252]" />
        <span className="text-sm font-bold text-[#ff5252]">实时告警</span>
        {alarmLogs.length > 0 && (
          <span className="ml-auto bg-[rgba(255,82,82,0.2)] text-[#ff5252] text-xs px-2 py-0.5 rounded-full">
            {alarmLogs.length}
          </span>
        )}
      </div>

      {alarmLogs.length === 0 ? (
        <div className="text-center text-[#546e7a] text-sm py-4">暂无告警</div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {alarmLogs.map((log, index) => (
            <div
              key={`${log.stationId}-${log.timestamp}-${index}`}
              className={`rounded px-3 py-2 text-xs border cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.05)] ${
                log.status === 2
                  ? 'bg-[rgba(255,82,82,0.08)] border-[rgba(255,82,82,0.25)]'
                  : 'bg-[rgba(255,213,79,0.08)] border-[rgba(255,213,79,0.25)]'
              }`}
              onClick={() => flyToStation?.(log.stationId)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold ${log.status === 2 ? 'text-[#ff5252]' : 'text-[#ffd54f]'}`}>
                  {log.status === 2 ? '告警' : '预警'}
                </span>
                <span className="text-[#546e7a]">{log.timestamp}</span>
              </div>
              <div className="text-[#b0bec5]">{log.stationName}</div>
              <div className="flex gap-3 mt-1 text-[#78909c]">
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
