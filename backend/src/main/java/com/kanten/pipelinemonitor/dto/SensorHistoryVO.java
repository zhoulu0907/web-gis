package com.kanten.pipelinemonitor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 传感器历史数据 VO (ECharts 直接可用的分离数组格式)
 *
 * @author kanten
 * @since 2026-04-21
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorHistoryVO {

    /** 站点ID */
    private Long stationId;

    /** 站点名称 */
    private String stationName;

    /** 时间戳数组 */
    private List<String> timestamps;

    /** 压力数组 (MPa) */
    private List<BigDecimal> pressures;

    /** 流量数组 (m³/h) */
    private List<BigDecimal> flows;
}
