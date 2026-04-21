package com.kanten.pipelinemonitor.controller;

import com.kanten.pipelinemonitor.dto.GeoJsonFeatureCollection;
import com.kanten.pipelinemonitor.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 站点控制器
 * 提供站点 GeoJSON 数据查询接口
 *
 * @author kanten
 * @since 2026-04-21
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    /**
     * 获取所有站点 GeoJSON 数据
     */
    @GetMapping("/stations")
    public GeoJsonFeatureCollection getStations() {
        return stationService.getStationsGeoJson();
    }
}
