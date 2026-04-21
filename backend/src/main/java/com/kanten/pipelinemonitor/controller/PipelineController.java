package com.kanten.pipelinemonitor.controller;

import com.kanten.pipelinemonitor.dto.GeoJsonFeatureCollection;
import com.kanten.pipelinemonitor.service.PipelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管道控制器
 * 提供管道 GeoJSON 数据查询接口
 *
 * @author kanten
 * @since 2026-04-21
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    /**
     * 获取所有管道 GeoJSON 数据
     */
    @GetMapping("/pipelines")
    public GeoJsonFeatureCollection getPipelines() {
        return pipelineService.getPipelinesGeoJson();
    }
}
