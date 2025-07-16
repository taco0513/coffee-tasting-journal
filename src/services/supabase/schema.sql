-- Coffee Tasting Journal - Supabase Database Schema
-- Execute this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. TASTING_RECORDS TABLE
-- ==============================================

CREATE TABLE tasting_records (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  realm_id TEXT UNIQUE,  -- Maps to Realm's string ID
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Coffee Information
  cafe_name TEXT,
  roastery TEXT NOT NULL,
  coffee_name TEXT NOT NULL,
  origin TEXT,
  variety TEXT,
  altitude TEXT,
  process TEXT,
  temperature TEXT CHECK (temperature IN ('hot', 'ice')),
  
  -- Roaster Notes
  roaster_notes TEXT,
  
  -- Match Scores
  match_score_total INTEGER CHECK (match_score_total >= 0 AND match_score_total <= 100),
  match_score_flavor INTEGER CHECK (match_score_flavor >= 0 AND match_score_flavor <= 100),
  match_score_sensory INTEGER CHECK (match_score_sensory >= 0 AND match_score_sensory <= 100),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- Indexes for tasting_records
CREATE INDEX idx_tasting_records_user_id ON tasting_records(user_id);
CREATE INDEX idx_tasting_records_created_at ON tasting_records(created_at);
CREATE INDEX idx_tasting_records_realm_id ON tasting_records(realm_id);
CREATE INDEX idx_tasting_records_roastery ON tasting_records(roastery);
CREATE INDEX idx_tasting_records_coffee_name ON tasting_records(coffee_name);
CREATE INDEX idx_tasting_records_origin ON tasting_records(origin);
CREATE INDEX idx_tasting_records_is_deleted ON tasting_records(is_deleted);

-- ==============================================
-- 2. FLAVOR_NOTES TABLE
-- ==============================================

CREATE TABLE flavor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID REFERENCES tasting_records(id) ON DELETE CASCADE,
  
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  value TEXT NOT NULL,
  korean_value TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for flavor_notes
CREATE INDEX idx_flavor_notes_tasting_id ON flavor_notes(tasting_id);
CREATE INDEX idx_flavor_notes_level ON flavor_notes(level);
CREATE INDEX idx_flavor_notes_value ON flavor_notes(value);

-- ==============================================
-- 3. SENSORY_ATTRIBUTES TABLE
-- ==============================================

CREATE TABLE sensory_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID UNIQUE REFERENCES tasting_records(id) ON DELETE CASCADE,
  
  body INTEGER NOT NULL CHECK (body >= 1 AND body <= 5),
  acidity INTEGER NOT NULL CHECK (acidity >= 1 AND acidity <= 5),
  sweetness INTEGER NOT NULL CHECK (sweetness >= 1 AND sweetness <= 5),
  finish INTEGER NOT NULL CHECK (finish >= 1 AND finish <= 5),
  mouthfeel TEXT NOT NULL CHECK (mouthfeel IN ('Clean', 'Creamy', 'Juicy', 'Silky')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sensory_attributes
CREATE INDEX idx_sensory_attributes_tasting_id ON sensory_attributes(tasting_id);

-- ==============================================
-- 4. CAFE_INFO TABLE
-- ==============================================

CREATE TABLE cafe_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Cafe Information
  name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  
  -- Visit Statistics
  visit_count INTEGER DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  
  -- Unique constraint for user and cafe name
  UNIQUE(user_id, name)
);

-- Indexes for cafe_info
CREATE INDEX idx_cafe_info_user_id ON cafe_info(user_id);
CREATE INDEX idx_cafe_info_name ON cafe_info(name);
CREATE INDEX idx_cafe_info_visit_count ON cafe_info(visit_count);
CREATE INDEX idx_cafe_info_last_visit_at ON cafe_info(last_visit_at);
CREATE INDEX idx_cafe_info_is_deleted ON cafe_info(is_deleted);

-- ==============================================
-- 5. ROASTER_INFO TABLE
-- ==============================================

CREATE TABLE roaster_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Roaster Information
  name TEXT NOT NULL,
  location TEXT,
  website TEXT,
  notes TEXT,
  
  -- Visit Statistics
  visit_count INTEGER DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  
  -- Unique constraint for user and roaster name
  UNIQUE(user_id, name)
);

-- Indexes for roaster_info
CREATE INDEX idx_roaster_info_user_id ON roaster_info(user_id);
CREATE INDEX idx_roaster_info_name ON roaster_info(name);
CREATE INDEX idx_roaster_info_visit_count ON roaster_info(visit_count);
CREATE INDEX idx_roaster_info_last_visit_at ON roaster_info(last_visit_at);
CREATE INDEX idx_roaster_info_is_deleted ON roaster_info(is_deleted);

-- ==============================================
-- 6. SYNC_LOG TABLE (for debugging sync issues)
-- ==============================================

CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT NOT NULL,
  
  sync_type TEXT CHECK (sync_type IN ('upload', 'download', 'conflict')),
  entity_type TEXT CHECK (entity_type IN ('tasting', 'cafe', 'roaster', 'user_preferences')),
  entity_id TEXT,
  
  status TEXT CHECK (status IN ('success', 'failed', 'conflict_resolved')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sync_log
CREATE INDEX idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX idx_sync_log_created_at ON sync_log(created_at);
CREATE INDEX idx_sync_log_status ON sync_log(status);
CREATE INDEX idx_sync_log_entity_type ON sync_log(entity_type);

-- ==============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE tasting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE roaster_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasting_records
CREATE POLICY "Users can only access their own tasting records" ON tasting_records
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for flavor_notes
CREATE POLICY "Users can only access their own flavor notes" ON flavor_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tasting_records 
            WHERE tasting_records.id = flavor_notes.tasting_id 
            AND tasting_records.user_id = auth.uid()
        )
    );

-- RLS Policies for sensory_attributes
CREATE POLICY "Users can only access their own sensory attributes" ON sensory_attributes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tasting_records 
            WHERE tasting_records.id = sensory_attributes.tasting_id 
            AND tasting_records.user_id = auth.uid()
        )
    );

-- RLS Policies for cafe_info
CREATE POLICY "Users can only access their own cafe info" ON cafe_info
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for roaster_info
CREATE POLICY "Users can only access their own roaster info" ON roaster_info
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for sync_log
CREATE POLICY "Users can only access their own sync logs" ON sync_log
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- 8. TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tasting_records_updated_at BEFORE UPDATE ON tasting_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafe_info_updated_at BEFORE UPDATE ON cafe_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roaster_info_updated_at BEFORE UPDATE ON roaster_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 9. FUNCTIONS FOR COMMON OPERATIONS
-- ==============================================

-- Function to get user's tasting statistics
CREATE OR REPLACE FUNCTION get_user_tasting_stats(user_uuid UUID)
RETURNS TABLE (
    total_tastings BIGINT,
    favorite_roastery TEXT,
    favorite_origin TEXT,
    avg_match_score NUMERIC,
    last_tasting_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tastings,
        MODE() WITHIN GROUP (ORDER BY tr.roastery) as favorite_roastery,
        MODE() WITHIN GROUP (ORDER BY tr.origin) as favorite_origin,
        AVG(tr.match_score_total)::NUMERIC as avg_match_score,
        MAX(tr.created_at) as last_tasting_date
    FROM tasting_records tr
    WHERE tr.user_id = user_uuid 
    AND tr.is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment cafe visit count
CREATE OR REPLACE FUNCTION increment_cafe_visit(user_uuid UUID, cafe_name_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO cafe_info (user_id, name, visit_count, last_visit_at)
    VALUES (user_uuid, cafe_name_param, 1, NOW())
    ON CONFLICT (user_id, name) 
    DO UPDATE SET 
        visit_count = cafe_info.visit_count + 1,
        last_visit_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment roaster visit count
CREATE OR REPLACE FUNCTION increment_roaster_visit(user_uuid UUID, roaster_name_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO roaster_info (user_id, name, visit_count, last_visit_at)
    VALUES (user_uuid, roaster_name_param, 1, NOW())
    ON CONFLICT (user_id, name) 
    DO UPDATE SET 
        visit_count = roaster_info.visit_count + 1,
        last_visit_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 10. SAMPLE DATA (Optional - for testing)
-- ==============================================

-- Uncomment the following lines to insert sample data
-- Note: Replace 'your-user-id' with actual user ID from auth.users

/*
-- Insert sample tasting record
INSERT INTO tasting_records (
    user_id, realm_id, roastery, coffee_name, origin, variety, 
    process, temperature, roaster_notes, match_score_total, 
    match_score_flavor, match_score_sensory
) VALUES (
    'your-user-id', 'tasting_1234567890', 'Blue Bottle', 'Ethiopia Yirgacheffe', 
    'Ethiopia', 'Heirloom', 'Washed', 'hot', 'Bright citrus notes with floral finish', 
    85, 40, 45
);

-- Insert sample flavor notes
INSERT INTO flavor_notes (tasting_id, level, value, korean_value) VALUES 
    ((SELECT id FROM tasting_records WHERE realm_id = 'tasting_1234567890'), 1, 'Fruity', '과일'),
    ((SELECT id FROM tasting_records WHERE realm_id = 'tasting_1234567890'), 2, 'Citrus', '시트러스'),
    ((SELECT id FROM tasting_records WHERE realm_id = 'tasting_1234567890'), 3, 'Lemon', '레몬'),
    ((SELECT id FROM tasting_records WHERE realm_id = 'tasting_1234567890'), 4, 'Bright', '밝은');

-- Insert sample sensory attributes
INSERT INTO sensory_attributes (tasting_id, body, acidity, sweetness, finish, mouthfeel) VALUES 
    ((SELECT id FROM tasting_records WHERE realm_id = 'tasting_1234567890'), 3, 4, 3, 4, 'Clean');
*/