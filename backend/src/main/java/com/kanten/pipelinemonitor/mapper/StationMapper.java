package com.kanten.pipelinemonitor.mapper;

import com.kanten.pipelinemonitor.entity.Station;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 站点 Mapper
 *
 * @author kanten
 * @since 2026-04-21
 */
public interface StationMapper extends BaseMapper<Station> {

    /**
     * 查询所有站点基本信息 + GeoJSON 文本
     * 返回 Map 列表，Service 层负责组装 GeoJSON 对象
     */
    @Select("SELECT id, name, type, status, ST_AsGeoJSON(geom) as geojson FROM p_station ORDER BY id")
    List<Map<String, Object>> selectAllWithGeoJson();
}
