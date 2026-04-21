import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSensorStore } from '../store/sensorStore';
import { fetchStations, fetchPipelines } from '../services/api';

/**
 * 地图主组件
 * 渲染 MapLibre 深色底图 + 管道/站点图层 + 数据驱动样式
 */
export default function MapBoard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const setStations = useSensorStore((s) => s.setStations);
  const setPipelines = useSensorStore((s) => s.setPipelines);
  const stations = useSensorStore((s) => s.stations);

  // 初始化地图 + 加载数据
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [121.65, 31.25],
      zoom: 11,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        // 加载 GeoJSON 数据
        const [stationsData, pipelinesData] = await Promise.all([
          fetchStations(),
          fetchPipelines(),
        ]);

        setStations(stationsData);
        setPipelines(pipelinesData);

        // 添加管道数据源和图层
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
          },
        });

        // 添加站点数据源和图层
        map.addSource('stations', {
          type: 'geojson',
          data: stationsData as unknown as GeoJSON.FeatureCollection,
        });

        // 站点外圈光晕
        map.addLayer({
          id: 'stations-glow',
          type: 'circle',
          source: 'stations',
          paint: {
            'circle-radius': 12,
            'circle-color': [
              'match',
              ['get', 'status'],
              0, '#22c55e',
              1, '#eab308',
              2, '#ef4444',
              '#22c55e',
            ],
            'circle-opacity': 0.2,
          },
        });

        // 站点主圆点
        map.addLayer({
          id: 'stations-layer',
          type: 'circle',
          source: 'stations',
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'match',
              ['get', 'status'],
              0, '#22c55e',
              1, '#eab308',
              2, '#ef4444',
              '#22c55e',
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // 站点名称标注
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
            'text-color': '#e2e8f0',
            'text-halo-color': '#0a0e17',
            'text-halo-width': 1,
          },
        });
      } catch (err) {
        console.error('加载地图数据失败', err);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [setStations, setPipelines]);

  // 监听站点数据变化，更新地图数据源
  useEffect(() => {
    if (!mapRef.current || !stations) return;
    const map = mapRef.current;

    const stationsSource = map.getSource('stations') as maplibregl.GeoJSONSource;
    if (stationsSource) {
      stationsSource.setData(stations as unknown as GeoJSON.FeatureCollection);
    }
  }, [stations]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
