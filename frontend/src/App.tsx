import { useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import MapBoard, { setLayerVisibility } from './components/MapBoard';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Legend from './components/Legend';
import LayerControl from './components/LayerControl';
import { useWebSocket } from './hooks/useWebSocket';
import './index.css';

/**
 * 石油管道监控大屏 - 主应用组件
 */
function App() {
  useWebSocket();

  // LayerControl 回调：控制图层显隐
  const handleLayerToggle = useCallback((layers: {
    pipelines: boolean;
    stations: boolean;
    label: boolean;
  }) => {
    // 通过 DOM 获取 map 实例（MapBoard 内部持有）
    const container = document.querySelector('.maplibregl-map');
    if (!container) return;
    const map = (container as any).__map as maplibregl.Map;
    if (map) {
      setLayerVisibility(map, layers);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapBoard />
      <LeftPanel />
      <RightPanel />
      <LayerControl onToggle={handleLayerToggle} />
      <Legend />
    </div>
  );
}

export default App;
