package com.kanten.pipelinemonitor.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

/**
 * 管道分段实体（按站点拆分）
 *
 * @author kanten
 * @since 2026-04-22
 */
@Data
@Table(value = "p_pipeline_segment")
public class PipelineSegment {

    @Id(keyType = KeyType.Auto)
    private Long id;

    /** 所属管线ID */
    private Long pipelineId;

    /** 顺序编号（从上游到下游） */
    private Integer sequenceOrder;

    /** 起点站点ID */
    private Long startStationId;

    /** 终点站点ID */
    private Long endStationId;

    /** 管段走向 (EPSG:4326) - 通过 ST_AsGeoJSON 查询 */
    @Column(ignore = true)
    private String geom;
}
