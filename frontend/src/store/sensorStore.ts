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

  /**
   * 图层显隐回调：由 MapBoard 注册，LayerControl 调用
   */
  layerVisibility: ((layers: { pipelines: boolean; stations: boolean; label: boolean }) => void) | null;
  /** MapBoard 注册图层显隐回调 */
  setLayerVisibility: (fn: (layers: { pipelines: boolean; stations: boolean; label: boolean }) => void) => void;

  /** 底图类型 */
  basemapType: 'vector' | 'satellite';
  /** 设置底图类型 */
  setBasemapType: (type: 'vector' | 'satellite') => void;
  /** 切换底图回调：由 MapBoard 注册，BasemapSwitcher 调用 */
  switchBasemap: ((type: 'vector' | 'satellite') => void) | null;
  /** MapBoard 注册底图切换回调 */
  setSwitchBasemap: (fn: (type: 'vector' | 'satellite') => void) => void;

  /** 测距模式是否激活 */
  measureActive: boolean;
  setMeasureActive: (active: boolean) => void;
  /** MapBoard 注册测距启动回调 */
  startMeasure: (() => void) | null;
  setStartMeasure: (fn: () => void) => void;
  /** MapBoard 注册测距停止回调 */
  stopMeasure: (() => void) | null;
  setStopMeasure: (fn: () => void) => void;
  /** MapBoard 注册测距清除回调 */
  clearMeasure: (() => void) | null;
  setClearMeasure: (fn: () => void) => void;

  /** 爆管模拟是否激活 */
  burstActive: boolean;
  setBurstActive: (active: boolean) => void;
  /** MapBoard 注册爆管启动回调 */
  startBurst: (() => void) | null;
  setStartBurst: (fn: () => void) => void;
  /** MapBoard 注册爆管取消回调 */
  cancelBurst: (() => void) | null;
  setCancelBurst: (fn: () => void) => void;

  /** 注记图层是否可见 */
  annotationVisible: boolean;
  /** 切换注记图层回调（由 MapBoard 注册） */
  toggleAnnotation: (() => void) | null;
  setToggleAnnotation: (fn: () => void) => void;
  setAnnotationVisible: (visible: boolean) => void;

  /** 搜索定位弹窗回调（由 MapBoard 注册，SearchBar 调用） */
  openStationPopup: ((stationId: number) => void) | null;
  setOpenStationPopup: (fn: (stationId: number) => void) => void;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  stations: null,
  pipelines: null,
  latestData: new Map(),
  alarmLogs: [],
  wsConnected: false,
  flyToStation: null,
  layerVisibility: null,
  basemapType: 'vector',
  switchBasemap: null,
  measureActive: false,
  startMeasure: null,
  stopMeasure: null,
  clearMeasure: null,
  burstActive: false,
  startBurst: null,
  cancelBurst: null,
  annotationVisible: true,
  toggleAnnotation: null,
  openStationPopup: null,

  setStations: (data) => set({ stations: data }),
  setPipelines: (data) => set({ pipelines: data }),

  updateSensorData: (payload) => {
    const { latestData, alarmLogs, stations } = get();

    const newLatestData = new Map(latestData);
    newLatestData.set(payload.stationId, payload);

    let newAlarmLogs = alarmLogs;
    if (payload.status === 1 || payload.status === 2) {
      // 同一站点只保留最新一条告警，避免重复
      const filtered = alarmLogs.filter((l) => l.stationId !== payload.stationId);
      newAlarmLogs = [payload, ...filtered].slice(0, 10);
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
  setBasemapType: (type) => set({ basemapType: type }),
  setFlyToStation: (fn) => set({ flyToStation: fn }),
  setLayerVisibility: (fn) => set({ layerVisibility: fn }),
  setSwitchBasemap: (fn) => set({ switchBasemap: fn }),
  setMeasureActive: (active) => set({ measureActive: active }),
  setStartMeasure: (fn) => set({ startMeasure: fn }),
  setStopMeasure: (fn) => set({ stopMeasure: fn }),
  setClearMeasure: (fn) => set({ clearMeasure: fn }),
  setBurstActive: (active) => set({ burstActive: active }),
  setStartBurst: (fn) => set({ startBurst: fn }),
  setCancelBurst: (fn) => set({ cancelBurst: fn }),
  setToggleAnnotation: (fn) => set({ toggleAnnotation: fn }),
  setAnnotationVisible: (visible) => set({ annotationVisible: visible }),
  setOpenStationPopup: (fn) => set({ openStationPopup: fn }),
}));
