-- 石油管道监控系统 - 数据库建表脚本
-- 数据库: webgis (PostgreSQL 16 + PostGIS 3.4)

-- 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- 监控站点表
-- ============================================================
CREATE TABLE p_station (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(20)  NOT NULL,
    status      SMALLINT     NOT NULL DEFAULT 0,
    geom        GEOMETRY(POINT, 4326) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE p_station IS '监控站点';
COMMENT ON COLUMN p_station.name IS '站点名称';
COMMENT ON COLUMN p_station.type IS '站点类型: pump(泵站) / valve(阀室)';
COMMENT ON COLUMN p_station.status IS '最新状态: 0-正常 1-预警 2-告警';
COMMENT ON COLUMN p_station.geom IS '站点坐标 (EPSG:4326)';

CREATE INDEX idx_station_geom ON p_station USING GIST (geom);
CREATE INDEX idx_station_type ON p_station (type);
CREATE INDEX idx_station_status ON p_station (status);

-- ============================================================
-- 管道线表
-- ============================================================
CREATE TABLE p_pipeline (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    start_station_id BIGINT,
    end_station_id   BIGINT,
    geom             GEOMETRY(LINESTRING, 4326) NOT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE p_pipeline IS '管道线';
COMMENT ON COLUMN p_pipeline.name IS '管道名称';
COMMENT ON COLUMN p_pipeline.start_station_id IS '起点站点ID';
COMMENT ON COLUMN p_pipeline.end_station_id IS '终点站点ID';
COMMENT ON COLUMN p_pipeline.geom IS '管道走向 (EPSG:4326)';

CREATE INDEX idx_pipeline_geom ON p_pipeline USING GIST (geom);

-- ============================================================
-- 传感器数据表
-- ============================================================
CREATE TABLE p_sensor_data (
    id          BIGSERIAL PRIMARY KEY,
    station_id  BIGINT       NOT NULL,
    pressure    DECIMAL(6,2) NOT NULL,
    flow        DECIMAL(8,2) NOT NULL,
    status      SMALLINT     NOT NULL DEFAULT 0,
    timestamp   TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE p_sensor_data IS '传感器数据';
COMMENT ON COLUMN p_sensor_data.station_id IS '站点ID';
COMMENT ON COLUMN p_sensor_data.pressure IS '压力 (MPa)';
COMMENT ON COLUMN p_sensor_data.flow IS '流量 (m³/h)';
COMMENT ON COLUMN p_sensor_data.status IS '状态: 0-正常 1-预警 2-告警';
COMMENT ON COLUMN p_sensor_data.timestamp IS '采集时间';

CREATE INDEX idx_sensor_station_time ON p_sensor_data (station_id, timestamp DESC);
CREATE INDEX idx_sensor_status ON p_sensor_data (status);
