import MapBoard from './components/MapBoard';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Legend from './components/Legend';
import LayerControl from './components/LayerControl';
import BasemapSwitcher from './components/BasemapSwitcher';
import Toolbar from './components/Toolbar';
import { useWebSocket } from './hooks/useWebSocket';
import './index.css';

/**
 * 石油管道监控大屏 - 主应用组件
 */
function App() {
  useWebSocket();

  return (
    <div className="relative w-full h-full">
      <MapBoard />
      <Toolbar />
      <LeftPanel />
      <RightPanel />
      <LayerControl />
      <Legend />
      <BasemapSwitcher />
    </div>
  );
}

export default App;
