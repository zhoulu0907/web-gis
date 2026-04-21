package com.kanten.pipelinemonitor.controller;

import com.kanten.pipelinemonitor.dto.SensorHistoryVO;
import com.kanten.pipelinemonitor.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 传感器历史数据控制器
 *
 * @author kanten
 * @since 2026-04-21
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SensorDataController {

    private final SensorDataService sensorDataService;

    /**
     * 查询指定站点最近 N 分钟的历史数据
     */
    @GetMapping("/history/{stationId}")
    public SensorHistoryVO getHistory(
            @PathVariable Long stationId,
            @RequestParam(defaultValue = "5") int minutes) {
        return sensorDataService.getHistory(stationId, minutes);
    }
}
