import { create } from 'zustand';
import type { SensorPayload, GeoJsonFeatureCollection } from '../types';

interface SensorState {
  /** 站点 GeoJSON 数据 */
  stations: GeoJsonFeatureCollection | null;
  /** 管道 GeoJSON 数据 */
  pipelines: GeoJsonFeatureCollection | null;
  /** 各站点最新传感器数据 */
  latestData: Map<number, SensorPayload>;
  /** 告警日志 (最近 10 条) */
  alarmLogs: SensorPayload[];
  /** WebSocket 连接状态 */
  wsConnected: boolean;

  /** 设置站点数据 */
  setStations: (data: GeoJsonFeatureCollection) => void;
  /** 设置管道数据 */
  setPipelines: (data: GeoJsonFeatureCollection) => void;
  /** 更新传感器数据 */
  updateSensorData: (payload: SensorPayload) => void;
  /** 设置 WebSocket 连接状态 */
  setWsConnected: (connected: boolean) => void;

  /**
   * FlyTo 回调：由 MapBoard 注册，RightPanel 调用
   * 将地图飞行到指定站点位置
   */
  flyToStation: ((stationId: number) => void) | null;
  /** MapBoard 注册 flyTo 回调 */
  setFlyToStation: (fn: (stationId: number) => void) => void;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  stations: null,
  pipelines: null,
  latestData: new Map(),
  alarmLogs: [],
  wsConnected: false,
  flyToStation: null,

  setStations: (data) => set({ stations: data }),
  setPipelines: (data) => set({ pipelines: data }),

  updateSensorData: (payload) => {
    const { latestData, alarmLogs, stations } = get();

    const newLatestData = new Map(latestData);
    newLatestData.set(payload.stationId, payload);

    let newAlarmLogs = [...alarmLogs];
    if (payload.status === 1 || payload.status === 2) {
      newAlarmLogs.unshift(payload);
      if (newAlarmLogs.length > 10) {
        newAlarmLogs = newAlarmLogs.slice(0, 10);
      }
    }

    let newStations = stations;
    if (stations) {
      newStations = {
        ...stations,
        features: stations.features.map((f) => {
          if (f.id === payload.stationId) {
            return {
              ...f,
              properties: { ...f.properties, status: payload.status },
            };
          }
          return f;
        }),
      };
    }

    set({
      latestData: newLatestData,
      alarmLogs: newAlarmLogs,
      stations: newStations,
    });
  },

  setWsConnected: (connected) => set({ wsConnected: connected }),
  setFlyToStation: (fn) => set({ flyToStation: fn }),
}));
