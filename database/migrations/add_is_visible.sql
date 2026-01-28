-- Migration: Add is_visible column to repositories table
-- Run this once to add the visibility toggle feature

ALTER TABLE repositories 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Create index for filtering visible projects
CREATE INDEX IF NOT EXISTS idx_repos_is_visible ON repositories(is_visible);

COMMENT ON COLUMN repositories.is_visible IS 'Whether the project is visible on the frontend';
