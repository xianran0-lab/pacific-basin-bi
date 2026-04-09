-- ============================================
-- Supabase Schema for HK Marine Data
-- ============================================

-- 船舶位置历史表
CREATE TABLE hk_vessel_positions (
  id SERIAL PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  imo_no TEXT,
  call_sign TEXT,
  ship_type TEXT NOT NULL,
  flag TEXT,
  location TEXT,
  arrival_time TIMESTAMP,
  atd_time TIMESTAMP,  -- 离港时间
  eta TIMESTAMP,       -- 预计到港
  last_port TEXT,
  last_berth TEXT,
  agent_name TEXT,
  status TEXT,         -- Approved, Departed, etc.
  data_source TEXT NOT NULL,  -- 'arrivals'|'expected'|'in_port'|'departures'
  recorded_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引优化查询
  CONSTRAINT unique_vessel_timestamp 
    UNIQUE (imo_no, call_sign, data_source, recorded_at)
);

-- 索引：按时间查询
CREATE INDEX idx_vessel_positions_recorded_at 
  ON hk_vessel_positions(recorded_at DESC);

-- 索引：按船舶查询历史
CREATE INDEX idx_vessel_positions_imo 
  ON hk_vessel_positions(imo_no, recorded_at DESC);

-- 索引：按类型查询（便于分析散货船）
CREATE INDEX idx_vessel_positions_type 
  ON hk_vessel_positions(ship_type, recorded_at DESC);

-- 索引：按数据源查询
CREATE INDEX idx_vessel_positions_source 
  ON hk_vessel_positions(data_source, recorded_at DESC);

-- ============================================
-- 港口流量统计（每日汇总）
-- ============================================

CREATE TABLE hk_port_daily_stats (
  date DATE PRIMARY KEY,
  total_arrivals INTEGER DEFAULT 0,
  total_departures INTEGER DEFAULT 0,
  total_in_port INTEGER DEFAULT 0,
  total_expected INTEGER DEFAULT 0,
  
  -- 按类型统计
  bulk_carriers INTEGER DEFAULT 0,
  container_ships INTEGER DEFAULT 0,
  tankers INTEGER DEFAULT 0,
  general_cargo INTEGER DEFAULT 0,
  others INTEGER DEFAULT 0,
  
  -- 分析指标
  avg_anchorage_time_hours FLOAT,
  peak_hour_traffic INTEGER,
  
  -- Baltic Index 关联（便于分析相关性）
  bdi_index INTEGER,
  bsi_index INTEGER,
  bhsi_index INTEGER,
  
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- 索引：时间序列查询
CREATE INDEX idx_port_stats_date 
  ON hk_port_daily_stats(date DESC);

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE hk_vessel_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hk_port_daily_stats ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取（前端展示用）
CREATE POLICY "Allow anonymous read vessel positions"
  ON hk_vessel_positions FOR SELECT
  TO anon USING (true);

CREATE POLICY "Allow anonymous read port stats"
  ON hk_port_daily_stats FOR SELECT
  TO anon USING (true);

-- 只允许服务账号写入（通过 Edge Function）
CREATE POLICY "Allow service role insert vessel positions"
  ON hk_vessel_positions FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role insert port stats"
  ON hk_port_daily_stats FOR INSERT
  TO service_role WITH CHECK (true);

-- ============================================
-- 视图：便于查询
-- ============================================

-- 当前在港散货船视图
CREATE VIEW current_bulk_carriers AS
SELECT 
  vessel_name,
  imo_no,
  call_sign,
  ship_type,
  flag,
  location,
  arrival_time,
  agent_name,
  recorded_at
FROM hk_vessel_positions
WHERE 
  data_source = 'in_port'
  AND ship_type ILIKE '%BULK%'
  AND recorded_at > NOW() - INTERVAL '2 hours'
ORDER BY arrival_time DESC;

-- 船舶停留时间分析视图
CREATE VIEW vessel_anchorage_analysis AS
SELECT 
  vessel_name,
  imo_no,
  ship_type,
  location,
  arrival_time,
  atd_time,
  CASE 
    WHEN atd_time IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (atd_time - arrival_time))/3600
    ELSE 
      EXTRACT(EPOCH FROM (NOW() - arrival_time))/3600
  END as anchorage_hours,
  data_source
FROM hk_vessel_positions
WHERE arrival_time IS NOT NULL
ORDER BY anchorage_hours DESC;

-- ============================================
-- 函数：获取港口实时状态
-- ============================================

CREATE OR REPLACE FUNCTION get_current_port_status()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'timestamp', NOW(),
    'total_in_port', (SELECT COUNT(*) FROM hk_vessel_positions 
                      WHERE data_source = 'in_port' 
                      AND recorded_at > NOW() - INTERVAL '2 hours'),
    'bulk_carriers', (SELECT COUNT(*) FROM hk_vessel_positions 
                      WHERE data_source = 'in_port' 
                      AND ship_type ILIKE '%BULK%'
                      AND recorded_at > NOW() - INTERVAL '2 hours'),
    'container_ships', (SELECT COUNT(*) FROM hk_vessel_positions 
                        WHERE data_source = 'in_port' 
                        AND ship_type ILIKE '%CONTAINER%'
                        AND recorded_at > NOW() - INTERVAL '2 hours'),
    'expected_arrivals', (SELECT COUNT(*) FROM hk_vessel_positions 
                          WHERE data_source = 'expected'
                          AND recorded_at > NOW() - INTERVAL '2 hours'),
    'recent_departures', (SELECT COUNT(*) FROM hk_vessel_positions 
                          WHERE data_source = 'departures'
                          AND atd_time > NOW() - INTERVAL '24 hours')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
