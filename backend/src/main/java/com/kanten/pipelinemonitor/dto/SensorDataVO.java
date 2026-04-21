package com.kanten.pipelinemonitor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 传感器数据推送 VO (WebSocket 广播格式)
 *
 * @author kanten
 * @since 2026-04-21
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorDataVO {

    /** 站点ID */
    private Long stationId;

    /** 站点名称 */
    private String stationName;

    /** 压力 (MPa) */
    private BigDecimal pressure;

    /** 流量 (m³/h) */
    private BigDecimal flow;

    /** 状态: 0-正常 1-预警 2-告警 */
    private Integer status;

    /** 采集时间 (ISO 格式) */
    private String timestamp;
}
