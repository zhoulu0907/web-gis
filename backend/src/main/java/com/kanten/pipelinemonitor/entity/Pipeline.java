package com.kanten.pipelinemonitor.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 管道线实体
 *
 * @author kanten
 * @since 2026-04-21
 */
@Data
@Table(value = "p_pipeline")
public class Pipeline {

    @Id(keyType = KeyType.Auto)
    private Long id;

    /** 管道名称 */
    private String name;

    /** 起点站点ID */
    private Long startStationId;

    /** 终点站点ID */
    private Long endStationId;

    /** 管道走向 (EPSG:4326) - 不在实体中映射，通过 ST_AsGeoJSON 查询 */
    @Column(ignore = true)
    private String geom;

    private LocalDateTime createdAt;
}
