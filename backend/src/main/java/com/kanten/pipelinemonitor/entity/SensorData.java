package com.kanten.pipelinemonitor.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 传感器数据实体
 *
 * @author kanten
 * @since 2026-04-21
 */
@Data
@Table(value = "p_sensor_data")
public class SensorData {

    @Id(keyType = KeyType.Auto)
    private Long id;

    /** 站点ID */
    private Long stationId;

    /** 压力 (MPa) */
    private BigDecimal pressure;

    /** 流量 (m³/h) */
    private BigDecimal flow;

    /** 状态: 0-正常 1-预警 2-告警 */
    private Integer status;

    /** 采集时间 */
    private LocalDateTime timestamp;
}
