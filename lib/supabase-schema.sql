-- ════════════════════════════════════════════
-- Diary — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ════════════════════════════════════════════

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  passcode TEXT NOT NULL DEFAULT '030306',
  hint1 TEXT NOT NULL DEFAULT 'First digit of this year',
  hint2 TEXT NOT NULL DEFAULT 'March month number',
  hint3 TEXT NOT NULL DEFAULT 'Day we first spoke — 3rd',
  hint4 TEXT NOT NULL DEFAULT 'Our favourite number',
  hint5 TEXT NOT NULL DEFAULT 'Six, for six letters in your name',
  hint6 TEXT NOT NULL DEFAULT 'Number of times I rewrote this',
  admin_password TEXT NOT NULL DEFAULT 'admin123',
  book_title TEXT NOT NULL DEFAULT 'Diary',
  book_subtitle TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  pages_viewed INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  replied BOOLEAN DEFAULT FALSE
);

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Allow public read for settings and chapters
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (true);

-- Allow public insert/update for visitors
CREATE POLICY "Public insert visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update visitors" ON visitors FOR UPDATE USING (true);

-- Allow public insert for replies
CREATE POLICY "Public insert replies" ON replies FOR INSERT WITH CHECK (true);

-- Admin policies (via service role key — handled server-side)
CREATE POLICY "Service full access settings" ON settings USING (true) WITH CHECK (true);
CREATE POLICY "Service full access chapters" ON chapters USING (true) WITH CHECK (true);
CREATE POLICY "Service read visitors" ON visitors FOR SELECT USING (true);
CREATE POLICY "Service read replies" ON replies FOR SELECT USING (true);

-- Storage buckets (run these in Supabase dashboard > Storage)
-- Bucket: cover-image (public)
-- Bucket: background-photos (public)
-- Bucket: chapter-photos (public)
