package com.kanten.pipelinemonitor.mapper;

import com.kanten.pipelinemonitor.entity.PipelineSegment;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 管道分段 Mapper
 *
 * @author kanten
 * @since 2026-04-22
 */
public interface PipelineSegmentMapper extends BaseMapper<PipelineSegment> {

    /**
     * 查询所有管段基本信息 + GeoJSON 文本，按顺序排列
     */
    @Select("SELECT id, pipeline_id, sequence_order, start_station_id, end_station_id, " +
            "ST_AsGeoJSON(geom) as geojson FROM p_pipeline_segment ORDER BY pipeline_id, sequence_order")
    List<Map<String, Object>> selectAllWithGeoJson();
}
