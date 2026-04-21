package com.kanten.pipelinemonitor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kanten.pipelinemonitor.dto.SensorDataVO;
import com.kanten.pipelinemonitor.entity.Station;
import com.kanten.pipelinemonitor.mapper.SensorDataMapper;
import com.kanten.pipelinemonitor.mapper.StationMapper;
import com.kanten.pipelinemonitor.websocket.SensorWebSocketHandler;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

/**
 * 传感器数据模拟服务
 * 每 5 秒生成一次全站模拟数据并通过 WebSocket 广播
 *
 * @author kanten
 * @since 2026-04-21
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SensorSimulatorService {

    private final StationMapper stationMapper;
    private final SensorDataMapper sensorDataMapper;
    private final SensorWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;

    private final Random random = new Random();
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 每 5 秒模拟一次全站传感器数据
     */
    @Scheduled(fixedRate = 5000)
    public void simulateAndBroadcast() {
        try {
            List<Station> stations = stationMapper.selectAll();
            if (stations.isEmpty()) {
                return;
            }

            for (Station station : stations) {
                SensorDataVO vo = generateSensorData(station);

                // 更新站点最新状态
                station.setStatus(vo.getStatus());
                station.setUpdatedAt(LocalDateTime.now());
                stationMapper.update(station);

                // 通过 WebSocket 广播
                String json = objectMapper.writeValueAsString(vo);
                webSocketHandler.broadcast(json);
            }

            log.debug("传感器数据模拟完成，共 {} 个站点", stations.size());
        } catch (Exception e) {
            log.error("传感器数据模拟失败", e);
        }
    }

    /**
     * 根据站点类型生成模拟传感器数据
     * 泵站: 压力 6-10 MPa, 阀室: 压力 2-4 MPa
     * 状态分布: 90% 正常, 8% 预警, 2% 告警
     */
    private SensorDataVO generateSensorData(Station station) {
        boolean isPump = "pump".equals(station.getType());

        // 压力: 泵站 6-10, 阀室 2-4
        double pressureBase = isPump ? 8.0 : 3.0;
        double pressureRange = isPump ? 2.0 : 1.0;
        BigDecimal pressure = BigDecimal.valueOf(
                pressureBase + (random.nextDouble() - 0.5) * pressureRange * 2
        ).setScale(2, java.math.RoundingMode.HALF_UP);

        // 流量: 100-130 m³/h
        BigDecimal flow = BigDecimal.valueOf(
                115 + (random.nextDouble() - 0.5) * 30
        ).setScale(2, java.math.RoundingMode.HALF_UP);

        // 状态: 90% 正常, 8% 预警, 2% 告警
        int status;
        double rand = random.nextDouble();
        if (rand < 0.02) {
            status = 2; // 告警
        } else if (rand < 0.10) {
            status = 1; // 预警
        } else {
            status = 0; // 正常
        }

        return SensorDataVO.builder()
                .stationId(station.getId())
                .stationName(station.getName())
                .pressure(pressure)
                .flow(flow)
                .status(status)
                .timestamp(LocalDateTime.now().format(FORMATTER))
                .build();
    }
}
