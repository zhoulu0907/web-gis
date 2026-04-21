import type { Map, MapMouseEvent } from 'maplibre-gl';
import * as turf from '@turf/turf';

export interface MeasureState {
  active: boolean;
  points: [number, number][];
  totalDistance: number;
}

/**
 * 创建测距工具控制器
 * 返回控制函数，供 Toolbar / MapBoard 调用
 */
export function createMeasureTool(map: Map) {
  const state: MeasureState = {
    active: false,
    points: [],
    totalDistance: 0,
  };

  let measureSource: maplibregl.GeoJSONSource | null = null;
  let measureMoveHandler: ((e: MapMouseEvent) => void) | null = null;
  let measureClickHandler: ((e: MapMouseEvent) => void) | null = null;
  let measureDblClickHandler: ((e: MapMouseEvent) => void) | null = null;

  function ensureSource() {
    if (!map.getSource('measure-points')) {
      map.addSource('measure-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addSource('measure-lines', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      // 节点
      map.addLayer({
        id: 'measure-points-layer',
        type: 'circle',
        source: 'measure-points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#00e5ff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      // 线段
      map.addLayer({
        id: 'measure-lines-layer',
        type: 'line',
        source: 'measure-lines',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });
      // 距离标注
      map.addLayer({
        id: 'measure-labels-layer',
        type: 'symbol',
        source: 'measure-points',
        layout: {
          'text-field': ['get', 'label'],
          'text-size': 12,
          'text-offset': [0, -1.6],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#00e5ff',
          'text-halo-color': '#001529',
          'text-halo-width': 1,
        },
      });
    }
    measureSource = map.getSource('measure-points') as maplibregl.GeoJSONSource;
  }

  function updateGeoJSON() {
    if (!measureSource) return;

    const pointFeatures = state.points.map((coord, i) => ({
      type: 'Feature' as const,
      properties: {
        label: i === 0 ? '起点' : `${calcSegmentDistance(i).toFixed(2)} km\n总计 ${state.totalDistance.toFixed(2)} km`,
      },
      geometry: { type: 'Point' as const, coordinates: coord },
    }));

    const lineCoords = state.points.length >= 2 ? [state.points] : [];
    const lineFeatures = lineCoords.map((coords) => ({
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: coords },
    }));

    (map.getSource('measure-lines') as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: lineFeatures,
    });

    measureSource.setData({
      type: 'FeatureCollection',
      features: pointFeatures as GeoJSON.Feature[],
    });
  }

  function calcSegmentDistance(toIndex: number): number {
    if (toIndex < 1) return 0;
    const from = turf.point(state.points[toIndex - 1]);
    const to = turf.point(state.points[toIndex]);
    return turf.distance(from, to, { units: 'kilometers' });
  }

  function recalcTotal() {
    let total = 0;
    for (let i = 1; i < state.points.length; i++) {
      total += calcSegmentDistance(i);
    }
    state.totalDistance = total;
  }

  function start() {
    state.active = true;
    state.points = [];
    state.totalDistance = 0;
    map.getCanvas().style.cursor = 'crosshair';
    ensureSource();
    updateGeoJSON();

    // mousemove: 实时预览线
    measureMoveHandler = (e: MapMouseEvent) => {
      if (!state.active || state.points.length === 0) return;
      const coord = [e.lngLat.lng, e.lngLat.lat] as [number, number];
      const previewCoords = [...state.points, coord];

      const lineFeatures = [{
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'LineString' as const, coordinates: previewCoords },
      }];
      (map.getSource('measure-lines') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: lineFeatures as GeoJSON.Feature[],
      });

      // 实时显示预览距离
      const from = turf.point(state.points[state.points.length - 1]);
      const to = turf.point(coord);
      const segDist = turf.distance(from, to, { units: 'kilometers' });
      const previewTotal = state.totalDistance + segDist;

      const pointFeatures = state.points.map((c, i) => ({
        type: 'Feature' as const,
        properties: { label: i === 0 ? '起点' : `${calcSegmentDistance(i).toFixed(2)} km` },
        geometry: { type: 'Point' as const, coordinates: c },
      }));
      pointFeatures.push({
        type: 'Feature' as const,
        properties: { label: `${previewTotal.toFixed(2)} km` },
        geometry: { type: 'Point' as const, coordinates: coord },
      });

      measureSource!.setData({
        type: 'FeatureCollection',
        features: pointFeatures as GeoJSON.Feature[],
      });
    };

    // click: 添加节点
    measureClickHandler = (e: MapMouseEvent) => {
      if (!state.active) return;
      state.points.push([e.lngLat.lng, e.lngLat.lat]);
      recalcTotal();
      updateGeoJSON();
    };

    // dblclick: 结束测量
    measureDblClickHandler = (e: MapMouseEvent) => {
      e.preventDefault();
      stop();
    };

    map.on('mousemove', measureMoveHandler);
    map.on('click', measureClickHandler);
    map.on('dblclick', measureDblClickHandler);
    // 禁用双击缩放
    map.doubleClickZoom.disable();
  }

  function stop() {
    state.active = false;
    map.getCanvas().style.cursor = '';

    if (measureMoveHandler) map.off('mousemove', measureMoveHandler);
    if (measureClickHandler) map.off('click', measureClickHandler);
    if (measureDblClickHandler) map.off('dblclick', measureDblClickHandler);
    map.doubleClickZoom.enable();

    measureMoveHandler = null;
    measureClickHandler = null;
    measureDblClickHandler = null;
  }

  function clear() {
    stop();
    state.points = [];
    state.totalDistance = 0;
    if (map.getSource('measure-points')) {
      (map.getSource('measure-points') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [],
      });
      (map.getSource('measure-lines') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }

  function destroy() {
    clear();
    // 移除图层和 source
    ['measure-labels-layer', 'measure-lines-layer', 'measure-points-layer'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['measure-points', 'measure-lines'].forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
    measureSource = null;
  }

  return { state, start, stop, clear, destroy };
}
