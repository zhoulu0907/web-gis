-- 管道分段表：将浦东管线按 9 个站点拆分为 8 段
-- 用于爆管模拟的拓扑分析

CREATE TABLE IF NOT EXISTS p_pipeline_segment (
    id               BIGSERIAL PRIMARY KEY,
    pipeline_id      BIGINT       NOT NULL,
    sequence_order   INT          NOT NULL,
    start_station_id BIGINT       NOT NULL,
    end_station_id   BIGINT       NOT NULL,
    geom             GEOMETRY(LINESTRING, 4326) NOT NULL
);

COMMENT ON TABLE p_pipeline_segment IS '管道分段（按站点拆分）';
COMMENT ON COLUMN p_pipeline_segment.pipeline_id IS '所属管线ID';
COMMENT ON COLUMN p_pipeline_segment.sequence_order IS '顺序编号（从上游到下游）';
COMMENT ON COLUMN p_pipeline_segment.start_station_id IS '起点站点ID';
COMMENT ON COLUMN p_pipeline_segment.end_station_id IS '终点站点ID';
COMMENT ON COLUMN p_pipeline_segment.geom IS '管段走向 (EPSG:4326)';

-- 8 段数据：按站点顺序从上游（外高桥首站）到下游（浦东机场末站）
INSERT INTO p_pipeline_segment (pipeline_id, sequence_order, start_station_id, end_station_id, geom) VALUES
(1, 1, 1, 2, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.5848, 31.3524),
    ST_MakePoint(121.5548, 31.3534)
]), 4326)),
(1, 2, 2, 3, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.5548, 31.3534),
    ST_MakePoint(121.5800, 31.3100),
    ST_MakePoint(121.6071, 31.2682)
]), 4326)),
(1, 3, 3, 4, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.6071, 31.2682),
    ST_MakePoint(121.6102, 31.2073)
]), 4326)),
(1, 4, 4, 5, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.6102, 31.2073),
    ST_MakePoint(121.6510, 31.2104)
]), 4326)),
(1, 5, 5, 6, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.6510, 31.2104),
    ST_MakePoint(121.6937, 31.1888)
]), 4326)),
(1, 6, 6, 7, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.6937, 31.1888),
    ST_MakePoint(121.7190, 31.2395),
    ST_MakePoint(121.7190, 31.1791)
]), 4326)),
(1, 7, 7, 8, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.7190, 31.1791),
    ST_MakePoint(121.7190, 31.2395)
]), 4326)),
(1, 8, 8, 9, ST_SetSRID(ST_MakeLine(ARRAY[
    ST_MakePoint(121.7190, 31.2395),
    ST_MakePoint(121.8080, 31.1443)
]), 4326));

SELECT setval('p_pipeline_segment_id_seq', (SELECT MAX(id) FROM p_pipeline_segment));
