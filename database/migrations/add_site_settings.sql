-- Site Settings 테이블 마이그레이션
-- Run this on production database

-- ============================================
-- Site Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON site_settings(key);

COMMENT ON TABLE site_settings IS 'Site-wide settings and configurations';

-- Insert default SNS settings (skip if already exists)
INSERT INTO site_settings (key, value, description) VALUES
  ('sns_threads', 'https://www.threads.com/@kimppopp_', 'Threads 프로필 URL'),
  ('sns_youtube', 'https://youtube.com/channel/UChcNdaptFGcQC7wmUjKfOHQ/', 'YouTube 채널 URL'),
  ('sns_github', 'https://github.com/heishia', 'GitHub 프로필 URL'),
  ('sns_linkedin', '', 'LinkedIn 프로필 URL'),
  ('contact_email', 'bluejin1130@gmail.com', '연락처 이메일')
ON CONFLICT (key) DO NOTHING;
