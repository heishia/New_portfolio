-- Add category column for manual project categorization
-- Categories: 웹, 모바일, 데스크탑 프로그램, 기타

ALTER TABLE repositories 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT '기타';

-- Update existing data based on project_type if available
UPDATE repositories 
SET category = CASE
  WHEN 'web' = ANY(project_type) OR 'website' = ANY(project_type) OR 'homepage' = ANY(project_type) 
       OR 'webapp' = ANY(project_type) OR 'saas' = ANY(project_type) OR 'ecommerce' = ANY(project_type)
       OR 'landing' = ANY(project_type) OR 'dashboard' = ANY(project_type) OR 'fullstack' = ANY(project_type)
       OR 'frontend' = ANY(project_type) OR 'react' = ANY(project_type) OR 'nextjs' = ANY(project_type) THEN '웹'
  WHEN 'mobile' = ANY(project_type) OR 'mobile-app' = ANY(project_type) OR 'app' = ANY(project_type)
       OR 'ios' = ANY(project_type) OR 'android' = ANY(project_type) OR 'flutter' = ANY(project_type)
       OR 'react-native' = ANY(project_type) THEN '모바일'
  WHEN 'desktop' = ANY(project_type) OR 'desktop-app' = ANY(project_type) OR 'program' = ANY(project_type)
       OR 'software' = ANY(project_type) OR 'automation' = ANY(project_type) OR 'cli' = ANY(project_type)
       OR 'tool' = ANY(project_type) OR 'electron' = ANY(project_type) THEN '데스크탑 프로그램'
  ELSE '기타'
END
WHERE category IS NULL OR category = '기타';

COMMENT ON COLUMN repositories.category IS 'Manual category: 웹, 모바일, 데스크탑 프로그램, 기타';
