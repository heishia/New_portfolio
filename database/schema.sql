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
  
  -- Metrics
  lines_of_code INT,
  commit_count INT,
  contributor_count INT DEFAULT 1,
  
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
