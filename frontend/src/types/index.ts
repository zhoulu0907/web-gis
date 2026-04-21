/**
 * 传感器状态枚举
 */
export type SensorStatus = 0 | 1 | 2;

/**
 * 站点类型
 */
export type StationType = 'pump' | 'valve';

/**
 * WebSocket 推送的传感器数据
 */
export interface SensorPayload {
  stationId: number;
  stationName: string;
  pressure: number;
  flow: number;
  status: SensorStatus;
  timestamp: string;
}

/**
 * GeoJSON 几何对象
 */
export interface GeoJsonGeometry {
  type: string;
  coordinates: number[] | number[][];
}

/**
 * GeoJSON Feature
 */
export interface GeoJsonFeature {
  type: 'Feature';
  id: number;
  properties: Record<string, unknown>;
  geometry: GeoJsonGeometry;
}

/**
 * GeoJSON FeatureCollection
 */
export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

/**
 * 站点属性 (GeoJSON Feature 的 properties)
 */
export interface StationProperties {
  name: string;
  type: StationType;
  status: SensorStatus;
}
