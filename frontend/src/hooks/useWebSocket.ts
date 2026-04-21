import { useEffect, useRef } from 'react';
import { useSensorStore } from '../store/sensorStore';
import type { SensorPayload } from '../types';

const WS_URL = 'ws://localhost:9090/ws/sensor';
const RECONNECT_BASE_DELAY = 3000;
const RECONNECT_MAX_DELAY = 30000;

/**
 * WebSocket 连接 Hook
 * 自动连接、接收数据、断连重连（指数退避）
 */
export function useWebSocket() {
  const updateSensorData = useSensorStore((s) => s.updateSensorData);
  const setWsConnected = useSensorStore((s) => s.setWsConnected);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] 连接成功');
        setWsConnected(true);
        retryCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: SensorPayload = JSON.parse(event.data);
          updateSensorData(data);
        } catch (e) {
          console.error('[WebSocket] 解析消息失败', e);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] 连接断开');
        setWsConnected(false);
        scheduleReconnect();
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] 连接错误', err);
        ws.close();
      };
    }

    function scheduleReconnect() {
      const delay = Math.min(
        RECONNECT_BASE_DELAY * Math.pow(2, retryCountRef.current),
        RECONNECT_MAX_DELAY
      );
      retryCountRef.current++;
      console.log(`[WebSocket] ${delay / 1000}s 后重连 (第 ${retryCountRef.current} 次)`);
      setTimeout(connect, delay);
    }

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [updateSensorData, setWsConnected]);
}
