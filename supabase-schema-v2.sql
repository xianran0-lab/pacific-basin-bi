-- ============================================
-- Supabase Schema v2: Voyage-based Design
-- ============================================
-- 核心概念：一艘船 = 多个航次(Voyage)
-- 每个航次：Expected → Arrived → Departed (状态流转)

-- 船舶主表（去重，基本信息）
CREATE TABLE vessels (
  id SERIAL PRIMARY KEY,
  imo_no TEXT UNIQUE,
  call_sign TEXT,
  vessel_name TEXT NOT NULL,
  ship_type TEXT,
  flag TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 航次表（核心表，记录每次来港的完整流程）
CREATE TABLE voyages (
  id SERIAL PRIMARY KEY,
  
  -- 关联船舶（IMO优先，否则用船名+呼号）
  vessel_id INTEGER REFERENCES vessels(id),
  
  -- 航次标识（如果没有IMO，用船名+预计到达时间）
  voyage_key TEXT UNIQUE NOT NULL, -- 例如: "IMO1234567_2026-04-10T12:00"
  
  -- 船舶信息（快照，防止关联失败）
  imo_no TEXT,
  call_sign TEXT,
  vessel_name TEXT NOT NULL,
  ship_type TEXT,
  flag TEXT,
  
  -- 时间线（核心数据）
  eta TIMESTAMP,              -- 预计到港 (来自 expected XML)
  ata TIMESTAMP,              -- 实际到港 (来自 arrivals XML)
  atd TIMESTAMP,              -- 实际离港 (来自 departures XML)
  
  -- 位置信息
  last_port TEXT,             -- 上一港
  location TEXT,              -- 当前位置 (锚地/泊位)
  last_berth TEXT,            -- 最后泊位
  
  -- 代理和其他
  agent_name TEXT,
  status TEXT,                -- Approved, Departed 等
  
  -- 衍生指标（自动计算）
  anchorage_hours FLOAT,      -- 在港停留时间（小时）
  
  -- 数据追踪
  data_sources TEXT[],        -- ['expected', 'arrivals', 'departures']
  first_seen_at TIMESTAMP,    -- 首次记录时间
  last_updated_at TIMESTAMP,  -- 最后更新时间
  
  -- voyage_key 全局唯一（在 CREATE TABLE 外用 CREATE UNIQUE INDEX 添加部分唯一约束）
  UNIQUE (voyage_key)
);

-- 原始数据日志表（保留每次抓取的原始记录，用于调试和追溯）
CREATE TABLE raw_vessel_movements (
  id SERIAL PRIMARY KEY,
  voyage_id INTEGER REFERENCES voyages(id),
  
  -- 原始数据
  source_xml TEXT NOT NULL,      -- 'arrivals' | 'expected' | 'in_port' | 'departures'
  raw_data JSONB NOT NULL,       -- 原始XML解析后的完整数据
  
  -- 时间戳
  recorded_at TIMESTAMP DEFAULT NOW(),
  
  -- 用于快速查询
  vessel_name TEXT,
  imo_no TEXT,
  event_time TIMESTAMP           -- XML中的时间（ETA/ATA/ATD）
);

-- ============================================
-- 索引优化
-- ============================================

-- 航次查询优化
CREATE INDEX idx_voyages_vessel_id ON voyages(vessel_id);
CREATE INDEX idx_voyages_imo_no ON voyages(imo_no);
CREATE INDEX idx_voyages_time_range ON voyages(eta, ata, atd);
CREATE INDEX idx_voyages_last_updated ON voyages(last_updated_at DESC);

-- 活跃航次查询（在港或即将到港）
CREATE INDEX idx_voyages_active ON voyages(atd)
  WHERE atd IS NULL;

-- 同一艘船同一时间只能有一个未完成航次（部分唯一索引，不能写在 CREATE TABLE 里）
CREATE UNIQUE INDEX idx_voyages_unique_active ON voyages(imo_no)
  WHERE atd IS NULL AND imo_no IS NOT NULL;

-- 原始数据查询
CREATE INDEX idx_raw_movements_voyage ON raw_vessel_movements(voyage_id);
CREATE INDEX idx_raw_movements_recorded ON raw_vessel_movements(recorded_at DESC);

-- ============================================
-- 视图：便于查询
-- ============================================

-- 当前在港船舶（最新状态）
CREATE VIEW current_vessels_in_port AS
SELECT 
  v.*,
  voy.id as voyage_id,
  voy.voyage_key,
  voy.eta,
  voy.ata,
  voy.atd,
  voy.location,
  voy.agent_name,
  voy.anchorage_hours,
  EXTRACT(EPOCH FROM (NOW() - voy.ata))/3600 as hours_since_arrival
FROM voyages voy
JOIN vessels v ON voy.vessel_id = v.id
WHERE voy.atd IS NULL  -- 尚未离港
  AND (voy.ata IS NOT NULL OR voy.eta > NOW() - INTERVAL '24 hours')  -- 已到港或24小时内预计到
ORDER BY voy.ata DESC NULLS LAST;

-- 船舶历史航次统计
CREATE VIEW vessel_voyage_stats AS
SELECT 
  v.imo_no,
  v.vessel_name,
  v.ship_type,
  COUNT(voy.id) as total_voyages,
  MIN(voy.eta) as first_recorded_eta,
  MAX(voy.atd) as last_departure,
  AVG(voy.anchorage_hours) as avg_anchorage_hours,
  COUNT(voy.id) FILTER (WHERE voy.atd IS NULL) as active_voyages
FROM vessels v
LEFT JOIN voyages voy ON v.id = voy.vessel_id
GROUP BY v.id, v.imo_no, v.vessel_name, v.ship_type;

-- 每日港口流量统计（自动更新）
CREATE VIEW daily_port_stats AS
SELECT 
  DATE_TRUNC('day', COALESCE(ata, eta, atd)) as date,
  COUNT(*) FILTER (WHERE ata IS NOT NULL AND DATE(ata) = DATE(COALESCE(ata, eta, atd))) as arrivals,
  COUNT(*) FILTER (WHERE atd IS NOT NULL AND DATE(atd) = DATE(COALESCE(ata, eta, atd))) as departures,
  COUNT(*) FILTER (WHERE ata IS NOT NULL AND atd IS NULL) as in_port_at_end_of_day,
  COUNT(*) FILTER (WHERE ship_type ILIKE '%bulk%') as bulk_carriers,
  AVG(anchorage_hours) FILTER (WHERE anchorage_hours IS NOT NULL) as avg_stay_hours
FROM voyages
GROUP BY DATE_TRUNC('day', COALESCE(ata, eta, atd))
ORDER BY date DESC;

-- ============================================
-- 函数：自动计算停留时间
-- ============================================

CREATE OR REPLACE FUNCTION calculate_anchorage_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果已有到达和离港时间，计算停留时间
  IF NEW.ata IS NOT NULL AND NEW.atd IS NOT NULL THEN
    NEW.anchorage_hours := EXTRACT(EPOCH FROM (NEW.atd - NEW.ata))/3600;
  -- 如果只有到达时间，计算到目前为止的停留时间
  ELSIF NEW.ata IS NOT NULL AND NEW.atd IS NULL THEN
    NEW.anchorage_hours := EXTRACT(EPOCH FROM (NOW() - NEW.ata))/3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_anchorage_hours
  BEFORE INSERT OR UPDATE ON voyages
  FOR EACH ROW
  EXECUTE FUNCTION calculate_anchorage_hours();

-- ============================================
-- 辅助函数：向数组追加元素（去重）
-- ============================================

CREATE OR REPLACE FUNCTION array_append_unique(arr TEXT[], val TEXT)
RETURNS TEXT[] AS $$
BEGIN
  IF val = ANY(arr) THEN
    RETURN arr;
  END IF;
  RETURN array_append(arr, val);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 函数：合并或更新航次（核心逻辑）
-- ============================================

CREATE OR REPLACE FUNCTION upsert_voyage(
  p_imo_no TEXT,
  p_call_sign TEXT,
  p_vessel_name TEXT,
  p_ship_type TEXT,
  p_flag TEXT,
  p_eta TIMESTAMP,
  p_ata TIMESTAMP,
  p_atd TIMESTAMP,
  p_location TEXT,
  p_last_port TEXT,
  p_last_berth TEXT,
  p_agent_name TEXT,
  p_status TEXT,
  p_source_xml TEXT,
  p_raw_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_vessel_id INTEGER;
  v_voyage_id INTEGER;
  v_voyage_key TEXT;
  v_existing_voyage_id INTEGER;
BEGIN
  -- 1. 确保船舶存在（去重逻辑：IMO优先，否则用船名+呼号）
  SELECT id INTO v_vessel_id 
  FROM vessels 
  WHERE imo_no = p_imo_no OR (vessel_name = p_vessel_name AND call_sign = p_call_sign);
  
  IF v_vessel_id IS NULL THEN
    INSERT INTO vessels (imo_no, call_sign, vessel_name, ship_type, flag)
    VALUES (p_imo_no, p_call_sign, p_vessel_name, p_ship_type, p_flag)
    RETURNING id INTO v_vessel_id;
  END IF;
  
  -- 2. 生成航次标识
  -- 策略：用ETA（预计时间）作为航次标识，因为一艘船不能同时有两个预计到港时间
  IF p_imo_no IS NOT NULL THEN
    v_voyage_key := p_imo_no || '_' || COALESCE(p_eta::TEXT, p_ata::TEXT, p_atd::TEXT);
  ELSE
    v_voyage_key := p_vessel_name || '_' || COALESCE(p_eta::TEXT, p_ata::TEXT, p_atd::TEXT);
  END IF;
  
  -- 3. 检查是否已存在该航次
  SELECT id INTO v_existing_voyage_id 
  FROM voyages 
  WHERE voyage_key = v_voyage_key;
  
  -- 4. 插入或更新航次
  IF v_existing_voyage_id IS NULL THEN
    -- 新航次
    INSERT INTO voyages (
      vessel_id, voyage_key, imo_no, call_sign, vessel_name, ship_type, flag,
      eta, ata, atd, location, last_port, last_berth, agent_name, status,
      data_sources, first_seen_at, last_updated_at
    ) VALUES (
      v_vessel_id, v_voyage_key, p_imo_no, p_call_sign, p_vessel_name, p_ship_type, p_flag,
      p_eta, p_ata, p_atd, p_location, p_last_port, p_last_berth, p_agent_name, p_status,
      ARRAY[p_source_xml], NOW(), NOW()
    )
    RETURNING id INTO v_voyage_id;
  ELSE
    -- 更新现有航次（合并新数据）
    UPDATE voyages SET
      vessel_id = COALESCE(vessel_id, v_vessel_id),
      imo_no = COALESCE(imo_no, p_imo_no),
      call_sign = COALESCE(call_sign, p_call_sign),
      ship_type = COALESCE(ship_type, p_ship_type),
      flag = COALESCE(flag, p_flag),
      -- 时间取最新值（非空优先）
      eta = COALESCE(p_eta, eta),
      ata = COALESCE(p_ata, ata),
      atd = COALESCE(p_atd, atd),
      location = COALESCE(p_location, location),
      last_port = COALESCE(p_last_port, last_port),
      last_berth = COALESCE(p_last_berth, last_berth),
      agent_name = COALESCE(p_agent_name, agent_name),
      status = COALESCE(p_status, status),
      -- 数据源追加
      data_sources = array_append_unique(data_sources, p_source_xml),
      last_updated_at = NOW()
    WHERE id = v_existing_voyage_id
    RETURNING id INTO v_voyage_id;
  END IF;
  
  -- 5. 记录原始数据
  INSERT INTO raw_vessel_movements (
    voyage_id, source_xml, raw_data, vessel_name, imo_no, event_time
  ) VALUES (
    v_voyage_id, p_source_xml, p_raw_data, p_vessel_name, p_imo_no,
    COALESCE(p_eta, p_ata, p_atd)
  );
  
  RETURN v_voyage_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 安全设置
-- ============================================

ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE voyages ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_vessel_movements ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取
CREATE POLICY "Allow read vessels" ON vessels FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read voyages" ON voyages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read raw" ON raw_vessel_movements FOR SELECT TO anon USING (true);

-- 只允许服务角色写入
CREATE POLICY "Allow service insert vessels" ON vessels FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service insert voyages" ON voyages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service insert raw" ON raw_vessel_movements FOR ALL TO service_role USING (true) WITH CHECK (true);
