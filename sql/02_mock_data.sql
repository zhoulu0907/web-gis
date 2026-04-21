-- 石油管道监控系统 - 模拟数据初始化
-- 区域: 上海浦东新区 (外高桥 → 浦东机场方向)
-- 坐标来源: OpenStreetMap Nominatim 真实坐标

-- ============================================================
-- 站点数据 (9个站点: 5个泵站 + 4个阀室)
-- 坐标为各镇中心真实经纬度 (EPSG:4326)
-- ============================================================
INSERT INTO p_station (id, name, type, geom) VALUES
(1, '外高桥首站', 'pump',  ST_SetSRID(ST_MakePoint(121.5848, 31.3524), 4326)),
(2, '高桥阀室',   'valve', ST_SetSRID(ST_MakePoint(121.5548, 31.3534), 4326)),
(3, '金桥泵站',   'pump',  ST_SetSRID(ST_MakePoint(121.6071, 31.2682), 4326)),
(4, '张江阀室',   'valve', ST_SetSRID(ST_MakePoint(121.6102, 31.2073), 4326)),
(5, '唐镇泵站',   'pump',  ST_SetSRID(ST_MakePoint(121.6510, 31.2104), 4326)),
(6, '川沙阀室',   'valve', ST_SetSRID(ST_MakePoint(121.6937, 31.1888), 4326)),
(7, '祝桥泵站',   'pump',  ST_SetSRID(ST_MakePoint(121.7190, 31.1791), 4326)),
(8, '合庆阀室',   'valve', ST_SetSRID(ST_MakePoint(121.7190, 31.2395), 4326)),
(9, '浦东机场末站','pump',  ST_SetSRID(ST_MakePoint(121.8080, 31.1443), 4326));

-- 重置序列
SELECT setval('p_station_id_seq', (SELECT MAX(id) FROM p_station));

-- ============================================================
-- 管道数据 (浦东新区输油管线)
-- 沿各站点走向的控制点
-- ============================================================
INSERT INTO p_pipeline (id, name, start_station_id, end_station_id, geom) VALUES
(1, '浦东新区输油管线', 1, 9,
    ST_SetSRID(ST_MakeLine(ARRAY[
        ST_MakePoint(121.5848, 31.3524),
        ST_MakePoint(121.5548, 31.3534),
        ST_MakePoint(121.5800, 31.3100),
        ST_MakePoint(121.6071, 31.2682),
        ST_MakePoint(121.6102, 31.2073),
        ST_MakePoint(121.6510, 31.2104),
        ST_MakePoint(121.6937, 31.1888),
        ST_MakePoint(121.7190, 31.2395),
        ST_MakePoint(121.7190, 31.1791),
        ST_MakePoint(121.8080, 31.1443)
    ]), 4326)
);

-- 重置序列
SELECT setval('p_pipeline_id_seq', (SELECT MAX(id) FROM p_pipeline));

-- ============================================================
-- 初始传感器数据 (每个站点一条基准数据)
-- ============================================================
INSERT INTO p_sensor_data (station_id, pressure, flow, status, timestamp) VALUES
(1, 8.52, 125.30, 0, NOW()),
(2, 3.21, 124.80, 0, NOW()),
(3, 7.85, 123.50, 0, NOW()),
(4, 2.95, 122.10, 0, NOW()),
(5, 9.12, 121.60, 0, NOW()),
(6, 3.45, 120.90, 0, NOW()),
(7, 8.76, 119.80, 0, NOW()),
(8, 2.88, 118.50, 0, NOW()),
(9, 6.54, 117.20, 0, NOW());
