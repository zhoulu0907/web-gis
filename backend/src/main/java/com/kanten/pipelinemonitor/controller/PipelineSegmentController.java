package com.kanten.pipelinemonitor.controller;

import com.kanten.pipelinemonitor.dto.GeoJsonFeatureCollection;
import com.kanten.pipelinemonitor.service.PipelineSegmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管道分段控制器
 *
 * @author kanten
 * @since 2026-04-22
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PipelineSegmentController {

    private final PipelineSegmentService pipelineSegmentService;

    /**
     * 获取所有管段 GeoJSON 数据
     */
    @GetMapping("/pipeline/segments")
    public GeoJsonFeatureCollection getSegments() {
        return pipelineSegmentService.getSegmentsGeoJson();
    }
}
