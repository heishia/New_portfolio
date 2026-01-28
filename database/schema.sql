-- Portfolio Database Schema
-- Run this script to initialize the database

-- Drop existing table if exists (for clean setup)
DROP TABLE IF EXISTS repositories;

-- Main repositories table
CREATE TABLE repositories (
  -- GitHub basic info
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  html_url TEXT NOT NULL,
  language TEXT,
  stargazers_count INT DEFAULT 0,
  topics TEXT[],
  github_created_at TIMESTAMPTZ,
  github_updated_at TIMESTAMPTZ,
  
  -- Custom metadata from portfolio/meta.json
  title TEXT,
  subtitle TEXT,
  project_type TEXT[],
  detailed_description TEXT,
  features JSONB DEFAULT '[]',
  technologies JSONB DEFAULT '[]',
  screenshots JSONB DEFAULT '[]',
  challenges TEXT,
  achievements TEXT,
  priority INT DEFAULT 0,
  roles JSONB DEFAULT '[]',
  client_name TEXT,
  status TEXT DEFAULT 'completed',
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT false,
  demo_url TEXT,
  documentation_url TEXT,
  
  -- Metrics (from GitHub API or meta.json override)
  lines_of_code INT,
  commit_count INT,
  contributor_count INT DEFAULT 1,
  languages JSONB DEFAULT '{}',  -- Language breakdown (language -> bytes)
  
  -- Cache management
  has_portfolio_meta BOOLEAN DEFAULT false,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_repos_priority ON repositories(priority DESC);
CREATE INDEX idx_repos_cached_at ON repositories(cached_at);
CREATE INDEX idx_repos_has_meta ON repositories(has_portfolio_meta);
CREATE INDEX idx_repos_status ON repositories(status);

-- Comment for documentation
COMMENT ON TABLE repositories IS 'Cached GitHub repositories with custom portfolio metadata';
COMMENT ON COLUMN repositories.has_portfolio_meta IS 'True if repo has portfolio/meta.json';
COMMENT ON COLUMN repositories.cached_at IS 'Last time this record was updated from GitHub';


-- ============================================
-- Admin Users Table
-- ============================================
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_email ON admin_users(email);

COMMENT ON TABLE admin_users IS 'Admin users for dashboard access';


-- ============================================
-- Admin Sessions Table
-- ============================================
DROP TABLE IF EXISTS admin_sessions CASCADE;

CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_token ON admin_sessions(token);
CREATE INDEX idx_session_expires ON admin_sessions(expires_at);

COMMENT ON TABLE admin_sessions IS 'Admin user sessions for authentication';


-- ============================================
-- Analytics Tables
-- ============================================

-- Page Views
DROP TABLE IF EXISTS page_views CASCADE;

CREATE TABLE page_views (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  visitor_id VARCHAR(64) NOT NULL,
  page_url TEXT NOT NULL,
  page_title VARCHAR(500),
  referrer TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  screen_width INT,
  screen_height INT,
  country VARCHAR(2),
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pv_session ON page_views(session_id);
CREATE INDEX idx_pv_visitor ON page_views(visitor_id);
CREATE INDEX idx_pv_created ON page_views(created_at);

COMMENT ON TABLE page_views IS 'Analytics page view tracking';


-- Sessions
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
  id VARCHAR(64) PRIMARY KEY,
  visitor_id VARCHAR(64) NOT NULL,
  entry_page TEXT NOT NULL,
  exit_page TEXT,
  page_views INT DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  is_bounce BOOLEAN DEFAULT TRUE,
  utm_source VARCHAR(200),
  utm_medium VARCHAR(200),
  utm_campaign VARCHAR(200)
);

CREATE INDEX idx_sess_visitor ON sessions(visitor_id);
CREATE INDEX idx_sess_started ON sessions(started_at);
CREATE INDEX idx_sess_bounce ON sessions(is_bounce);

COMMENT ON TABLE sessions IS 'Analytics visitor sessions';


-- Analytics Events
DROP TABLE IF EXISTS analytics_events CASCADE;

CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  visitor_id VARCHAR(64) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evt_session ON analytics_events(session_id);
CREATE INDEX idx_evt_name ON analytics_events(event_name);
CREATE INDEX idx_evt_created ON analytics_events(created_at);

COMMENT ON TABLE analytics_events IS 'Analytics custom events tracking';


-- ============================================
-- Site Settings Table
-- ============================================
DROP TABLE IF EXISTS site_settings CASCADE;

CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON site_settings(key);

COMMENT ON TABLE site_settings IS 'Site-wide settings and configurations';

-- Insert default SNS settings
INSERT INTO site_settings (key, value, description) VALUES
  ('sns_threads', 'https://www.threads.com/@kimppopp_', 'Threads 프로필 URL'),
  ('sns_youtube', 'https://youtube.com/channel/UChcNdaptFGcQC7wmUjKfOHQ/', 'YouTube 채널 URL'),
  ('sns_github', 'https://github.com/heishia', 'GitHub 프로필 URL'),
  ('sns_linkedin', '', 'LinkedIn 프로필 URL'),
  ('contact_email', 'bluejin1130@gmail.com', '연락처 이메일')
ON CONFLICT (key) DO NOTHING;


-- ============================================
-- Project Requests Table
-- ============================================
DROP TABLE IF EXISTS project_requests CASCADE;

CREATE TABLE project_requests (
  id SERIAL PRIMARY KEY,
  output_type VARCHAR(50) NOT NULL,
  output_other TEXT,
  features TEXT,
  idea TEXT,
  -- Contact information
  contact_name VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  budget VARCHAR(100),
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pr_status ON project_requests(status);
CREATE INDEX idx_pr_created ON project_requests(created_at);

COMMENT ON TABLE project_requests IS 'Project request submissions from Start a Project form';
