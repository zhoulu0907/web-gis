package com.kanten.pipelinemonitor.mapper;

import com.kanten.pipelinemonitor.entity.Pipeline;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 管道 Mapper
 *
 * @author kanten
 * @since 2026-04-21
 */
public interface PipelineMapper extends BaseMapper<Pipeline> {

    /**
     * 查询所有管道基本信息 + GeoJSON 文本
     */
    @Select("SELECT id, name, start_station_id, end_station_id, ST_AsGeoJSON(geom) as geojson FROM p_pipeline ORDER BY id")
    List<Map<String, Object>> selectAllWithGeoJson();
}
