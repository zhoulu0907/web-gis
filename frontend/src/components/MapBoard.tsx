import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as echarts from 'echarts';
import { useSensorStore } from '../store/sensorStore';
import { fetchStations, fetchPipelines, fetchHistory, fetchSegments } from '../services/api';
import { addBusinessLayers, DARK_STYLE, SATELLITE_STYLE } from '../utils/mapLayers';
import { createTrendChartOption } from '../utils/echartsConfig';
import { createMeasureTool } from '../utils/measure';

/**
 * 地图主组件
 */
export default function MapBoard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkStateRef = useRef(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const flowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flowFrameRef = useRef(0);
  const measureToolRef = useRef<ReturnType<typeof createMeasureTool> | null>(null);
  const burstPulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstPulseStateRef = useRef(false);
  const segmentsDataRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const alarmFlowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmFlowFrameRef = useRef(0);

  const setStations = useSensorStore((s) => s.setStations);
  const setPipelines = useSensorStore((s) => s.setPipelines);
  const setFlyToStation = useSensorStore((s) => s.setFlyToStation);
  const setLayerVisibilityFn = useSensorStore((s) => s.setLayerVisibility);
  const setSwitchBasemap = useSensorStore((s) => s.setSwitchBasemap);
  const setStartMeasure = useSensorStore((s) => s.setStartMeasure);
  const setStopMeasure = useSensorStore((s) => s.setStopMeasure);
  const setClearMeasure = useSensorStore((s) => s.setClearMeasure);
  const setCancelBurst = useSensorStore((s) => s.setCancelBurst);
  const setStartBurst = useSensorStore((s) => s.setStartBurst);
  const setToggleAnnotation = useSensorStore((s) => s.setToggleAnnotation);
  const setOpenStationPopup = useSensorStore((s) => s.setOpenStationPopup);
  const stations = useSensorStore((s) => s.stations);

  // 启动告警呼吸动画
  const startBlinkAnimation = useCallback(() => {
    if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    blinkTimerRef.current = setInterval(() => {
      if (!mapRef.current) return;
      blinkStateRef.current = !blinkStateRef.current;
      mapRef.current.setPaintProperty('stations-alarm', 'circle-opacity', blinkStateRef.current ? 0.6 : 0.1);
      mapRef.current.setPaintProperty('stations-alarm', 'circle-radius', blinkStateRef.current ? 26 : 16);
    }, 500);
  }, []);

  // 启动管道流动动画（操作 segments-layer）
  const startFlowAnimation = useCallback(() => {
    if (flowTimerRef.current) clearInterval(flowTimerRef.current);
    const dashArraySequences = [
      [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5],
      [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5],
      [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5],
      [0, 3, 3, 1], [0, 3.5, 3, 0.5],
    ];
    flowTimerRef.current = setInterval(() => {
      if (!mapRef.current) return;
      flowFrameRef.current = (flowFrameRef.current + 1) % dashArraySequences.length;
      mapRef.current.setPaintProperty('segments-layer', 'line-dasharray', dashArraySequences[flowFrameRef.current]);
    }, 100);
  }, []);

  // 启动告警管段流动动画（更快，60ms 间隔）
  const startAlarmFlowAnimation = useCallback(() => {
    if (alarmFlowTimerRef.current) clearInterval(alarmFlowTimerRef.current);
    const dashArraySequences = [
      [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5],
      [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5],
      [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5],
      [0, 3, 3, 1], [0, 3.5, 3, 0.5],
    ];
    alarmFlowTimerRef.current = setInterval(() => {
      if (!mapRef.current) return;
      alarmFlowFrameRef.current = (alarmFlowFrameRef.current + 1) % dashArraySequences.length;
      mapRef.current.setPaintProperty('segments-alarm-layer', 'line-dasharray', dashArraySequences[alarmFlowFrameRef.current]);
    }, 60);
  }, []);

  // FlyTo
  const handleFlyToStation = useCallback((stationId: number) => {
    const map = mapRef.current;
    const st = useSensorStore.getState().stations;
    if (!map || !st) return;
    const feature = st.features.find((f) => f.id === stationId);
    if (!feature) return;
    const coords = feature.geometry.coordinates as [number, number];
    map.flyTo({ center: coords, zoom: 14, duration: 1500 });
  }, []);

  // 注册回调
  useEffect(() => { setFlyToStation(handleFlyToStation); }, [setFlyToStation, handleFlyToStation]);

  // 注册底图切换回调
  useEffect(() => {
    setSwitchBasemap((type: 'vector' | 'satellite') => {
      const map = mapRef.current;
      const st = useSensorStore.getState().stations;
      if (!map || !st) return;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = map.getPitch();
      const newStyle = type === 'vector' ? DARK_STYLE : SATELLITE_STYLE;
      map.setStyle(newStyle as maplibregl.StyleSpecification);
      map.once('style.load', () => {
        addBusinessLayers(map, st);
        addSegmentsLayer(map);
        map.jumpTo({ center, zoom, bearing, pitch });
        startBlinkAnimation();
        startFlowAnimation();
        startAlarmFlowAnimation();
        // 同步注记状态
        const { annotationVisible } = useSensorStore.getState();
        const annotationLayer = type === 'vector' ? 'tianditu-cva' : 'tianditu-cia';
        if (!annotationVisible) {
          map.setLayoutProperty(annotationLayer, 'visibility', 'none');
        }
      });
      useSensorStore.getState().setBasemapType(type);
    });
  }, [setSwitchBasemap, startBlinkAnimation, startFlowAnimation, startAlarmFlowAnimation]);

  // 注册图层显隐回调
  useEffect(() => {
    setLayerVisibilityFn((layers) => {
      const map = mapRef.current;
      if (!map) return;
      const setVis = (id: string, visible: boolean) => {
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      };
      setVis('segments-glow', layers.pipelines);
      setVis('segments-layer', layers.pipelines);
      setVis('segments-alarm-layer', layers.pipelines);
      setVis('stations-glow', layers.stations);
      setVis('stations-layer', layers.stations);
      setVis('stations-alarm', layers.stations);
      setVis('stations-label', layers.label);
    });
  }, [setLayerVisibilityFn]);

  // 注册注记切换回调
  useEffect(() => {
    setToggleAnnotation(() => {
      const map = mapRef.current;
      if (!map) return;
      const { annotationVisible, basemapType } = useSensorStore.getState();
      const layerId = basemapType === 'vector' ? 'tianditu-cva' : 'tianditu-cia';
      const newVisible = !annotationVisible;
      map.setLayoutProperty(layerId, 'visibility', newVisible ? 'visible' : 'none');
      useSensorStore.getState().setAnnotationVisible(newVisible);
    });
  }, [setToggleAnnotation]);

  // 提取站点弹窗函数（供地图点击和搜索联动共用）
  const openPopupForStation = useCallback((stationId: number) => {
    const map = mapRef.current;
    const st = useSensorStore.getState().stations;
    if (!map || !st) return;
    const feature = st.features.find((f) => f.id === stationId);
    if (!feature) return;
    const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

    map.flyTo({ center: coordinates, zoom: 14, duration: 1500 });
    map.once('moveend', () => {
      const popupEl = document.createElement('div');
      popupEl.className = 'sensor-popup';
      const loadingEl = document.createElement('div');
      loadingEl.className = 'sensor-popup-loading';
      loadingEl.textContent = '加载历史数据...';
      popupEl.appendChild(loadingEl);
      const chartEl = document.createElement('div');
      chartEl.className = 'sensor-popup-chart';
      popupEl.appendChild(chartEl);

      const videoBtn = document.createElement('button');
      videoBtn.textContent = '查看监控视频';
      videoBtn.style.cssText = 'margin-top:8px;width:100%;padding:6px 0;border:1px solid rgba(0,160,233,0.5);border-radius:4px;background:rgba(0,160,233,0.15);color:#00e5ff;font-size:12px;cursor:pointer;';
      videoBtn.onmouseover = () => { videoBtn.style.background = 'rgba(0,160,233,0.3)'; };
      videoBtn.onmouseout = () => { videoBtn.style.background = 'rgba(0,160,233,0.15)'; };
      videoBtn.onclick = () => { alert('监控视频功能开发中...'); };
      popupEl.appendChild(videoBtn);

      const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '360px' })
        .setLngLat(coordinates)
        .setDOMContent(popupEl)
        .addTo(map);

      let chart: echarts.ECharts | null = null;
      popup.on('close', () => { if (chart) { chart.dispose(); chart = null; } });

      (async () => {
        try {
          const history = await fetchHistory(stationId, 5);
          loadingEl.style.display = 'none';
          chartEl.style.display = 'block';
          chart = echarts.init(chartEl);
          chart.setOption(createTrendChartOption(history.stationName, history.timestamps, history.pressures, history.flows));
        } catch {
          loadingEl.textContent = '加载失败';
        }
      })();
    });
  }, []);

  // 注册搜索定位弹窗回调
  useEffect(() => { setOpenStationPopup(openPopupForStation); }, [setOpenStationPopup, openPopupForStation]);

  // 注册测距回调
  useEffect(() => {
    setStartMeasure(() => {
      if (!mapRef.current) return;
      if (!measureToolRef.current) {
        measureToolRef.current = createMeasureTool(mapRef.current);
      }
      measureToolRef.current.start();
    });
    setStopMeasure(() => {
      measureToolRef.current?.stop();
    });
    setClearMeasure(() => {
      measureToolRef.current?.clear();
    });
  }, [setStartMeasure, setStopMeasure, setClearMeasure]);

  // 注册爆管启动/取消回调
  useEffect(() => {
    setStartBurst(() => {
      // segments-layer 已默认可见，无需额外操作
    });
    setCancelBurst(() => {
      const map = mapRef.current;
      if (!map) return;
      if (burstPulseRef.current) {
        clearInterval(burstPulseRef.current);
        burstPulseRef.current = null;
      }
      // 移除爆管图层
      ['burst-highlight-layer', 'burst-point-layer'].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      ['burst-highlight', 'burst-point'].forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
      map.getCanvas().style.cursor = '';
    });
  }, [setStartBurst, setCancelBurst]);

  // 根据站点状态计算管段 maxStatus
  const computeSegmentStatuses = useCallback(
    (segments: GeoJSON.FeatureCollection, stations: GeoJSON.FeatureCollection | null): GeoJSON.FeatureCollection => {
      if (!stations) return segments;
      return {
        ...segments,
        features: segments.features.map((f) => {
          const props = f.properties as Record<string, unknown>;
          const startId = props.startStationId as number;
          const endId = props.endStationId as number;
          const startStation = stations.features.find((sf) => sf.id === startId);
          const endStation = stations.features.find((sf) => sf.id === endId);
          const startStatus = startStation ? ((startStation.properties as Record<string, unknown>).status as number) : 0;
          const endStatus = endStation ? ((endStation.properties as Record<string, unknown>).status as number) : 0;
          const maxStatus = Math.max(startStatus, endStatus);
          return { ...f, properties: { ...props, maxStatus } };
        }),
      };
    }, [],
  );

  // 添加管段图层（默认可见，替代原 pipelines-layer）
  const addSegmentsLayer = useCallback((map: maplibregl.Map) => {
    if (!segmentsDataRef.current) return;
    if (map.getSource('segments')) return; // 已存在

    const st = useSensorStore.getState().stations;
    const enrichedData = computeSegmentStatuses(segmentsDataRef.current, st as unknown as GeoJSON.FeatureCollection | null);

    map.addSource('segments', {
      type: 'geojson',
      data: enrichedData,
    });

    // 管段光晕
    map.addLayer({
      id: 'segments-glow',
      type: 'line',
      source: 'segments',
      paint: {
        'line-color': [
          'match', ['get', 'maxStatus'],
          0, '#00bcd4',
          1, '#ffd54f',
          2, '#ff5252',
          '#00bcd4',
        ],
        'line-width': 10,
        'line-blur': 4,
        'line-opacity': 0.15,
      },
    });

    // 管段主线（默认可见，data-driven 着色）
    map.addLayer({
      id: 'segments-layer',
      type: 'line',
      source: 'segments',
      layout: {
        'visibility': 'visible',
      },
      paint: {
        'line-color': [
          'match', ['get', 'maxStatus'],
          0, '#00bcd4',
          1, '#ffd54f',
          2, '#ff5252',
          '#00bcd4',
        ],
        'line-width': 4,
        'line-opacity': 0.8,
        'line-dasharray': [0, 4, 3],
      },
    });

    // 告警管段（maxStatus=2，更快的流动虚线）
    map.addLayer({
      id: 'segments-alarm-layer',
      type: 'line',
      source: 'segments',
      filter: ['==', ['get', 'maxStatus'], 2],
      paint: {
        'line-color': '#ff5252',
        'line-width': 4,
        'line-opacity': 0.9,
        'line-dasharray': [0, 4, 3],
      },
    });
  }, [computeSegmentStatuses]);

  // 爆管模拟处理
  const handleBurstClick = useCallback((clickedSegmentId: number) => {
    const map = mapRef.current;
    const segments = segmentsDataRef.current;
    if (!map || !segments) return;

    // 找到点击管段的 sequenceOrder
    const clickedFeature = segments.features.find((f) => f.id === clickedSegmentId);
    if (!clickedFeature) return;
    const clickedOrder = (clickedFeature.properties as Record<string, unknown>).sequenceOrder as number;

    // 下游管段：sequenceOrder >= clickedOrder 的所有管段
    const downstreamFeatures = segments.features.filter((f) => {
      const order = (f.properties as Record<string, unknown>).sequenceOrder as number;
      return order >= clickedOrder;
    });

    // 清除旧的爆管效果
    if (burstPulseRef.current) clearInterval(burstPulseRef.current);
    ['burst-highlight-layer', 'burst-point-layer'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['burst-highlight', 'burst-point'].forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });

    // 添加高亮图层
    map.addSource('burst-highlight', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: downstreamFeatures as GeoJSON.Feature[] },
    });
    map.addLayer({
      id: 'burst-highlight-layer',
      type: 'line',
      source: 'burst-highlight',
      paint: {
        'line-color': '#ff5252',
        'line-width': 6,
        'line-opacity': 0.8,
      },
    });

    // 爆管点标记
    const clickedGeom = clickedFeature.geometry;
    const coords = clickedGeom.type === 'LineString'
      ? (clickedGeom.coordinates as number[][])[0]
      : clickedGeom.coordinates as number[];
    map.addSource('burst-point', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: coords },
        }],
      },
    });
    map.addLayer({
      id: 'burst-point-layer',
      type: 'circle',
      source: 'burst-point',
      paint: {
        'circle-radius': 12,
        'circle-color': '#ff5252',
        'circle-opacity': 0.6,
        'circle-blur': 0.5,
      },
    });

    // 红色脉冲动画
    burstPulseRef.current = setInterval(() => {
      if (!mapRef.current) return;
      burstPulseStateRef.current = !burstPulseStateRef.current;
      map.setPaintProperty('burst-highlight-layer', 'line-width', burstPulseStateRef.current ? 8 : 4);
      map.setPaintProperty('burst-highlight-layer', 'line-opacity', burstPulseStateRef.current ? 0.9 : 0.5);
      map.setPaintProperty('burst-point-layer', 'circle-radius', burstPulseStateRef.current ? 16 : 10);
    }, 400);

    // 显示影响范围的 Popup
    const affectedStationNames: string[] = [];
    const st = useSensorStore.getState().stations;
    downstreamFeatures.forEach((f) => {
      const props = f.properties as Record<string, unknown>;
      const endId = props.endStationId as number;
      const station = st?.features.find((sf) => sf.id === endId);
      if (station) {
        const name = (station.properties as Record<string, unknown>).name as string;
        if (!affectedStationNames.includes(name)) affectedStationNames.push(name);
      }
    });

    const popupContent = document.createElement('div');
    popupContent.className = 'sensor-popup';
    popupContent.style.minWidth = '200px';
    popupContent.innerHTML = `
      <div style="color:#ff5252;font-weight:bold;margin-bottom:6px;">爆管模拟</div>
      <div style="color:#b0bec5;font-size:12px;margin-bottom:4px;">影响站点（下游）：</div>
      <div style="color:#e2e8f0;font-size:12px;">${affectedStationNames.join('、')}</div>
      <div style="color:#78909c;font-size:11px;margin-top:6px;">点击"清除"取消模拟</div>
    `;
    new maplibregl.Popup({ closeButton: true, maxWidth: '280px', offset: 12 })
      .setLngLat(coords as [number, number])
      .setDOMContent(popupContent)
      .addTo(map);
  }, []);

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
        const [stationsData, pipelinesData, segmentsData] = await Promise.all([
          fetchStations(),
          fetchPipelines(),
          fetchSegments(),
        ]);

        setStations(stationsData);
        setPipelines(pipelinesData);
        segmentsDataRef.current = segmentsData as unknown as GeoJSON.FeatureCollection;

        addBusinessLayers(map, stationsData);
        addSegmentsLayer(map);
        startBlinkAnimation();
        startFlowAnimation();
        startAlarmFlowAnimation();

      } catch (err) {
        console.error('加载地图数据失败', err);
      }
    });

    // Tooltip 事件
    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
      // 测距模式不显示站点 tooltip
      if (useSensorStore.getState().measureActive) {
        if (tooltipRef.current) tooltipRef.current.classList.add('hidden');
        return;
      }
      const features = map.queryRenderedFeatures(e.point, { layers: ['stations-layer'] });
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
        if (!useSensorStore.getState().burstActive) map.getCanvas().style.cursor = '';
      }
    };

    const onMouseLeave = () => {
      if (tooltipRef.current) tooltipRef.current.classList.add('hidden');
      if (!useSensorStore.getState().measureActive && !useSensorStore.getState().burstActive) {
        map.getCanvas().style.cursor = '';
      }
    };

    map.on('mousemove', onMouseMove);
    map.on('mouseleave', onMouseLeave);

    // 爆管模式下鼠标悬浮管道高亮
    map.on('mousemove', 'segments-layer', (e) => {
      if (!useSensorStore.getState().burstActive) return;
      map.getCanvas().style.cursor = 'crosshair';
    });

    // 点击站点弹出 Popup（复用 openPopupForStation）
    map.on('click', 'stations-layer', (e) => {
      if (useSensorStore.getState().measureActive) return;
      if (!e.features || e.features.length === 0) return;
      const stationId = e.features[0].id as number;
      openPopupForStation(stationId);
    });

    // 爆管模拟：点击管段
    map.on('click', 'segments-layer', (e) => {
      if (!useSensorStore.getState().burstActive) return;
      if (!e.features || e.features.length === 0) return;
      const segmentId = e.features[0].id as number;
      handleBurstClick(segmentId);
    });

    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
      if (flowTimerRef.current) clearInterval(flowTimerRef.current);
      if (alarmFlowTimerRef.current) clearInterval(alarmFlowTimerRef.current);
      if (burstPulseRef.current) clearInterval(burstPulseRef.current);
      measureToolRef.current?.destroy();
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
      map.off('mousemove', onMouseMove);
      map.off('mouseleave', onMouseLeave);
      map.remove();
      mapRef.current = null;
    };
  }, [setStations, setPipelines, startBlinkAnimation, startFlowAnimation, startAlarmFlowAnimation, addSegmentsLayer, handleBurstClick, openPopupForStation]);

  // 监听站点数据变化 — 同步更新 segments 的 maxStatus
  useEffect(() => {
    if (!mapRef.current || !stations) return;
    const stationsSource = mapRef.current.getSource('stations') as maplibregl.GeoJSONSource;
    if (stationsSource) {
      stationsSource.setData(stations as unknown as GeoJSON.FeatureCollection);
    }
    // 同步更新 segments 数据
    if (segmentsDataRef.current) {
      const enriched = computeSegmentStatuses(
        segmentsDataRef.current,
        stations as unknown as GeoJSON.FeatureCollection,
      );
      const segmentsSource = mapRef.current.getSource('segments') as maplibregl.GeoJSONSource;
      if (segmentsSource) {
        segmentsSource.setData(enriched);
      }
    }
  }, [stations, computeSegmentStatuses]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
