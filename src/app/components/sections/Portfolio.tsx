import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, AnimatePresence, useSpring } from 'motion/react';
import { useLenis } from 'lenis/react';
import { ArrowRight, X, Hand, Search, RefreshCw, ExternalLink, Github, Eye, Star, Calendar, ChevronLeft, ChevronRight, Code2, Play, Users, FileCode, GitCommit, Building2, BookOpen, Briefcase } from 'lucide-react';

// --- API Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_SECRET = import.meta.env.VITE_API_SECRET || '';

// --- Types ---
interface SystemComponent {
  name: string;
  description: string;
}

interface CorePrinciple {
  title: string;
  description: string;
}

interface TechnicalChallenge {
  title: string;
  challenge: string;
  solution: string;
}

interface CodeSnippet {
  title: string;
  description: string;
  file_path: string;
  language: string;
  code: string;
}

interface DataModel {
  name: string;
  description: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  title: string | null;
  subtitle: string | null;
  project_type: string[];
  detailed_description: string | null;
  features: Array<{ title: string; description: string; sub_description?: string }>;
  technologies: Array<{ name: string; category: string; version?: string }>;
  screenshots: Array<{ file: string; caption: string; url?: string; type?: string }>;
  cover_image: string | null;  // 대표이미지 (포트폴리오 목록용)
  challenges: string | null;
  achievements: string | null;
  priority: number;
  status: string;
  demo_url: string | null;
  has_portfolio_meta: boolean;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  github_created_at: string | null;
  // Additional metadata
  roles: Array<{ role_name: string; responsibility?: string; contribution_percentage?: number }>;
  client_name: string | null;
  lines_of_code: number | null;
  commit_count: number | null;
  contributor_count: number;
  languages: Record<string, number>;  // Language breakdown from GitHub API (language -> bytes)
  documentation_url: string | null;
  // NEW: Architecture & Technical Details
  architecture: string | null;
  system_components: SystemComponent[];
  core_principles: CorePrinciple[];
  auth_flow: string[];
  data_models: DataModel[];
  technical_challenges: TechnicalChallenge[];
  key_achievements: string[];
  code_snippets: CodeSnippet[];
}

interface ProjectDisplay {
  id: number;
  uniqueId: string;
  title: string;
  subtitle: string | null;
  category: string;
  image: string;
  year: string;
  yearMonth: string;
  displayNumber: number;
  spineColor: string;
  textColor: string;
  // Extended data
  description: string | null;
  html_url: string;
  demo_url: string | null;
  documentation_url: string | null;
  technologies: Array<{ name: string; category: string; version?: string }>;
  features: Array<{ title: string; description: string; sub_description?: string }>;
  detailed_description: string | null;
  // Tags for filtering/display
  project_type: string[];
  topics: string[];
  // Additional fields for detail page
  screenshots: Array<{ file: string; caption: string; url?: string; type?: string }>;
  challenges: string | null;
  achievements: string | null;
  stargazers_count: number;
  language: string | null;
  full_name: string;
  // New metadata fields
  status: string;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  roles: Array<{ role_name: string; responsibility?: string; contribution_percentage?: number }>;
  client_name: string | null;
  lines_of_code: number | null;
  commit_count: number | null;
  contributor_count: number;
  languages: Record<string, number>;  // Language breakdown (language -> bytes)
  // NEW: Architecture & Technical Details
  architecture: string | null;
  system_components: SystemComponent[];
  core_principles: CorePrinciple[];
  auth_flow: string[];
  data_models: DataModel[];
  technical_challenges: TechnicalChallenge[];
  key_achievements: string[];
  code_snippets: CodeSnippet[];
}

// --- Fallback Data (shown when API unavailable) ---
const fallbackProjects: ProjectDisplay[] = [
  {
    id: 1,
    uniqueId: "fallback-1",
    title: "Loading...",
    subtitle: null,
    category: "Portfolio",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    year: "2024",
    yearMonth: "2024.01",
    displayNumber: 1,
    spineColor: "#282828",
    textColor: "#FFFFFF",
    description: "Loading projects from GitHub...",
    html_url: "#",
    demo_url: null,
    documentation_url: null,
    technologies: [],
    features: [],
    detailed_description: null,
    project_type: [],
    topics: [],
    screenshots: [],
    challenges: null,
    achievements: null,
    stargazers_count: 0,
    language: null,
    full_name: "loading",
    status: "completed",
    start_date: null,
    end_date: null,
    is_ongoing: false,
    roles: [],
    client_name: null,
    lines_of_code: null,
    commit_count: null,
    contributor_count: 1,
    languages: {},
    // New fields
    architecture: null,
    system_components: [],
    core_principles: [],
    auth_flow: [],
    data_models: [],
    technical_challenges: [],
    key_achievements: [],
    code_snippets: [],
  }
];

// --- Color Generation ---
const generateColorData = (index: number) => {
  const colors = [
    '#e6e6e6', '#e4e4e4', '#e1e1e1', '#dcdcdc', '#d4d4d4',
    '#cbcbcb', '#c1c1c1', '#b5b5b5', '#a8a8a8', '#9a9a9a',
    '#8c8c8c', '#7d7d7d', '#6e6e6e', '#5f5f5f', '#505050',
    '#424242', '#373737', '#2f2f2f', '#2a2a2a', '#282828',
    '#282828', '#2a2a2a', '#2f2f2f', '#373737', '#424242',
    '#505050', '#5f5f5f', '#6e6e6e', '#7d7d7d', '#8c8c8c',
    '#9a9a9a', '#a8a8a8', '#b5b5b5', '#c1c1c1', '#cbcbcb',
    '#d4d4d4', '#dcdcdc', '#e1e1e1', '#e4e4e4', '#e6e6e6'
  ];

  const spineColor = colors[index % colors.length];
  const hex = spineColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const lightness = (r + g + b) / 3;

  return {
    spineColor,
    textColor: lightness > 100 ? '#111111' : '#FFFFFF'
  };
};

// --- Constants ---
const ITEM_COUNT = 40;
const ITEM_WIDTH = 60;
const GAP = 10;
const DESKTOP_RADIUS = 500;
const LARGE_DESKTOP_RADIUS = 800;
const MOBILE_VISIBLE_COUNT = 4;
const MOBILE_RADIUS = (MOBILE_VISIBLE_COUNT * (ITEM_WIDTH + GAP)) / (2 * Math.PI);

// --- Markdown Helper ---
// 간단한 마크다운 변환 (bold만 지원)
const parseSimpleMarkdown = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // **text** → <strong>text</strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// --- Helper Functions ---
const transformReposToProjects = (repos: Repository[]): ProjectDisplay[] => {
  if (repos.length === 0) return fallbackProjects;

  // Create display items, repeating if needed to fill ITEM_COUNT
  const displayItems: ProjectDisplay[] = [];
  
  for (let i = 0; i < ITEM_COUNT; i++) {
    const repo = repos[i % repos.length];
    const { spineColor, textColor } = generateColorData(i);
    
    // Get cover image or fallback to first screenshot or GitHub placeholder
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const getCoverImageUrl = () => {
      // 1순위: cover_image
      if (repo.cover_image) {
        // presigned URL이면 그대로 사용
        if (repo.cover_image.startsWith('http')) return repo.cover_image;
        // 로컬 업로드 경로 (/uploads/...)면 백엔드 URL과 결합
        if (repo.cover_image.startsWith('/uploads/')) {
          return `${API_BASE}${repo.cover_image}`;
        }
        // key만 저장된 경우 API를 통해 조회
        return `${API_BASE}/api/upload/file/${repo.cover_image}`;
      }
      // 2순위: screenshots[0]
      const mainScreenshot = repo.screenshots?.[0];
      if (mainScreenshot?.url) {
        if (mainScreenshot.url.startsWith('http')) return mainScreenshot.url;
        if (mainScreenshot.url.startsWith('/uploads/')) {
          return `${API_BASE}${mainScreenshot.url}`;
        }
        return `${API_BASE}/api/upload/file/${mainScreenshot.url}`;
      }
      // 3순위: GitHub placeholder
      return `https://opengraph.githubassets.com/1/${repo.full_name}`;
    };
    const imageUrl = getCoverImageUrl();
    
    // Determine category from project_type or language
    const category = repo.project_type?.[0] || repo.language || 'Project';
    
    // Extract year and year.month from start_date or github_created_at
    const getDateInfo = () => {
      const dateSource = repo.start_date || repo.github_created_at;
      const date = dateSource ? new Date(dateSource) : new Date();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      return {
        year: y.toString(),
        yearMonth: `${y}.${m}`
      };
    };
    const { year, yearMonth } = getDateInfo();
    
    displayItems.push({
      id: repo.id,
      uniqueId: `${repo.id}-${i}`,
      title: repo.title || repo.name,
      subtitle: repo.subtitle,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      image: imageUrl,
      year,
      yearMonth,
      displayNumber: i + 1,
      spineColor,
      textColor,
      description: repo.description,
      html_url: repo.html_url,
      demo_url: repo.demo_url,
      documentation_url: repo.documentation_url,
      technologies: repo.technologies || [],
      features: repo.features || [],
      detailed_description: repo.detailed_description,
      project_type: repo.project_type || [],
      topics: repo.topics || [],
      screenshots: repo.screenshots || [],
      challenges: repo.challenges,
      achievements: repo.achievements,
      stargazers_count: repo.stargazers_count,
      language: repo.language,
      full_name: repo.full_name,
      // Metadata fields
      status: repo.status || 'completed',
      start_date: repo.start_date,
      end_date: repo.end_date,
      is_ongoing: repo.is_ongoing || false,
      roles: repo.roles || [],
      client_name: repo.client_name,
      lines_of_code: repo.lines_of_code,
      commit_count: repo.commit_count,
      contributor_count: repo.contributor_count || 1,
      languages: repo.languages || {},
      // NEW: Architecture & Technical Details
      architecture: repo.architecture || null,
      system_components: repo.system_components || [],
      core_principles: repo.core_principles || [],
      auth_flow: repo.auth_flow || [],
      data_models: repo.data_models || [],
      technical_challenges: repo.technical_challenges || [],
      key_achievements: repo.key_achievements || [],
      code_snippets: repo.code_snippets || [],
    });
  }
  
  return displayItems;
};

export function Portfolio() {
  // API Data State
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Rotation State
  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, { damping: 40, stiffness: 200 });
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isLargeDesktop, setIsLargeDesktop] = useState(false);

  // Dragging State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startRotation = useRef(0);
  const hasMoved = useRef(false);

  // UI State
  const [activeProject, setActiveProject] = useState<ProjectDisplay | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  
  // Scroll position ref for modal open/close
  const savedScrollY = useRef(0);
  
  // Lenis instance for scroll control
  const lenis = useLenis();

  // Computed projects
  const projects = transformReposToProjects(repositories);
  
  // Reset rotation when search query or tags change to center results
  useEffect(() => {
    if (searchQuery.trim() || selectedTags.length > 0) {
      // Center the filtered results by resetting rotation
      rotation.set(0);
    }
  }, [searchQuery, selectedTags]);
  
  // Friendly tag names mapping (technical term -> consumer-friendly name)
  const friendlyTagNames: Record<string, string> = {
    // === 소비자 친화적 프로젝트 유형 ===
    'web': '홈페이지',
    'website': '홈페이지',
    'homepage': '홈페이지',
    'webapp': '웹앱',
    'mobile': '모바일 어플',
    'mobile-app': '모바일 어플',
    'app': '모바일 어플',
    'desktop': '프로그램',
    'desktop-app': '프로그램',
    'program': '프로그램',
    'software': '프로그램',
    'saas': 'SaaS',
    'b2b': '회사 소프트웨어',
    'enterprise': '회사 소프트웨어',
    'ecommerce': '쇼핑몰/자사몰',
    'shop': '쇼핑몰/자사몰',
    'shopping': '쇼핑몰/자사몰',
    'automation': '업무 자동화',
    'cli': '오픈소스',
    'tool': '오픈소스',
    'api': '백엔드/API',
    'backend': '백엔드/API',
    'fullstack': '풀스택',
    'landing': '랜딩페이지',
    'dashboard': '대시보드',
    'admin': '관리자 페이지',
    'portfolio': '포트폴리오',
    'blog': '블로그',
    // === 유명 모바일 프레임워크 (일반인도 아는 것들) ===
    'react-native': 'React Native',
    'reactnative': 'React Native',
    'flutter': 'Flutter',
    'swift': 'iOS(Swift)',
    'kotlin': 'Android(Kotlin)',
    // === 유명 웹 프레임워크 ===
    'react': 'React',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'vue': 'Vue',
    // === 주요 언어 (기술 관심자용) ===
    'python': 'Python',
    'typescript': 'TypeScript',
    'go': 'Go',
    'golang': 'Go',
  };

  // Priority tags for better UX - 소비자/클라이언트가 이해하기 쉬운 순서
  const priorityTags = [
    // 1순위: 결과물 유형 (비개발자도 이해)
    '모바일 어플', '홈페이지', '프로그램', '쇼핑몰/자사몰', 
    'SaaS', '회사 소프트웨어', '업무 자동화', '대시보드',
    // 2순위: 유명 모바일 프레임워크
    'Flutter', 'React Native',
    // 3순위: 주요 기술 (기술 관심자용)
    'React', 'Next.js', 'Python', 'TypeScript'
  ];

  // 항상 표시할 기본 태그 (데이터와 무관하게 표시)
  const defaultTags = ['자동화프로그램', '홈페이지', '쇼핑몰', '모바일앱', 'AI서비스', 'SaaS'];

  // Extract unique tags for quick filters (tech stack + project types)
  const quickFilterTags = React.useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    repositories.forEach(repo => {
      // Count project types with friendly names
      repo.project_type?.forEach(type => {
        const lowerType = type.toLowerCase();
        const friendlyName = friendlyTagNames[lowerType] || (type.charAt(0).toUpperCase() + type.slice(1).toLowerCase());
        tagCounts.set(friendlyName, (tagCounts.get(friendlyName) || 0) + 1);
      });
      
      // Count main language
      if (repo.language) {
        const lowerLang = repo.language.toLowerCase();
        const friendlyName = friendlyTagNames[lowerLang] || repo.language;
        tagCounts.set(friendlyName, (tagCounts.get(friendlyName) || 0) + 1);
      }
      
      // Count popular technologies (only well-known ones)
      repo.technologies?.forEach(tech => {
        const lowerName = tech.name.toLowerCase();
        if (friendlyTagNames[lowerName]) {
          const friendlyName = friendlyTagNames[lowerName];
          tagCounts.set(friendlyName, (tagCounts.get(friendlyName) || 0) + 1);
        }
      });
    });
    
    // Sort data-based tags: priority tags first, then by count
    const allTags = Array.from(tagCounts.entries());
    const sortedTags = allTags.sort((a, b) => {
      const aPriority = priorityTags.indexOf(a[0]);
      const bPriority = priorityTags.indexOf(b[0]);
      
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      return b[1] - a[1];
    });
    
    // 기본 태그 + 데이터 기반 태그 (중복 제거)
    const dataTags = sortedTags.map(([tag]) => tag).filter(tag => !defaultTags.includes(tag));
    const combined = [...defaultTags, ...dataTags];
    
    return combined.slice(0, 8);
  }, [repositories]);
  
  // Filtered projects based on search query AND selected tags
  const filteredProjects = React.useMemo(() => {
    // If no filters, return all
    if (!searchQuery.trim() && selectedTags.length === 0) return projects;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Find matching repository IDs
    const matchingRepoIds = new Set<number>();
    
    repositories.forEach(repo => {
      // Build searchable fields for this repo
      const searchFields = [
        // Title and names
        repo.title,
        repo.name,
        repo.subtitle,
        // Descriptions (content search)
        repo.description,
        repo.detailed_description,
        // Project types (output tags)
        ...repo.project_type,
        // GitHub topics
        ...repo.topics,
        // Technology names
        ...repo.technologies.map(t => t.name),
        // Technology categories
        ...repo.technologies.map(t => t.category),
        // Feature titles and descriptions
        ...repo.features.map(f => f.title),
        ...repo.features.map(f => f.description),
        // Language
        repo.language,
        // Challenges and achievements
        repo.challenges,
        repo.achievements,
        // Status
        repo.status,
      ].filter(Boolean).map(f => f!.toLowerCase());
      
      // Check text search match
      const matchesQuery = !query || searchFields.some(field => field.includes(query));
      
      // Check tag matches (project must match ALL selected tags)
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => {
        const lowerTag = tag.toLowerCase();
        return searchFields.some(field => field.includes(lowerTag));
      });
      
      if (matchesQuery && matchesTags) {
        matchingRepoIds.add(repo.id);
      }
    });
    
    return projects.filter(p => matchingRepoIds.has(p.id));
  }, [searchQuery, selectedTags, projects, repositories]);

  // Fetch repositories from API
  const fetchRepositories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/repos`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      
      const data = await response.json();
      setRepositories(data.repositories || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh repositories
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const headers: Record<string, string> = {};
      if (API_SECRET) {
        headers['Authorization'] = `Bearer ${API_SECRET}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/repos/refresh`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) throw new Error('Failed to refresh');
      
      // Refetch after refresh
      await fetchRepositories();
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchRepositories]);

  // Initial fetch
  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (activeProject) {
      // 모달 열릴 때: 현재 스크롤 위치 저장 & Lenis 정지
      savedScrollY.current = lenis?.scroll || window.scrollY;
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      // 모달 닫힐 때: Lenis 재시작 & 저장된 위치로 복원
      document.body.style.overflow = '';
      lenis?.start();
      
      // 저장된 위치로 즉시 스크롤 (애니메이션 없이)
      const scrollY = savedScrollY.current;
      if (scrollY > 0) {
        requestAnimationFrame(() => {
          lenis?.scrollTo(scrollY, { immediate: true });
        });
      }
    }

    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [activeProject, lenis]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Get unique repositories (not the repeated display items)
      const uniqueRepos = repositories;
      if (uniqueRepos.length === 0) return;

      // Find current repository index
      const currentIndex = uniqueRepos.findIndex(repo => repo.id === activeProject.id);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      if (e.key === 'ArrowLeft') {
        // Previous repo (wrap to end if at start)
        nextIndex = currentIndex === 0 ? uniqueRepos.length - 1 : currentIndex - 1;
      } else if (e.key === 'ArrowRight') {
        // Next repo (wrap to start if at end)
        nextIndex = currentIndex === uniqueRepos.length - 1 ? 0 : currentIndex + 1;
      } else if (e.key === 'Escape') {
        setActiveProject(null);
        return;
      }

      if (nextIndex !== null) {
        const nextRepo = uniqueRepos[nextIndex];
        const { spineColor, textColor } = generateColorData(nextIndex);
        
        // Get cover image or fallback to first screenshot or GitHub placeholder
        const getNextCoverImageUrl = () => {
          if (nextRepo.cover_image) {
            // presigned URL이면 그대로 사용
            if (nextRepo.cover_image.startsWith('http')) return nextRepo.cover_image;
            // 로컬 업로드 경로 (/uploads/...)면 백엔드 URL과 결합
            if (nextRepo.cover_image.startsWith('/uploads/')) {
              return `${API_BASE_URL}${nextRepo.cover_image}`;
            }
            // key만 저장된 경우 API를 통해 조회
            return `${API_BASE_URL}/api/upload/file/${nextRepo.cover_image}`;
          }
          const mainScreenshot = nextRepo.screenshots?.[0];
          if (mainScreenshot?.url) {
            if (mainScreenshot.url.startsWith('http')) return mainScreenshot.url;
            if (mainScreenshot.url.startsWith('/uploads/')) {
              return `${API_BASE_URL}${mainScreenshot.url}`;
            }
            return `${API_BASE_URL}/api/upload/file/${mainScreenshot.url}`;
          }
          return `https://opengraph.githubassets.com/1/${nextRepo.full_name}`;
        };
        const imageUrl = getNextCoverImageUrl();
        
        // Determine category from project_type or language
        const category = nextRepo.project_type?.[0] || nextRepo.language || 'Project';
        
        // Get year and year.month from start_date or github_created_at
        const dateSource = nextRepo.start_date || nextRepo.github_created_at;
        const date = dateSource ? new Date(dateSource) : new Date();
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const year = y.toString();
        const yearMonth = `${y}.${m}`;
        
        setActiveProject({
          id: nextRepo.id,
          uniqueId: `${nextRepo.id}-nav`,
          title: nextRepo.title || nextRepo.name,
          subtitle: nextRepo.subtitle,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          image: imageUrl,
          year,
          yearMonth,
          displayNumber: nextIndex + 1,
          spineColor,
          textColor,
          description: nextRepo.description,
          html_url: nextRepo.html_url,
          demo_url: nextRepo.demo_url,
          documentation_url: nextRepo.documentation_url,
          technologies: nextRepo.technologies || [],
          features: nextRepo.features || [],
          detailed_description: nextRepo.detailed_description,
          project_type: nextRepo.project_type || [],
          topics: nextRepo.topics || [],
          screenshots: nextRepo.screenshots || [],
          challenges: nextRepo.challenges,
          achievements: nextRepo.achievements,
          stargazers_count: nextRepo.stargazers_count,
          language: nextRepo.language,
          full_name: nextRepo.full_name,
          // Metadata fields
          status: nextRepo.status || 'completed',
          start_date: nextRepo.start_date,
          end_date: nextRepo.end_date,
          is_ongoing: nextRepo.is_ongoing || false,
          roles: nextRepo.roles || [],
          client_name: nextRepo.client_name,
          lines_of_code: nextRepo.lines_of_code,
          commit_count: nextRepo.commit_count,
          contributor_count: nextRepo.contributor_count || 1,
          languages: nextRepo.languages || {},
          // NEW: Architecture & Technical Details
          architecture: nextRepo.architecture || null,
          system_components: nextRepo.system_components || [],
          core_principles: nextRepo.core_principles || [],
          auth_flow: nextRepo.auth_flow || [],
          data_models: nextRepo.data_models || [],
          technical_challenges: nextRepo.technical_challenges || [],
          key_achievements: nextRepo.key_achievements || [],
          code_snippets: nextRepo.code_snippets || [],
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, repositories]);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLargeDesktop(window.innerWidth >= 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX;
    startRotation.current = rotation.get();
    setShowHint(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.pageX - startX.current;
    if (Math.abs(delta) > 5) hasMoved.current = true;
    rotation.set(startRotation.current + delta * 0.2);
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const onMouseLeave = () => {
    isDragging.current = false;
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.touches[0].pageX;
    startRotation.current = rotation.get();
    setShowHint(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].pageX - startX.current;
    if (Math.abs(delta) > 5) hasMoved.current = true;
    rotation.set(startRotation.current + delta * 0.2);
  };

  const onTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <section
      id="portfolio"
      className="relative w-full min-h-screen 2xl:min-h-0 2xl:h-auto bg-[#F0F0F0] overflow-hidden flex flex-col perspective-[2000px] select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="w-full text-center pointer-events-none z-10 shrink-0 pt-12 md:pt-16 pb-4 md:pb-6">
        <h2 className="text-[12vw] md:text-[8vw] 2xl:text-[5vw] font-bold text-[#E5E5E5] leading-none tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
          PORTFOLIO
        </h2>
      </div>

      {/* 3D Scene Container */}
      <div className="relative flex-1 2xl:flex-none w-full flex items-start justify-center cursor-grab active:cursor-grabbing pt-8 md:pt-12 pb-8 md:pb-12 2xl:pt-8 2xl:pb-8">
        
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
              <span className="text-sm text-neutral-500 font-mono">Loading projects...</span>
            </div>
          </div>
        )}

        {/* Rotating Cylinder */}
        <motion.div
          className="relative h-[55vh] md:h-[60vh] 2xl:h-[45vh] w-[60px]"
          style={{
            rotateY: smoothRotation,
            scale: isMobile ? 1.5 : 1,
            opacity: loading ? 0.3 : 1,
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
          }}
        >
          {filteredProjects.map((project, i) => {
            // When filtering, distribute items evenly based on filtered count
            // and center them so the middle item is at the front
            const isFiltering = searchQuery.trim().length > 0 || selectedTags.length > 0;
            const itemCount = isFiltering ? filteredProjects.length : ITEM_COUNT;
            
            // Calculate angle: when filtering, center the group by offsetting
            // so middle item is at angle 0 (front)
            const baseAngle = (360 / Math.max(itemCount, 1)) * i;
            const centerOffset = isFiltering ? ((filteredProjects.length - 1) / 2) * (360 / Math.max(itemCount, 1)) : 0;
            const angle = baseAngle - centerOffset;
            
            return (
              <Spine3D
                key={project.uniqueId}
                project={project}
                angle={angle}
                radius={isMobile ? MOBILE_RADIUS : (isLargeDesktop ? LARGE_DESKTOP_RADIUS : DESKTOP_RADIUS)}
                onSelect={() => {
                  if (!hasMoved.current) {
                    setActiveProject(project);
                  }
                }}
              />
            );
          })}
        </motion.div>

        {/* Drag Hint */}
        <AnimatePresence>
          {showHint && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none text-neutral-400 z-30"
            >
              <Hand className="w-5 h-5 2xl:w-7 2xl:h-7 animate-pulse" />
              <span className="text-xs 2xl:text-base font-mono uppercase tracking-widest">Drag to Rotate</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar & Controls */}
      <div className="w-full px-6 pointer-events-auto z-20 shrink-0 pb-12 md:pb-16 2xl:pt-12 2xl:pb-16">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative"
          >
            <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-black/5">
              <div className="absolute left-5 flex items-center justify-center pointer-events-none">
                <Search className="w-[18px] h-[18px] text-neutral-400" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="어떤 프로젝트를 찾으시나요?"
                className="w-full pl-14 pr-24 py-5 md:py-6 2xl:py-5 bg-transparent text-[15px] 2xl:text-xl placeholder:text-neutral-400 focus:outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              />
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="absolute right-4 flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                title="Refresh from GitHub"
              >
                <RefreshCw className={`w-4 h-4 text-neutral-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Clear Search Button */}
              <AnimatePresence>
                {(searchQuery || selectedTags.length > 0) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => { setSearchQuery(''); setSelectedTags([]); }}
                    className="absolute right-14 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors"
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseMove={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                  >
                    <X className="w-3.5 h-3.5 text-neutral-600" strokeWidth={2.5} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Filter Tags - Dynamic from actual data (multi-select) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap gap-2 justify-center mt-4"
          >
            {(quickFilterTags.length > 0 ? quickFilterTags : ['자동화프로그램', '홈페이지', '쇼핑몰', '모바일앱', 'AI서비스', 'SaaS']).map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      isSelected 
                        ? prev.filter(t => t !== tag)  // Remove if already selected
                        : [...prev, tag]  // Add if not selected
                    );
                  }}
                  className={`px-4 py-2 2xl:px-6 2xl:py-3 text-xs md:text-sm 2xl:text-base font-medium rounded-full transition-all hover:scale-105 ${
                    isSelected
                      ? 'bg-black text-white border border-black'
                      : 'bg-white/60 hover:bg-white border border-black/10 hover:border-black/20'
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  {tag}
                </button>
              );
            })}
          </motion.div>

          {/* No Results Message */}
          <AnimatePresence>
            {filteredProjects.length === 0 && (searchQuery || selectedTags.length > 0) && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center text-sm text-neutral-500 mt-3"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                검색 결과가 없습니다
              </motion.p>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm text-red-500 mt-3">{error}</p>
          )}
        </div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-sm overflow-hidden"
            onClick={() => { setActiveProject(null); setShowDetail(false); }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              layoutId={`card-${activeProject.uniqueId}`}
              className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl overflow-hidden cursor-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {!showDetail ? (
                  /* Overview Screen */
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex flex-col md:flex-row"
                  >
                    {/* Image Side */}
                    <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-neutral-100">
                      <img
                        src={activeProject.image}
                        alt={activeProject.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://opengraph.githubassets.com/1/${activeProject.full_name}`;
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProject(null);
                          setShowDetail(false);
                        }}
                        className="absolute top-4 left-4 md:hidden w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white z-20"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/3 h-1/2 md:h-full p-8 flex flex-col justify-between bg-white relative z-10 overflow-y-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProject(null);
                          setShowDetail(false);
                        }}
                        className="absolute top-6 right-6 hidden md:flex w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-full items-center justify-center transition-colors z-20 cursor-pointer"
                      >
                        <X className="w-5 h-5 text-neutral-600" />
                      </button>

                      <div>
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-mono bg-neutral-100 text-neutral-600 rounded-full">
                          {activeProject.category}
                        </span>
                        <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {activeProject.title}
                        </h3>
                        <p className="text-neutral-500 font-mono text-sm">{activeProject.yearMonth}</p>
                        
                        {/* Project Tags (Topics + Project Type) */}
                        {(activeProject.project_type.length > 0 || activeProject.topics.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {activeProject.project_type.map((type, i) => (
                              <button
                                key={`type-${i}`}
                                onClick={() => { setActiveProject(null); setSearchQuery(type); }}
                                className="px-2 py-0.5 text-[10px] bg-black text-white rounded hover:bg-neutral-800 cursor-pointer transition-colors"
                              >
                                {type}
                              </button>
                            ))}
                            {activeProject.topics.slice(0, 3).map((topic, i) => (
                              <button
                                key={`topic-${i}`}
                                onClick={() => { setActiveProject(null); setSearchQuery(topic); }}
                                className="px-2 py-0.5 text-[10px] bg-neutral-200 text-neutral-600 rounded hover:bg-neutral-300 cursor-pointer transition-colors"
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Technologies */}
                        {activeProject.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {activeProject.technologies.slice(0, 5).map((tech, i) => (
                              <button
                                key={i}
                                onClick={() => { setActiveProject(null); setSearchQuery(tech.name); }}
                                className="px-2 py-0.5 text-[10px] bg-neutral-50 text-neutral-500 rounded hover:bg-neutral-100 cursor-pointer transition-colors"
                              >
                                {tech.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="text-neutral-600 text-sm leading-relaxed mb-8">
                          {parseSimpleMarkdown(activeProject.detailed_description || activeProject.description || 
                            "An exploration of form and void, capturing the essence of minimal design through spatial awareness.")}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setShowDetail(true)}
                            className="w-full py-4 bg-neutral-100 text-neutral-800 text-sm font-mono uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Detail
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          
                          <a 
                            href={activeProject.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-black text-white text-sm font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 group"
                          >
                            <Github className="w-4 h-4" />
                            View on GitHub
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </a>
                          
                          {activeProject.demo_url && (
                            <a
                              href={activeProject.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-4 bg-neutral-100 text-neutral-800 text-sm font-mono uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Live Demo
                            </a>
                          )}
                        </div>
                        
                        {/* Navigation Info */}
                        {repositories.length > 1 && (
                          <div className="mt-6 pt-4 border-t border-neutral-100">
                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <span className="font-mono">
                                {repositories.findIndex(repo => repo.id === activeProject.id) + 1} / {repositories.length}
                              </span>
                              <span className="hidden md:flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-neutral-100 rounded text-[10px]">←</kbd>
                                <kbd className="px-2 py-1 bg-neutral-100 rounded text-[10px]">→</kbd>
                                <span>to navigate</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Rich Detail Screen */
                  <ProjectDetailPage 
                    project={activeProject} 
                    onBack={() => setShowDetail(false)}
                    onClose={() => { setActiveProject(null); setShowDetail(false); }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Spine3D({ project, angle, radius, onSelect }: { project: ProjectDisplay, angle: number, radius: number, onSelect: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      className="absolute top-0 left-0 w-[60px] h-full group"
      style={{
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Clickable overlay - positioned to match visual bounds */}
      <div
        onClick={handleClick}
        className="absolute inset-0 cursor-pointer z-10"
        style={{
          pointerEvents: 'auto',
        }}
      />
      <motion.div
        className="w-full h-full shadow-lg transition-transform duration-300 group-hover:-translate-y-4 hover:brightness-110 border-l border-white/10 pointer-events-none"
        style={{
          backgroundColor: project.spineColor,
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-between py-6">
          <span
            className="text-[10px] font-mono opacity-60"
            style={{ color: project.textColor }}
          >
            {project.displayNumber < 10 ? `0${project.displayNumber}` : project.displayNumber}
          </span>

          <h4
            className="text-lg font-bold tracking-wider flex-1 flex items-center justify-center text-center py-4"
            style={{
              writingMode: 'vertical-rl',
              color: project.textColor,
              textOrientation: 'mixed',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {project.title}
          </h4>

          <span
            className="text-[10px] font-mono -rotate-90"
            style={{ color: project.textColor }}
          >
            {project.year}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// --- Category Color Helper ---
const getCategoryColor = (_category: string) => {
  // 초록색 포인트 컬러로 통일
  return 'bg-blue-50 text-blue-600 border-blue-200';
};

// --- Project Detail Page Component ---
function ProjectDetailPage({ 
  project, 
  onBack, 
  onClose 
}: { 
  project: ProjectDisplay; 
  onBack: () => void; 
  onClose: () => void;
}) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<number | null>(null);

  // Body scroll lock for screenshot lightbox (추가 레이어)
  useEffect(() => {
    if (selectedScreenshot !== null) {
      // 이미 body가 fixed 상태이므로 추가 처리 불필요
      // 하지만 detail page 내부 스크롤도 막아야 함
      const detailContainer = document.querySelector('[data-detail-scroll]');
      if (detailContainer) {
        (detailContainer as HTMLElement).style.overflow = 'hidden';
      }
    } else {
      const detailContainer = document.querySelector('[data-detail-scroll]');
      if (detailContainer) {
        (detailContainer as HTMLElement).style.overflow = '';
      }
    }
  }, [selectedScreenshot]);

  // Group technologies by category
  const techByCategory = React.useMemo(() => {
    const grouped: Record<string, Array<{ name: string; category: string; version?: string }>> = {};
    project.technologies.forEach(tech => {
      const cat = tech.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(tech);
    });
    return grouped;
  }, [project.technologies]);

  const hasScreenshots = project.screenshots && project.screenshots.length > 0;

  // Format date range
  const getDateRange = () => {
    if (!project.start_date) return project.yearMonth;
    const start = new Date(project.start_date);
    const startStr = `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}`;
    if (project.is_ongoing) return `${startStr} ~ 진행중`;
    if (project.end_date) {
      const end = new Date(project.end_date);
      const endStr = `${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, '0')}`;
      return `${startStr} ~ ${endStr}`;
    }
    return startStr;
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (project.status) {
      case 'in_progress':
        return { label: '진행중', color: 'bg-blue-100 text-blue-700' };
      case 'archived':
        return { label: '보관됨', color: 'bg-neutral-100 text-neutral-600' };
      default:
        return { label: '완료', color: 'bg-neutral-100 text-neutral-700' };
    }
  };

  const statusBadge = getStatusBadge();

  // Check if there's detailed architecture info
  const hasArchitectureInfo = project.architecture || 
    project.system_components.length > 0 || 
    project.core_principles.length > 0 || 
    project.auth_flow.length > 0 || 
    project.data_models.length > 0;

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full flex flex-col bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-100 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">뒤로가기</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-9 h-9 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-neutral-600" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto" data-detail-scroll>
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          
          {/* ========== Hero Section ========== */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {project.category}
                  </span>
                  {project.language && (
                    <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded">
                      {project.language}
                    </span>
                  )}
                  {project.client_name && (
                    <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {project.client_name}
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-neutral-900 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {project.title}
                </h1>
                
                {project.subtitle && (
                  <p className="text-neutral-500 text-sm mb-2">{project.subtitle}</p>
                )}
                
                {/* Date Range */}
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span>{getDateRange()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-neutral-600 text-sm mt-4 leading-relaxed border-t border-neutral-100 pt-4">
              {parseSimpleMarkdown(project.description || '프로젝트 설명이 없습니다.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-neutral-100">
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] px-4 py-3 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  데모
                </a>
              )}
              {project.documentation_url && (
                <a
                  href={project.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  문서
                </a>
              )}
            </div>
          </div>

          {/* ========== Code Statistics Section ========== */}
          {(project.lines_of_code || project.commit_count || Object.keys(project.languages).length > 0) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                코드 통계
              </h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {project.lines_of_code && (
                  <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-4 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs text-neutral-500 font-medium">코드 라인</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {project.lines_of_code.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">lines</p>
                  </div>
                )}
                
                {project.commit_count && (
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <GitCommit className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-neutral-500 font-medium">커밋 수</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {project.commit_count.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">commits</p>
                  </div>
                )}
                
                {project.contributor_count > 0 && (
                  <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-4 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs text-neutral-500 font-medium">기여자</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {project.contributor_count}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">contributors</p>
                  </div>
                )}
                
                {project.stargazers_count > 0 && (
                  <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-4 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-neutral-500 font-medium">스타</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {project.stargazers_count}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">stars</p>
                  </div>
                )}
              </div>
              
              {/* Language Breakdown */}
              {Object.keys(project.languages).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    언어 비율
                  </h3>
                  
                  {/* Language Bar */}
                  <div className="h-3 rounded-full overflow-hidden bg-neutral-100 flex mb-3">
                    {(() => {
                      const totalBytes = Object.values(project.languages).reduce((a, b) => a + b, 0);
                      const sortedLangs = Object.entries(project.languages)
                        .sort((a, b) => b[1] - a[1]);
                      
                      const langColors: Record<string, string> = {
                        'TypeScript': '#3178c6',
                        'JavaScript': '#f7df1e',
                        'Python': '#3776ab',
                        'HTML': '#e34c26',
                        'CSS': '#1572b6',
                        'SCSS': '#cc6699',
                        'Java': '#b07219',
                        'Go': '#00add8',
                        'Rust': '#dea584',
                        'C++': '#f34b7d',
                        'C': '#555555',
                        'Shell': '#89e051',
                        'Ruby': '#cc342d',
                        'PHP': '#4f5d95',
                        'Swift': '#fa7343',
                        'Kotlin': '#7f52ff',
                        'Dart': '#00b4ab',
                        'Vue': '#41b883',
                      };
                      
                      return sortedLangs.map(([lang, bytes], i) => {
                        const percentage = (bytes / totalBytes) * 100;
                        if (percentage < 1) return null;
                        
                        return (
                          <div
                            key={lang}
                            className="h-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: langColors[lang] || `hsl(${(i * 50) % 360}, 60%, 50%)`,
                            }}
                            title={`${lang}: ${percentage.toFixed(1)}%`}
                          />
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Language Legend */}
                  <div className="flex flex-wrap gap-3">
                    {(() => {
                      const totalBytes = Object.values(project.languages).reduce((a, b) => a + b, 0);
                      const sortedLangs = Object.entries(project.languages)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 6);
                      
                      const langColors: Record<string, string> = {
                        'TypeScript': '#3178c6',
                        'JavaScript': '#f7df1e',
                        'Python': '#3776ab',
                        'HTML': '#e34c26',
                        'CSS': '#1572b6',
                        'SCSS': '#cc6699',
                        'Java': '#b07219',
                        'Go': '#00add8',
                        'Rust': '#dea584',
                        'C++': '#f34b7d',
                        'C': '#555555',
                        'Shell': '#89e051',
                        'Ruby': '#cc342d',
                        'PHP': '#4f5d95',
                        'Swift': '#fa7343',
                        'Kotlin': '#7f52ff',
                        'Dart': '#00b4ab',
                        'Vue': '#41b883',
                      };
                      
                      return sortedLangs.map(([lang, bytes], i) => {
                        const percentage = (bytes / totalBytes) * 100;
                        return (
                          <div key={lang} className="flex items-center gap-1.5 text-sm">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: langColors[lang] || `hsl(${(i * 50) % 360}, 60%, 50%)`,
                              }}
                            />
                            <span className="text-neutral-700 font-medium">{lang}</span>
                            <span className="text-neutral-400">{percentage.toFixed(1)}%</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== 1. 기술 스택 (Tech Stack) ========== */}
          {project.technologies.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2">
                기술 스택
              </h2>
              
              <div className="space-y-5">
                {Object.entries(techByCategory).map(([category, techs]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {techs.map((tech, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors hover:shadow-sm ${getCategoryColor(category)}`}
                        >
                          {tech.name}
                          {tech.version && (
                            <span className="ml-1 opacity-60 text-xs">{tech.version}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== 2. 프로젝트 갤러리 (Screenshots) ========== */}
          {hasScreenshots && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-6">프로젝트 갤러리</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.screenshots.map((screenshot, i) => {
                  const isVideo = screenshot.type === 'video' || screenshot.file?.endsWith('.mp4');
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedScreenshot(i)}
                      className="group relative aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                    >
                      {isVideo ? (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-neutral-700 ml-0.5" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={screenshot.url || screenshot.file}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Screenshot Lightbox Modal */}
          <AnimatePresence>
            {selectedScreenshot !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 overflow-hidden"
                onClick={() => setSelectedScreenshot(null)}
                onWheel={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  onClick={() => setSelectedScreenshot(null)}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                {project.screenshots.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScreenshot(prev => prev === 0 ? project.screenshots.length - 1 : (prev ?? 0) - 1);
                      }}
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScreenshot(prev => prev === project.screenshots.length - 1 ? 0 : (prev ?? 0) + 1);
                      }}
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                <div className="max-w-5xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
                  {project.screenshots[selectedScreenshot]?.type === 'video' || 
                   project.screenshots[selectedScreenshot]?.file?.endsWith('.mp4') ? (
                    <video
                      src={project.screenshots[selectedScreenshot].url || project.screenshots[selectedScreenshot].file}
                      className="w-full h-full object-contain rounded-lg"
                      controls
                      autoPlay
                    />
                  ) : (
                    <img
                      src={project.screenshots[selectedScreenshot]?.url || project.screenshots[selectedScreenshot]?.file}
                      alt=""
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== 3. 프로젝트 상세 설명 (Architecture) ========== */}
          {hasArchitectureInfo && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-6">프로젝트 상세 설명</h2>
              
              <div className="space-y-6">
                {/* 아키텍처 */}
                {project.architecture && (
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 mb-3">아키텍처</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {project.architecture}
                    </p>
                  </div>
                )}

                {/* 시스템 구성 */}
                {project.system_components.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 mb-3">시스템 구성</h3>
                    <ul className="space-y-2">
                      {project.system_components.map((comp, i) => (
                        <li key={i} className="text-sm text-neutral-600">
                          <span className="text-neutral-400 mr-2">-</span>
                          <span className="font-semibold text-neutral-800">{comp.name}:</span>{' '}
                          {comp.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 핵심 원칙 */}
                {project.core_principles.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 mb-3">핵심 원칙</h3>
                    <ul className="space-y-2">
                      {project.core_principles.map((principle, i) => (
                        <li key={i} className="text-sm text-neutral-600">
                          <span className="text-neutral-400 mr-2">-</span>
                          <span className="font-semibold text-neutral-800">{principle.title}:</span>{' '}
                          {principle.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 인증 플로우 */}
                {project.auth_flow.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 mb-3">인증 플로우</h3>
                    <ol className="space-y-1.5">
                      {project.auth_flow.map((step, i) => (
                        <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                          <span className="font-semibold text-blue-600 shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* 데이터 모델 */}
                {project.data_models.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 mb-3">데이터 모델</h3>
                    <ul className="space-y-2">
                      {project.data_models.map((model, i) => (
                        <li key={i} className="text-sm text-neutral-600">
                          <span className="text-neutral-400 mr-2">-</span>
                          <span className="font-semibold text-neutral-800">{model.name}:</span>{' '}
                          {model.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== 4. 주요 기능 (Features) ========== */}
          {project.features.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-6">주요 기능</h2>
              
              <div className="space-y-4">
                {project.features.map((feature, i) => (
                  <div 
                    key={i}
                    className="relative pl-4 border-l-4 border-blue-500 bg-neutral-50 rounded-r-xl p-4"
                  >
                    <h3 className="font-bold text-neutral-900 text-base mb-1">{feature.title}</h3>
                    {feature.description && (
                      <p className="text-blue-600 text-sm font-medium mb-2">{feature.description}</p>
                    )}
                    {feature.sub_description && (
                      <p className="text-neutral-500 text-sm leading-relaxed">{feature.sub_description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== 5. 기술적 도전 과제 (Technical Challenges) ========== */}
          {project.technical_challenges.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-2">주요 도전과제</h2>
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">기술적 도전 과제</h3>
              
              <div className="space-y-6">
                {project.technical_challenges.map((challenge, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-bold text-neutral-900">
                      {i + 1}. {challenge.title}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      <span className="font-semibold text-neutral-800">도전:</span>{' '}
                      {challenge.challenge}
                    </p>
                    <p className="text-sm text-neutral-600">
                      <span className="font-semibold text-blue-600">해결:</span>{' '}
                      {challenge.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== 6. 주요 성과 (Key Achievements) ========== */}
          {project.key_achievements.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-2">주요 성과</h2>
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">주요 성과</h3>
              
              <ol className="space-y-3">
                {project.key_achievements.map((achievement, i) => (
                  <li key={i} className="text-sm text-neutral-700 flex items-start gap-3">
                    <span className="font-bold text-blue-600 shrink-0">{i + 1}.</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ========== 7. 코드 스니펫 (Code Snippets) ========== */}
          {project.code_snippets.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-blue-600 mb-6">코드 스니펫</h2>
              
              <div className="space-y-6">
                {project.code_snippets.map((snippet, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-neutral-200">
                    {/* Snippet Header */}
                    <div className="bg-[#1e1e1e] px-4 py-3">
                      <h4 className="font-bold text-white text-base">{snippet.title}</h4>
                      <p className="text-neutral-400 text-sm mt-1">{snippet.description}</p>
                      <p className="text-blue-400 text-xs mt-1 font-mono">{snippet.file_path}</p>
                    </div>
                    {/* Code Block */}
                    <pre className="bg-[#1e1e1e] px-4 py-4 overflow-x-auto">
                      <code className="text-sm font-mono text-neutral-300 whitespace-pre">
                        {snippet.code}
                      </code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== Legacy: Challenges & Achievements (if no new data) ========== */}
          {(project.challenges || project.achievements) && 
           project.technical_challenges.length === 0 && 
           project.key_achievements.length === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {project.challenges && (
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 shadow-sm border border-orange-100">
                  <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🎯</span> 도전 과제
                  </h2>
                  <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{project.challenges}</p>
                </div>
              )}
              {project.achievements && (
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-sm border border-blue-100">
                  <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🏆</span> 성과
                  </h2>
                  <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{project.achievements}</p>
                </div>
              )}
            </div>
          )}

          {/* ========== Roles Section ========== */}
          {project.roles.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-neutral-400" />
                담당 역할
              </h2>
              
              <div className="space-y-3">
                {project.roles.map((role, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-neutral-50 to-white rounded-xl border border-neutral-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-neutral-900">{role.role_name}</h3>
                      {role.responsibility && (
                        <p className="text-neutral-500 text-sm mt-0.5">{role.responsibility}</p>
                      )}
                    </div>
                    {role.contribution_percentage && (
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-bold text-blue-600">{role.contribution_percentage}%</span>
                        <p className="text-xs text-neutral-400">기여도</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== Topics/Tags ========== */}
          {project.topics.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">토픽 & 태그</h2>
              <div className="flex flex-wrap gap-2">
                {project.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors cursor-default"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ========== Bottom CTA ========== */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 text-center">
            <p className="text-neutral-300 text-sm mb-4">
              더 자세한 내용은 GitHub에서 확인하세요
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 font-medium rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub에서 자세히 보기
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
