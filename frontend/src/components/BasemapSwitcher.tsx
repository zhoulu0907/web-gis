import { useSensorStore } from '../store/sensorStore';

/**
 * 底图切换组件
 * 位置：地图左下角，"矢量"/"卫星"/"注记" 三个按钮
 */
export default function BasemapSwitcher() {
  const basemapType = useSensorStore((s) => s.basemapType);
  const switchBasemap = useSensorStore((s) => s.switchBasemap);
  const annotationVisible = useSensorStore((s) => s.annotationVisible);
  const toggleAnnotation = useSensorStore((s) => s.toggleAnnotation);

  const handleSwitch = (type: 'vector' | 'satellite') => {
    if (switchBasemap) switchBasemap(type);
  };

  return (
    <div className="absolute bottom-6 left-4 z-20 flex rounded overflow-hidden border border-[rgba(0,160,233,0.3)]">
      <button
        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
          basemapType === 'vector'
            ? 'bg-[rgba(0,160,233,0.3)] text-[#00e5ff]'
            : 'bg-[rgba(0,21,41,0.8)] text-[#b0bec5] hover:text-white'
        }`}
        onClick={() => handleSwitch('vector')}
      >
        矢量
      </button>
      <button
        className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-[rgba(0,160,233,0.3)] ${
          basemapType === 'satellite'
            ? 'bg-[rgba(0,160,233,0.3)] text-[#00e5ff]'
            : 'bg-[rgba(0,21,41,0.8)] text-[#b0bec5] hover:text-white'
        }`}
        onClick={() => handleSwitch('satellite')}
      >
        卫星
      </button>
      <button
        className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-[rgba(0,160,233,0.3)] ${
          annotationVisible
            ? 'bg-[rgba(0,160,233,0.3)] text-[#00e5ff]'
            : 'bg-[rgba(0,21,41,0.8)] text-[#b0bec5] hover:text-white'
        }`}
        onClick={() => toggleAnnotation?.()}
      >
        注记
      </button>
    </div>
  );
}
