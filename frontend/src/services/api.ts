import type { GeoJsonFeatureCollection } from '../types';

const API_BASE = 'http://localhost:9090/api';

/**
 * 获取站点 GeoJSON 数据
 */
export async function fetchStations(): Promise<GeoJsonFeatureCollection> {
  const resp = await fetch(`${API_BASE}/stations`);
  if (!resp.ok) throw new Error(`获取站点数据失败: ${resp.status}`);
  return resp.json();
}

/**
 * 获取管道 GeoJSON 数据
 */
export async function fetchPipelines(): Promise<GeoJsonFeatureCollection> {
  const resp = await fetch(`${API_BASE}/pipelines`);
  if (!resp.ok) throw new Error(`获取管道数据失败: ${resp.status}`);
  return resp.json();
}

/**
 * 传感器历史数据 VO
 */
export interface SensorHistoryVO {
  stationId: number;
  stationName: string;
  timestamps: string[];
  pressures: number[];
  flows: number[];
}

/**
 * 查询指定站点最近 N 分钟的历史数据
 */
export async function fetchHistory(stationId: number, minutes = 5): Promise<SensorHistoryVO> {
  const resp = await fetch(`${API_BASE}/history/${stationId}?minutes=${minutes}`);
  if (!resp.ok) throw new Error(`获取历史数据失败: ${resp.status}`);
  return resp.json();
}
