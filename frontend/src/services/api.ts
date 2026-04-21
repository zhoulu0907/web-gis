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
