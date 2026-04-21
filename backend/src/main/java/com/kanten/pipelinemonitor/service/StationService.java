package com.kanten.pipelinemonitor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanten.pipelinemonitor.dto.GeoJsonFeature;
import com.kanten.pipelinemonitor.dto.GeoJsonFeatureCollection;
import com.kanten.pipelinemonitor.mapper.StationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 站点服务
 *
 * @author kanten
 * @since 2026-04-21
 */
@Service
@RequiredArgsConstructor
public class StationService {

    private final StationMapper stationMapper;
    private final ObjectMapper objectMapper;

    /**
     * 获取所有站点的 GeoJSON FeatureCollection
     * 从数据库查询文本格式的 GeoJSON，解析后组装为标准对象
     */
    public GeoJsonFeatureCollection getStationsGeoJson() {
        List<Map<String, Object>> rows = stationMapper.selectAllWithGeoJson();
        List<GeoJsonFeature> features = rows.stream().map(row -> {
            try {
                Object geometry = objectMapper.readValue((String) row.get("geojson"), Object.class);
                return GeoJsonFeature.builder()
                        .type("Feature")
                        .id(row.get("id"))
                        .properties(Map.of(
                                "name", row.get("name"),
                                "type", row.get("type"),
                                "status", row.get("status")
                        ))
                        .geometry(geometry)
                        .build();
            } catch (Exception e) {
                throw new RuntimeException("解析站点 GeoJSON 失败", e);
            }
        }).toList();

        return GeoJsonFeatureCollection.builder()
                .features(features)
                .build();
    }
}
