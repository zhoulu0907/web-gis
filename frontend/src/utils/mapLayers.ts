import type { Map } from 'maplibre-gl';
import type { GeoJsonFeatureCollection } from '../types';

/** 矢量底图样式 URL */
export const DARK_STYLE = 'https://demotiles.maplibre.org/style.json';

/** 天地图卫星底图样式 */
export const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    'tianditu-img': {
      type: 'raster' as const,
      tiles: [
        `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=2c389bb7dfa280cbbfae88532d197aa2`,
        `https://t1.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=2c389bb7dfa280cbbfae88532d197aa2`,
      ],
      tileSize: 256,
    },
    'tianditu-cia': {
      type: 'raster' as const,
      tiles: [
        `https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=2c389bb7dfa280cbbfae88532d197aa2`,
        `https://t1.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=2c389bb7dfa280cbbfae88532d197aa2`,
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: 'tianditu-img', type: 'raster' as const, source: 'tianditu-img' },
    { id: 'tianditu-cia', type: 'raster' as const, source: 'tianditu-cia' },
  ],
};

/**
 * 添加业务图层到地图
 * 包含: 管道、站点光晕、站点圆点、告警闪烁、标注
 */
export function addBusinessLayers(
  map: Map,
  stationsData: GeoJsonFeatureCollection,
  pipelinesData: GeoJsonFeatureCollection,
): void {
  // 管道
  map.addSource('pipelines', {
    type: 'geojson',
    data: pipelinesData as unknown as GeoJSON.FeatureCollection,
  });
  map.addLayer({
    id: 'pipelines-layer',
    type: 'line',
    source: 'pipelines',
    paint: {
      'line-color': '#f59e0b',
      'line-width': 3,
      'line-opacity': 0.8,
      'line-dasharray': [0, 4, 3],
    },
  });

  // 站点
  map.addSource('stations', {
    type: 'geojson',
    data: stationsData as unknown as GeoJSON.FeatureCollection,
  });

  // 光晕
  map.addLayer({
    id: 'stations-glow',
    type: 'circle',
    source: 'stations',
    paint: {
      'circle-radius': 12,
      'circle-color': [
        'match', ['get', 'status'],
        0, '#69f0ae',
        1, '#ffd54f',
        2, '#ff5252',
        '#69f0ae',
      ],
      'circle-opacity': 0.2,
    },
  });

  // 主圆点
  map.addLayer({
    id: 'stations-layer',
    type: 'circle',
    source: 'stations',
    paint: {
      'circle-radius': 6,
      'circle-color': [
        'match', ['get', 'status'],
        0, '#69f0ae',
        1, '#ffd54f',
        2, '#ff5252',
        '#69f0ae',
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });

  // 告警闪烁
  map.addLayer({
    id: 'stations-alarm',
    type: 'circle',
    source: 'stations',
    filter: ['==', ['get', 'status'], 2],
    paint: {
      'circle-radius': 18,
      'circle-color': '#ff5252',
      'circle-opacity': 0.4,
      'circle-blur': 0.8,
    },
  });

  // 标注
  map.addLayer({
    id: 'stations-label',
    type: 'symbol',
    source: 'stations',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-offset': [0, 1.5],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': '#b0bec5',
      'text-halo-color': '#001529',
      'text-halo-width': 1,
    },
  });
}
