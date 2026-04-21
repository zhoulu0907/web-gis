import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as echarts from 'echarts';
import { useSensorStore } from '../store/sensorStore';
import { fetchStations, fetchPipelines, fetchHistory } from '../services/api';
import { addBusinessLayers, DARK_STYLE, SATELLITE_STYLE } from '../utils/mapLayers';
import { createTrendChartOption } from '../utils/echartsConfig';

/**
 * 地图主组件
 * 渲染 MapLibre 深色底图 + 管道/站点图层 + 告警闪烁 + Tooltip + FlyTo + 底图切换 + 流动动画
 */
export default function MapBoard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkStateRef = useRef(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const flowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flowFrameRef = useRef(0);
  const setStations = useSensorStore((s) => s.setStations);
  const setPipelines = useSensorStore((s) => s.setPipelines);
  const setFlyToStation = useSensorStore((s) => s.setFlyToStation);
  const setLayerVisibilityFn = useSensorStore((s) => s.setLayerVisibility);
  const setSwitchBasemap = useSensorStore((s) => s.setSwitchBasemap);
  const stations = useSensorStore((s) => s.stations);

  // 启动告警呼吸动画
  const startBlinkAnimation = useCallback(() => {
    if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    blinkTimerRef.current = setInterval(() => {
      if (!mapRef.current) return;
      blinkStateRef.current = !blinkStateRef.current;
      mapRef.current.setPaintProperty('stations-alarm', 'circle-opacity', blinkStateRef.current ? 0.6 : 0.1);
      mapRef.current.setPaintProperty('stations-alarm', 'circle-radius', blinkStateRef.current ? 20 : 14);
    }, 500);
  }, []);

  // 启动管道流动动画
  const startFlowAnimation = useCallback(() => {
    if (flowTimerRef.current) clearInterval(flowTimerRef.current);
    // 14 帧循环 dasharray
    const dashArraySequences = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ];
    flowTimerRef.current = setInterval(() => {
      if (!mapRef.current) return;
      flowFrameRef.current = (flowFrameRef.current + 1) % dashArraySequences.length;
      mapRef.current.setPaintProperty(
        'pipelines-layer',
        'line-dasharray',
        dashArraySequences[flowFrameRef.current],
      );
    }, 100);
  }, []);

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

  // 注册底图切换回调到 store
  useEffect(() => {
    setSwitchBasemap((type: 'vector' | 'satellite') => {
      const map = mapRef.current;
      const st = useSensorStore.getState().stations;
      const pl = useSensorStore.getState().pipelines;
      if (!map || !st || !pl) return;

      // 保存当前视角
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = map.getPitch();

      const newStyle = type === 'vector' ? DARK_STYLE : SATELLITE_STYLE;
      map.setStyle(newStyle as maplibregl.StyleSpecification);

      map.once('style.load', () => {
        addBusinessLayers(map, st, pl);
        map.jumpTo({ center, zoom, bearing, pitch });
        startBlinkAnimation();
        startFlowAnimation();
      });

      useSensorStore.getState().setBasemapType(type);
    });
  }, [setSwitchBasemap, startBlinkAnimation, startFlowAnimation]);

  // 注册图层显隐回调到 store
  useEffect(() => {
    setLayerVisibilityFn((layers) => {
      const map = mapRef.current;
      if (!map) return;
      const setVis = (id: string, visible: boolean) => {
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      };
      setVis('pipelines-layer', layers.pipelines);
      setVis('stations-glow', layers.stations);
      setVis('stations-layer', layers.stations);
      setVis('stations-alarm', layers.stations);
      setVis('stations-label', layers.label);
    });
  }, [setLayerVisibilityFn]);

  // 初始化地图
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: DARK_STYLE,
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

        addBusinessLayers(map, stationsData, pipelinesData);
        startBlinkAnimation();
        startFlowAnimation();

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

    // 点击站点弹出 Popup + ECharts 折线图
    map.on('click', 'stations-layer', async (e) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const stationId = feature.id as number;
      const stationName = (feature.properties as Record<string, unknown>).name as string;
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      // 创建 Popup DOM
      const popupEl = document.createElement('div');
      popupEl.className = 'sensor-popup';

      const loadingEl = document.createElement('div');
      loadingEl.className = 'sensor-popup-loading';
      loadingEl.textContent = '加载历史数据...';
      popupEl.appendChild(loadingEl);

      const chartEl = document.createElement('div');
      chartEl.className = 'sensor-popup-chart';
      popupEl.appendChild(chartEl);

      const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '360px' })
        .setLngLat(coordinates)
        .setDOMContent(popupEl)
        .addTo(map);

      let chart: echarts.ECharts | null = null;

      popup.on('close', () => {
        if (chart) {
          chart.dispose();
          chart = null;
        }
      });

      try {
        const history = await fetchHistory(stationId, 5);
        loadingEl.style.display = 'none';
        chartEl.style.display = 'block';

        chart = echarts.init(chartEl);
        chart.setOption(createTrendChartOption(
          history.stationName,
          history.timestamps,
          history.pressures,
          history.flows,
        ));
      } catch {
        loadingEl.textContent = '加载失败';
      }
    });

    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
      if (flowTimerRef.current) clearInterval(flowTimerRef.current);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      map.off('mousemove', onMouseMove);
      map.off('mouseleave', onMouseLeave);
      map.remove();
      mapRef.current = null;
    };
  }, [setStations, setPipelines, startBlinkAnimation, startFlowAnimation]);

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
