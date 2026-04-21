package com.kanten.pipelinemonitor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanten.pipelinemonitor.dto.GeoJsonFeature;
import com.kanten.pipelinemonitor.dto.GeoJsonFeatureCollection;
import com.kanten.pipelinemonitor.mapper.PipelineSegmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 管道分段服务
 *
 * @author kanten
 * @since 2026-04-22
 */
@Service
@RequiredArgsConstructor
public class PipelineSegmentService {

    private final PipelineSegmentMapper pipelineSegmentMapper;
    private final ObjectMapper objectMapper;

    /**
     * 获取所有管段的 GeoJSON FeatureCollection
     */
    public GeoJsonFeatureCollection getSegmentsGeoJson() {
        List<Map<String, Object>> rows = pipelineSegmentMapper.selectAllWithGeoJson();
        List<GeoJsonFeature> features = rows.stream().map(row -> {
            try {
                Object geometry = objectMapper.readValue((String) row.get("geojson"), Object.class);
                return GeoJsonFeature.builder()
                        .type("Feature")
                        .id(row.get("id"))
                        .properties(Map.of(
                                "pipelineId", row.get("pipeline_id"),
                                "sequenceOrder", row.get("sequence_order"),
                                "startStationId", row.get("start_station_id"),
                                "endStationId", row.get("end_station_id")
                        ))
                        .geometry(geometry)
                        .build();
            } catch (Exception e) {
                throw new RuntimeException("解析管段 GeoJSON 失败", e);
            }
        }).toList();

        return GeoJsonFeatureCollection.builder()
                .features(features)
                .build();
    }
}
