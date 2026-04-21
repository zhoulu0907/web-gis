import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSensorStore } from '../store/sensorStore';
import { fetchStations, fetchPipelines } from '../services/api';

/**
 * 地图主组件
 * 渲染 MapLibre 深色底图 + 管道/站点图层 + 告警闪烁 + Tooltip + FlyTo
 */
export default function MapBoard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkStateRef = useRef(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const setStations = useSensorStore((s) => s.setStations);
  const setPipelines = useSensorStore((s) => s.setPipelines);
  const setFlyToStation = useSensorStore((s) => s.setFlyToStation);
  const stations = useSensorStore((s) => s.stations);

  // FlyTo: 根据站点 ID 查找坐标并飞行
  const handleFlyToStation = useCallback((stationId: number) => {
    const map = mapRef.current;
    const st = useSensorStore.getState().stations;
    if (!map || !st) return;

    const feature = st.features.find((f) => f.id === stationId);
    if (!feature) return;

    const coords = feature.geometry.coordinates as [number, number];
    map.flyTo({ center: coords, zoom: 14, duration: 1500 });
  }, []);

  // 注册 flyTo 回调到 store
  useEffect(() => {
    setFlyToStation(handleFlyToStation);
  }, [setFlyToStation, handleFlyToStation]);

  // 初始化地图
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [121.65, 31.25],
      zoom: 11,
    });

    mapRef.current = map;

    // 创建 Tooltip DOM
    const tooltip = document.createElement('div');
    tooltip.className = 'hidden fixed z-50 bg-[rgba(0,21,41,0.9)] backdrop-blur-md border border-[rgba(0,160,233,0.4)] rounded px-3 py-2 text-xs pointer-events-none';
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    map.on('load', async () => {
      try {
        const [stationsData, pipelinesData] = await Promise.all([
          fetchStations(),
          fetchPipelines(),
        ]);

        setStations(stationsData);
        setPipelines(pipelinesData);

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

        // 告警呼吸动画
        blinkTimerRef.current = setInterval(() => {
          if (!mapRef.current) return;
          blinkStateRef.current = !blinkStateRef.current;
          map.setPaintProperty('stations-alarm', 'circle-opacity', blinkStateRef.current ? 0.6 : 0.1);
          map.setPaintProperty('stations-alarm', 'circle-radius', blinkStateRef.current ? 20 : 14);
        }, 500);

      } catch (err) {
        console.error('加载地图数据失败', err);
      }
    });

    // Tooltip 事件
    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['stations-layer'],
      });
      if (features.length > 0 && tooltipRef.current) {
        const f = features[0];
        const props = f.properties;
        const sid = f.id as number;
        const latest = useSensorStore.getState().latestData.get(sid);
        const statusText: Record<number, string> = { 0: '正常', 1: '预警', 2: '告警' };

        let html = `<div class="font-bold text-[#00e5ff] mb-1">${props?.name || ''}</div>`;
        if (latest) {
          html += `<div class="text-[#b0bec5]">压力: <span class="text-white">${latest.pressure} MPa</span></div>`;
          html += `<div class="text-[#b0bec5]">流量: <span class="text-white">${latest.flow} m³/h</span></div>`;
          html += `<div class="text-[#b0bec5]">状态: <span class="${latest.status === 2 ? 'text-[#ff5252]' : latest.status === 1 ? 'text-[#ffd54f]' : 'text-[#69f0ae]'}">${statusText[latest.status] || '正常'}</span></div>`;
        }
        tooltipRef.current.innerHTML = html;
        tooltipRef.current.style.left = `${e.originalEvent.clientX + 12}px`;
        tooltipRef.current.style.top = `${e.originalEvent.clientY - 10}px`;
        tooltipRef.current.classList.remove('hidden');
        map.getCanvas().style.cursor = 'pointer';
      } else if (tooltipRef.current) {
        tooltipRef.current.classList.add('hidden');
        map.getCanvas().style.cursor = '';
      }
    };

    const onMouseLeave = () => {
      if (tooltipRef.current) {
        tooltipRef.current.classList.add('hidden');
      }
      map.getCanvas().style.cursor = '';
    };

    map.on('mousemove', onMouseMove);
    map.on('mouseleave', onMouseLeave);

    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      map.off('mousemove', onMouseMove);
      map.off('mouseleave', onMouseLeave);
      map.remove();
      mapRef.current = null;
    };
  }, [setStations, setPipelines]);

  // 监听站点数据变化
  useEffect(() => {
    if (!mapRef.current || !stations) return;
    const source = mapRef.current.getSource('stations') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(stations as unknown as GeoJSON.FeatureCollection);
    }
  }, [stations]);

  return <div ref={mapContainer} className="w-full h-full" />;
}

/** 图层显隐控制（由 App 调用） */
export function setLayerVisibility(
  map: maplibregl.Map,
  layers: { pipelines: boolean; stations: boolean; label: boolean }
) {
  const setVis = (id: string, visible: boolean) => {
    map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
  };

  setVis('pipelines-layer', layers.pipelines);
  setVis('stations-glow', layers.stations);
  setVis('stations-layer', layers.stations);
  setVis('stations-alarm', layers.stations);
  setVis('stations-label', layers.label);
}
