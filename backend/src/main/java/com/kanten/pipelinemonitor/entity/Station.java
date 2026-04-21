package com.kanten.pipelinemonitor.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 监控站点实体
 *
 * @author kanten
 * @since 2026-04-21
 */
@Data
@Table(value = "p_station")
public class Station {

    @Id(keyType = KeyType.Auto)
    private Long id;

    /** 站点名称 */
    private String name;

    /** 站点类型: pump(泵站) / valve(阀室) */
    private String type;

    /** 最新状态: 0-正常 1-预警 2-告警 */
    private Integer status;

    /** 站点坐标 (EPSG:4326) - 不在实体中映射，通过 ST_AsGeoJSON 查询 */
    @Column(ignore = true)
    private String geom;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
