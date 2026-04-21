import { useCallback } from 'react';
import { Ruler, Flame, X } from 'lucide-react';
import { useSensorStore } from '../store/sensorStore';

const panelCls = 'bg-[rgba(0,21,41,0.7)] backdrop-blur-md rounded-lg border border-[rgba(0,160,233,0.3)] p-2';

/**
 * 工具栏组件
 * 包含：测距工具、爆管模拟、清除
 */
export default function Toolbar() {
  const measureActive = useSensorStore((s) => s.measureActive);
  const burstActive = useSensorStore((s) => s.burstActive);
  const setMeasureActive = useSensorStore((s) => s.setMeasureActive);
  const setBurstActive = useSensorStore((s) => s.setBurstActive);
  const startMeasure = useSensorStore((s) => s.startMeasure);
  const stopMeasure = useSensorStore((s) => s.stopMeasure);
  const clearMeasure = useSensorStore((s) => s.clearMeasure);
  const cancelBurst = useSensorStore((s) => s.cancelBurst);

  const handleMeasure = useCallback(() => {
    if (measureActive) {
      stopMeasure?.();
    } else {
      setBurstActive(false);
      startMeasure?.();
    }
    setMeasureActive(!measureActive);
  }, [measureActive, startMeasure, stopMeasure, setMeasureActive, setBurstActive]);

  const handleBurst = useCallback(() => {
    if (burstActive) {
      cancelBurst?.();
      setBurstActive(false);
    } else {
      setMeasureActive(false);
      clearMeasure?.();
      setBurstActive(true);
    }
  }, [burstActive, cancelBurst, setBurstActive, setMeasureActive, clearMeasure]);

  const handleClear = useCallback(() => {
    if (measureActive) {
      clearMeasure?.();
      stopMeasure?.();
      setMeasureActive(false);
    }
    if (burstActive) {
      cancelBurst?.();
      setBurstActive(false);
    }
  }, [measureActive, burstActive, clearMeasure, stopMeasure, cancelBurst, setMeasureActive, setBurstActive]);

  return (
    <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1 ${panelCls}`}>
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
          measureActive
            ? 'bg-[rgba(0,229,255,0.2)] text-[#00e5ff]'
            : 'text-[#b0bec5] hover:text-white'
        }`}
        onClick={handleMeasure}
        title="测距工具"
      >
        <Ruler size={14} />
        测距
      </button>
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
          burstActive
            ? 'bg-[rgba(255,82,82,0.2)] text-[#ff5252]'
            : 'text-[#b0bec5] hover:text-white'
        }`}
        onClick={handleBurst}
        title="爆管模拟"
      >
        <Flame size={14} />
        爆管模拟
      </button>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-[#b0bec5] hover:text-white transition-colors"
        onClick={handleClear}
        title="清除"
      >
        <X size={14} />
        清除
      </button>
    </div>
  );
}
