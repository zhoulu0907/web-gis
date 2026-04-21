package com.kanten.pipelinemonitor.service;

import com.kanten.pipelinemonitor.dto.SensorHistoryVO;
import com.kanten.pipelinemonitor.entity.SensorData;
import com.kanten.pipelinemonitor.entity.Station;
import com.kanten.pipelinemonitor.mapper.SensorDataMapper;
import com.kanten.pipelinemonitor.mapper.StationMapper;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 传感器历史数据服务
 *
 * @author kanten
 * @since 2026-04-21
 */
@Service
@RequiredArgsConstructor
public class SensorDataService {

    private final SensorDataMapper sensorDataMapper;
    private final StationMapper stationMapper;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 查询指定站点最近 N 分钟的历史数据
     */
    public SensorHistoryVO getHistory(Long stationId, int minutes) {
        Station station = stationMapper.selectOneById(stationId);

        LocalDateTime since = LocalDateTime.now().minusMinutes(minutes);
        List<SensorData> records = sensorDataMapper.selectListByQuery(
            QueryWrapper.create()
                .where("station_id = ?", stationId)
                .and("timestamp >= ?", since)
                .orderBy("timestamp ASC")
        );

        List<String> timestamps = new ArrayList<>();
        List<BigDecimal> pressures = new ArrayList<>();
        List<BigDecimal> flows = new ArrayList<>();

        for (SensorData r : records) {
            timestamps.add(r.getTimestamp().format(FORMATTER));
            pressures.add(r.getPressure());
            flows.add(r.getFlow());
        }

        return SensorHistoryVO.builder()
                .stationId(stationId)
                .stationName(station != null ? station.getName() : "")
                .timestamps(timestamps)
                .pressures(pressures)
                .flows(flows)
                .build();
    }
}
