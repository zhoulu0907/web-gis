/**
 * 创建 ECharts 折线图配置
 * 深色主题：双 Y 轴（压力/流量），科技蓝+警告黄配色
 */
export function createTrendChartOption(
  stationName: string,
  timestamps: string[],
  pressures: number[],
  flows: number[],
) {
  return {
    backgroundColor: 'transparent',
    title: {
      text: stationName + ' - 趋势',
      textStyle: { color: '#00e5ff', fontSize: 13, fontWeight: 'bold' },
      left: 'center',
      top: 4,
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(0,21,41,0.9)',
      borderColor: 'rgba(0,160,233,0.4)',
      textStyle: { color: '#e2e8f0', fontSize: 11 },
    },
    legend: {
      data: ['压力 (MPa)', '流量 (m³/h)'],
      textStyle: { color: '#b0bec5', fontSize: 10 },
      top: 26,
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: {
      top: 52,
      left: 40,
      right: 40,
      bottom: 24,
    },
    xAxis: {
      type: 'category' as const,
      data: timestamps.map((t) => t.substring(11)), // 只显示 HH:mm:ss
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 9, rotate: 30 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '压力',
        nameTextStyle: { color: '#94a3b8', fontSize: 10 },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)' } },
      },
      {
        type: 'value' as const,
        name: '流量',
        nameTextStyle: { color: '#94a3b8', fontSize: 10 },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '压力 (MPa)',
        type: 'line' as const,
        yAxisIndex: 0,
        data: pressures,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#00e5ff', width: 2 },
        itemStyle: { color: '#00e5ff' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,229,255,0.3)' },
              { offset: 1, color: 'rgba(0,229,255,0.02)' },
            ],
          },
        },
      },
      {
        name: '流量 (m³/h)',
        type: 'line' as const,
        yAxisIndex: 1,
        data: flows,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#f59e0b', width: 2 },
        itemStyle: { color: '#f59e0b' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245,158,11,0.3)' },
              { offset: 1, color: 'rgba(245,158,11,0.02)' },
            ],
          },
        },
      },
    ],
  };
}
