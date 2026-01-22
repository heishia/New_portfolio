import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, AnimatePresence, useSpring } from 'motion/react';
import { ArrowRight, X, Hand, Search, RefreshCw, ExternalLink, Github } from 'lucide-react';

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
}

interface ProjectDisplay {
  id: number;
  uniqueId: string;
  title: string;
  category: string;
  image: string;
  year: string;
  displayNumber: number;
  spineColor: string;
  textColor: string;
  // Extended data
  description: string | null;
  html_url: string;
  demo_url: string | null;
  technologies: Array<{ name: string; category: string }>;
  features: Array<{ title: string; description: string }>;
  detailed_description: string | null;
}

// --- Fallback Data (shown when API unavailable) ---
const fallbackProjects: ProjectDisplay[] = [
  {
    id: 1,
    uniqueId: "fallback-1",
    title: "Loading...",
    category: "Portfolio",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    year: "2024",
    displayNumber: 1,
    spineColor: "#282828",
    textColor: "#FFFFFF",
    description: "Loading projects from GitHub...",
    html_url: "#",
    demo_url: null,
    technologies: [],
    features: [],
    detailed_description: null,
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
    
    // Extract year from repo creation or use current year
    const year = new Date().getFullYear().toString();
    
    displayItems.push({
      id: repo.id,
      uniqueId: `${repo.id}-${i}`,
      title: repo.title || repo.name,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      image: imageUrl,
      year,
      displayNumber: i + 1,
      spineColor,
      textColor,
      description: repo.description,
      html_url: repo.html_url,
      demo_url: repo.demo_url,
      technologies: repo.technologies || [],
      features: repo.features || [],
      detailed_description: repo.detailed_description,
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

  // Computed projects
  const projects = transformReposToProjects(repositories);
  
  // Filtered projects based on search
  const filteredProjects = searchQuery.trim()
    ? projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technologies.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : projects;

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
                placeholder="Search"
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

          {/* Quick Filter Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap gap-2 justify-center mt-4"
          >
            {['Web', 'Mobile', 'Desktop', 'Automation'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-4 py-2 2xl:px-6 2xl:py-3 text-xs md:text-sm 2xl:text-base font-mono uppercase tracking-wider bg-white/60 hover:bg-white border border-black/10 hover:border-black/20 rounded-full transition-all hover:scale-105"
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                {tag}
              </button>
            ))}
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
            onClick={() => setActiveProject(null)}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <motion.div
              layoutId={`card-${activeProject.uniqueId}`}
              className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row cursor-auto"
              onClick={(e) => e.stopPropagation()}
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
                  <p className="text-neutral-500 font-mono text-sm">{activeProject.year}</p>
                  
                  {/* Technologies */}
                  {activeProject.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {activeProject.technologies.slice(0, 5).map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] bg-neutral-50 text-neutral-500 rounded">
                          {tech.name}
                        </span>
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
                </div>
              </div>
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
