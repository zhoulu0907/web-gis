package com.kanten.pipelinemonitor.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * GeoJSON Feature 对象
 *
 * @author kanten
 * @since 2026-04-21
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeoJsonFeature {

    /** 固定为 "Feature" */
    private String type;

    /** 要素ID */
    private Object id;

    /** 属性 */
    private Map<String, Object> properties;

    /** 几何对象 (GeoJSON Geometry) */
    private Object geometry;
}
