import MapBoard from './components/MapBoard';
import { useWebSocket } from './hooks/useWebSocket';
import './index.css';

/**
 * 石油管道监控大屏 - 主应用组件
 */
function App() {
  // 启动 WebSocket 连接
  useWebSocket();

  return (
    <div className="relative w-full h-full">
      <MapBoard />
    </div>
  );
}

export default App;
