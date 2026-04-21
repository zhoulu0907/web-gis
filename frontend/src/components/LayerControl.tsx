import { useState } from 'react';
import { Layers } from 'lucide-react';
import { useSensorStore } from '../store/sensorStore';

interface LayerVisibility {
  pipelines: boolean;
  stations: boolean;
  label: boolean;
}

/**
 * 图层控制组件
 * 控制管道线、站点、标注的显隐
 */
export default function LayerControl() {
  const [open, setOpen] = useState(false);
  const [layers, setLayers] = useState<LayerVisibility>({
    pipelines: true,
    stations: true,
    label: true,
  });

  function toggle(key: keyof LayerVisibility) {
    const next = { ...layers, [key]: !layers[key] };
    setLayers(next);
    // 通过 store 调用 MapBoard 注册的图层显隐回调
    const fn = useSensorStore.getState().layerVisibility;
    if (fn) fn(next);
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <button
        onClick={() => setOpen(!open)}
        className="bg-[rgba(0,21,41,0.7)] backdrop-blur-md rounded-lg border border-[rgba(0,160,233,0.3)] px-3 py-2 flex items-center gap-2 text-[#b0bec5] text-xs hover:text-white transition-colors"
      >
        <Layers size={14} className="text-[#00e5ff]" />
        图层
      </button>

      {open && (
        <div className="mt-2 bg-[rgba(0,21,41,0.85)] backdrop-blur-md rounded-lg border border-[rgba(0,160,233,0.3)] p-3 space-y-2 min-w-32">
          <LayerCheckbox
            label="管道线"
            checked={layers.pipelines}
            onChange={() => toggle('pipelines')}
            color="#f59e0b"
          />
          <LayerCheckbox
            label="监控站点"
            checked={layers.stations}
            onChange={() => toggle('stations')}
            color="#69f0ae"
          />
          <LayerCheckbox
            label="站点标注"
            checked={layers.label}
            onChange={() => toggle('label')}
            color="#00e5ff"
          />
        </div>
      )}
    </div>
  );
}

function LayerCheckbox({ label, checked, onChange, color }: {
  label: string;
  checked: boolean;
  onChange: () => void;
  color: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#b0bec5] hover:text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-[#00e5ff]"
      />
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </label>
  );
}
