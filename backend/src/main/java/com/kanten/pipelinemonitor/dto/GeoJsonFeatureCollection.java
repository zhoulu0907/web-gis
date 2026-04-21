package com.kanten.pipelinemonitor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * GeoJSON FeatureCollection 对象
 *
 * @author kanten
 * @since 2026-04-21
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoJsonFeatureCollection {

    /** 固定为 "FeatureCollection" */
    private final String type = "FeatureCollection";

    /** Feature 列表 */
    private List<GeoJsonFeature> features;
}
