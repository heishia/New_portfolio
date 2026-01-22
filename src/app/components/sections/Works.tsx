import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, AnimatePresence, useSpring } from 'motion/react';
import { ArrowRight, X, Hand, Search, RefreshCw, ExternalLink, Github, Eye, Star, GitFork, Calendar, ChevronLeft, ChevronRight, Code2, Database, Globe, Layers, Server, Smartphone, Play, Image as ImageIcon } from 'lucide-react';

// --- API Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// --- Types ---
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
  features: Array<{ title: string; description: string }>;
  technologies: Array<{ name: string; category: string; version?: string }>;
  screenshots: Array<{ file: string; caption: string; url?: string; type?: string }>;
  challenges: string | null;
  achievements: string | null;
  priority: number;
  status: string;
  demo_url: string | null;
  has_portfolio_meta: boolean;
  start_date: string | null;
  github_created_at: string | null;
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
  technologies: Array<{ name: string; category: string; version?: string }>;
  features: Array<{ title: string; description: string }>;
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

// --- Helper Functions ---
const transformReposToProjects = (repos: Repository[]): ProjectDisplay[] => {
  if (repos.length === 0) return fallbackProjects;

  // Create display items, repeating if needed to fill ITEM_COUNT
  const displayItems: ProjectDisplay[] = [];
  
  for (let i = 0; i < ITEM_COUNT; i++) {
    const repo = repos[i % repos.length];
    const { spineColor, textColor } = generateColorData(i);
    
    // Get first screenshot URL or use placeholder
    const mainScreenshot = repo.screenshots?.[0];
    const imageUrl = mainScreenshot?.url || 
      `https://opengraph.githubassets.com/1/${repo.full_name}`;
    
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
    });
  }
  
  return displayItems;
};

export function Works() {
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
  const [showDetail, setShowDetail] = useState(false);

  // Computed projects
  const projects = transformReposToProjects(repositories);
  
  // Extract unique tags for quick filters (tech stack + project types)
  const quickFilterTags = React.useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    repositories.forEach(repo => {
      // Count project types
      repo.project_type?.forEach(type => {
        const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        tagCounts.set(normalizedType, (tagCounts.get(normalizedType) || 0) + 1);
      });
      
      // Count popular technologies
      repo.technologies?.forEach(tech => {
        tagCounts.set(tech.name, (tagCounts.get(tech.name) || 0) + 1);
      });
      
      // Count GitHub topics
      repo.topics?.forEach(topic => {
        const normalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
        tagCounts.set(normalizedTopic, (tagCounts.get(normalizedTopic) || 0) + 1);
      });
    });
    
    // Sort by count and take top 8
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [repositories]);
  
  // Filtered projects based on search (enhanced to search more fields)
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Find matching repository IDs
    const matchingRepoIds = new Set<number>();
    
    repositories.forEach(repo => {
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
      ];
      
      const matches = searchFields.some(field => 
        field && field.toLowerCase().includes(query)
      );
      
      if (matches) {
        matchingRepoIds.add(repo.id);
      }
    });
    
    return projects.filter(p => matchingRepoIds.has(p.id));
  }, [searchQuery, projects, repositories]);

  // Fetch repositories from API
  const fetchRepositories = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7250/ingest/64b02a6f-ec38-48d4-b428-ee5852d6f28d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Works.tsx:fetchRepositories',message:'API call start',data:{API_BASE_URL,fullUrl:`${API_BASE_URL}/api/repos`},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    try {
      const response = await fetch(`${API_BASE_URL}/api/repos`);
      // #region agent log
      fetch('http://127.0.0.1:7250/ingest/64b02a6f-ec38-48d4-b428-ee5852d6f28d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Works.tsx:fetchRepositories',message:'Response received',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3,H4'})}).catch(()=>{});
      // #endregion
      if (!response.ok) throw new Error('Failed to fetch repositories');
      
      const data = await response.json();
      setRepositories(data.repositories || []);
      setError(null);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7250/ingest/64b02a6f-ec38-48d4-b428-ee5852d6f28d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Works.tsx:fetchRepositories',message:'Fetch error',data:{error:String(err)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H5'})}).catch(()=>{});
      // #endregion
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
      const response = await fetch(`${API_BASE_URL}/api/repos/refresh`, {
        method: 'POST',
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
        
        // Get first screenshot URL or use placeholder
        const mainScreenshot = nextRepo.screenshots?.[0];
        const imageUrl = mainScreenshot?.url || 
          `https://opengraph.githubassets.com/1/${nextRepo.full_name}`;
        
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
          className="relative [transform-style:preserve-3d] h-[55vh] md:h-[60vh] 2xl:h-[45vh] w-[60px] pointer-events-none"
          style={{
            rotateY: smoothRotation,
            scale: isMobile ? 1.5 : 1,
            opacity: loading ? 0.3 : 1,
          }}
        >
          {filteredProjects.map((project, i) => {
            const angle = (360 / ITEM_COUNT) * i;
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
                placeholder="Search by tech, tags, or content..."
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
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
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

          {/* Quick Filter Tags - Dynamic from actual data */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap gap-2 justify-center mt-4"
          >
            {quickFilterTags.length > 0 ? (
              quickFilterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
                  className={`px-4 py-2 2xl:px-6 2xl:py-3 text-xs md:text-sm 2xl:text-base font-mono uppercase tracking-wider rounded-full transition-all hover:scale-105 ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
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
              ))
            ) : (
              // Fallback tags when no data loaded
              ['Web', 'Mobile', 'Desktop', 'Automation'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
                  className={`px-4 py-2 2xl:px-6 2xl:py-3 text-xs md:text-sm 2xl:text-base font-mono uppercase tracking-wider rounded-full transition-all hover:scale-105 ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
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
              ))
            )}
          </motion.div>

          {/* No Results Message */}
          <AnimatePresence>
            {filteredProjects.length === 0 && searchQuery && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center text-sm text-neutral-500 mt-3"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                No results found
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-sm"
            onClick={() => { setActiveProject(null); setShowDetail(false); }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
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
                          e.currentTarget.src = `https://opengraph.githubassets.com/1/${activeProject.title}`;
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
                          {activeProject.detailed_description || activeProject.description || 
                            "An exploration of form and void, capturing the essence of minimal design through spatial awareness."}
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
  return (
    <div
      onClick={onSelect}
      className="absolute top-0 left-0 w-[60px] h-full backface-hidden group cursor-pointer pointer-events-auto"
      style={{
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`
      }}
    >
      <motion.div
        className="w-full h-full shadow-lg transition-transform duration-300 group-hover:-translate-y-4 hover:brightness-110 border-l border-white/10"
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

// --- Category Icon Helper ---
const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('frontend') || lowerCategory.includes('ui')) return <Globe className="w-4 h-4" />;
  if (lowerCategory.includes('backend') || lowerCategory.includes('server')) return <Server className="w-4 h-4" />;
  if (lowerCategory.includes('database') || lowerCategory.includes('db')) return <Database className="w-4 h-4" />;
  if (lowerCategory.includes('mobile') || lowerCategory.includes('app')) return <Smartphone className="w-4 h-4" />;
  if (lowerCategory.includes('framework') || lowerCategory.includes('library')) return <Layers className="w-4 h-4" />;
  return <Code2 className="w-4 h-4" />;
};

// --- Category Color Helper ---
const getCategoryColor = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('frontend') || lowerCategory.includes('ui')) return 'bg-blue-50 text-blue-600 border-blue-200';
  if (lowerCategory.includes('backend') || lowerCategory.includes('server')) return 'bg-green-50 text-green-600 border-green-200';
  if (lowerCategory.includes('database') || lowerCategory.includes('db')) return 'bg-orange-50 text-orange-600 border-orange-200';
  if (lowerCategory.includes('mobile') || lowerCategory.includes('app')) return 'bg-purple-50 text-purple-600 border-purple-200';
  if (lowerCategory.includes('framework') || lowerCategory.includes('library')) return 'bg-pink-50 text-pink-600 border-pink-200';
  if (lowerCategory.includes('tool') || lowerCategory.includes('devops')) return 'bg-cyan-50 text-cyan-600 border-cyan-200';
  return 'bg-neutral-50 text-neutral-600 border-neutral-200';
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
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState<Set<number>>(new Set());

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
  const hasVideos = project.screenshots?.some(s => s.type === 'video' || s.file?.endsWith('.mp4'));

  const nextScreenshot = () => {
    if (hasScreenshots) {
      setCurrentScreenshotIndex((prev) => 
        prev === project.screenshots.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevScreenshot = () => {
    if (hasScreenshots) {
      setCurrentScreenshotIndex((prev) => 
        prev === 0 ? project.screenshots.length - 1 : prev - 1
      );
    }
  };

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          
          {/* Project Header Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-start gap-4">
              {/* Project Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                {project.title.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {project.category}
                  </span>
                  <span className="text-sm text-neutral-400 font-mono">{project.yearMonth}</span>
                  {project.language && (
                    <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded">
                      {project.language}
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-neutral-900 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {project.title}
                </h1>
                
                {project.subtitle && (
                  <p className="text-neutral-500 text-sm">{project.subtitle}</p>
                )}
                
                {/* Short description */}
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  {project.description || '프로젝트 설명이 없습니다.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-100">
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] px-4 py-3 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub에서 보기
              </a>
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  라이브 데모
                </a>
              )}
            </div>
          </div>

          {/* Tech Stack Section */}
          {project.technologies.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-neutral-400" />
                기술 스택
              </h2>
              
              <div className="space-y-4">
                {Object.entries(techByCategory).map(([category, techs]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      {getCategoryIcon(category)}
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {techs.map((tech, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1.5 text-sm rounded-lg border ${getCategoryColor(category)}`}
                        >
                          {tech.name}
                          {tech.version && (
                            <span className="ml-1 opacity-60 text-xs">v{tech.version}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Section */}
          {project.features.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-neutral-400" />
                기능
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {project.features.map((feature, i) => (
                  <div 
                    key={i}
                    className="group relative"
                  >
                    <span className="px-3 py-2 bg-neutral-50 text-neutral-700 text-sm rounded-lg border border-neutral-200 inline-flex items-center gap-2 hover:bg-neutral-100 transition-colors cursor-default">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      {feature.title}
                    </span>
                    {feature.description && (
                      <div className="absolute left-0 top-full mt-2 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-64">
                        {feature.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots Gallery */}
          {hasScreenshots && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-neutral-400" />
                스크린샷
                {hasVideos && <span className="text-xs text-neutral-400 ml-2">(영상 포함)</span>}
              </h2>
              
              {/* Main Screenshot/Video */}
              <div className="relative aspect-video bg-neutral-100 rounded-xl overflow-hidden mb-4">
                {project.screenshots[currentScreenshotIndex]?.type === 'video' || 
                 project.screenshots[currentScreenshotIndex]?.file?.endsWith('.mp4') ? (
                  <video
                    src={project.screenshots[currentScreenshotIndex].url || project.screenshots[currentScreenshotIndex].file}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={project.screenshots[currentScreenshotIndex]?.url || project.screenshots[currentScreenshotIndex]?.file}
                    alt={project.screenshots[currentScreenshotIndex]?.caption || `Screenshot ${currentScreenshotIndex + 1}`}
                    className="w-full h-full object-contain"
                    onError={() => {
                      setImageLoadError(prev => new Set(prev).add(currentScreenshotIndex));
                    }}
                  />
                )}
                
                {/* Navigation Arrows */}
                {project.screenshots.length > 1 && (
                  <>
                    <button
                      onClick={prevScreenshot}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-neutral-700" />
                    </button>
                    <button
                      onClick={nextScreenshot}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-neutral-700" />
                    </button>
                  </>
                )}
                
                {/* Caption */}
                {project.screenshots[currentScreenshotIndex]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm">
                      {project.screenshots[currentScreenshotIndex].caption}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {project.screenshots.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {project.screenshots.map((screenshot, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentScreenshotIndex(i)}
                      className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === currentScreenshotIndex 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      {screenshot.type === 'video' || screenshot.file?.endsWith('.mp4') ? (
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                          <Play className="w-4 h-4 text-neutral-500" />
                        </div>
                      ) : (
                        <img
                          src={screenshot.url || screenshot.file}
                          alt={screenshot.caption || `Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detailed Description */}
          {project.detailed_description && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-neutral-400" />
                상세 설명
              </h2>
              <div className="prose prose-neutral prose-sm max-w-none">
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {project.detailed_description}
                </p>
              </div>
            </div>
          )}

          {/* Challenges & Achievements */}
          {(project.challenges || project.achievements) && (
            <div className="grid md:grid-cols-2 gap-4">
              {project.challenges && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                  <h2 className="text-lg font-bold text-neutral-900 mb-3">🎯 도전 과제</h2>
                  <p className="text-neutral-600 text-sm leading-relaxed">{project.challenges}</p>
                </div>
              )}
              {project.achievements && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                  <h2 className="text-lg font-bold text-neutral-900 mb-3">🏆 성과</h2>
                  <p className="text-neutral-600 text-sm leading-relaxed">{project.achievements}</p>
                </div>
              )}
            </div>
          )}

          {/* Topics/Tags */}
          {project.topics.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">토픽</h2>
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

          {/* GitHub Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">프로젝트 정보</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <Star className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
                <span className="text-2xl font-bold text-neutral-900">{project.stargazers_count || 0}</span>
                <p className="text-xs text-neutral-500 mt-1">Stars</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                <span className="text-lg font-bold text-neutral-900">{project.yearMonth}</span>
                <p className="text-xs text-neutral-500 mt-1">시작일</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <Code2 className="w-5 h-5 mx-auto mb-2 text-green-500" />
                <span className="text-lg font-bold text-neutral-900">{project.language || 'N/A'}</span>
                <p className="text-xs text-neutral-500 mt-1">주 언어</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <Layers className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                <span className="text-2xl font-bold text-neutral-900">{project.technologies.length}</span>
                <p className="text-xs text-neutral-500 mt-1">기술 스택</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 text-center">
            <p className="text-neutral-300 text-sm mb-4">
              더 자세한 내용은 GitHub에서 확인하세요
            </p>
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
    </motion.div>
  );
}
