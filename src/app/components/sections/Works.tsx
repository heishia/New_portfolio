import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useSpring } from 'motion/react';
import { ArrowRight, X, Hand, Search } from 'lucide-react';

// --- DATA & COLORS ---

const baseProjects = [
  {
    id: 1,
    title: "Ethereal Spaces",
    category: "Architecture",
    image: "https://images.unsplash.com/photo-1755018237309-bb3f5efeb2c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlJTIwYmxhY2slMjBhbmQlMjB3aGl0ZXxlbnwxfHx8fDE3Njg3MTMzNDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    year: "2024"
  },
  {
    id: 2,
    title: "Mono Object",
    category: "Product Design",
    image: "https://images.unsplash.com/photo-1658526064786-63d6e3603215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMGRlc2lnbnxlbnwxfHx8fDE3Njg2MzM5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    year: "2023"
  },
  {
    id: 3,
    title: "Geometric Flow",
    category: "Art Direction",
    image: "https://images.unsplash.com/photo-1716363013751-78dc48b0403d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHNoYXBlcyUyMG1pbmltYWxpc3Q8ZW58MXx8fHwxNzY4NjQ3NjU2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    year: "2024"
  },
  {
    id: 4,
    title: "Interior Void",
    category: "Interior",
    image: "https://images.unsplash.com/photo-1759038086962-13119e3da5bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmlvciUyMGRlc2lnbiUyMG1pbmltYWxpc3QlMjBibGFjayUyMGFuZCUyMHdoaXRlfGVufDF8fHx8MTc2ODcxMzM0OXww&ixlib=rb-4.1.0&q=80&w=1080",
    year: "2023"
  },
  {
    id: 5,
    title: "Silent Forms",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1507643179173-61b0f729435a?q=80&w=1080&auto=format&fit=crop",
    year: "2022"
  }
];

// Generate smooth Sine Wave Gradient (White -> Dark -> White)
const generateColorData = (index: number, total: number) => {
  // Figma design uses specific color values for 40 items
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

  // Parse hex to get lightness
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

// Create enough items to form a nice circle
const ITEM_COUNT = 40;
const ITEM_WIDTH = 60; // Width of each spine in px
const GAP = 10; // Gap between spines
const DESKTOP_RADIUS = 500; // Radius for medium desktop (769px-1279px)
const LARGE_DESKTOP_RADIUS = 800; // Radius for large desktop (≥1280px) - wider utilization

// Mobile: Calculate radius to fit exactly 4 spines in viewport
// Formula: For 4 items visible, we need circumference = 4 * (ITEM_WIDTH + GAP)
// Then radius = circumference / (2 * PI)
const MOBILE_VISIBLE_COUNT = 4;
const MOBILE_RADIUS = (MOBILE_VISIBLE_COUNT * (ITEM_WIDTH + GAP)) / (2 * Math.PI);

const projects = Array(ITEM_COUNT).fill(baseProjects).flat().slice(0, ITEM_COUNT).map((p, i) => {
  const { spineColor, textColor } = generateColorData(i, ITEM_COUNT);
  return {
    ...p,
    uniqueId: `${p.id}-${i}`,
    // Sequential numbering (1, 2, 3... 40)
    displayNumber: i + 1,
    // Alternating years 2025 / 2026
    year: i % 2 === 0 ? "2025" : "2026",
    spineColor,
    textColor
  };
});

export function Works() {
  // Rotation State
  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, { damping: 40, stiffness: 200 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive radius based on screen size
  const [isMobile, setIsMobile] = useState(false);
  const [isLargeDesktop, setIsLargeDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLargeDesktop(window.innerWidth >= 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Dragging State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startRotation = useRef(0);
  // Track if actual movement occurred to distinguish click vs drag
  const hasMoved = useRef(false);

  // Active Project (Expanded)
  const [activeProject, setActiveProject] = useState<typeof projects[0] | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Filter projects based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = projects.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.year.includes(query)
    );
    setFilteredProjects(filtered);
  }, [searchQuery]);

  // Handlers
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

    // Only consider it a "move" if dragged more than 5px
    if (Math.abs(delta) > 5) {
      hasMoved.current = true;
    }

    // Sensitivity factor: 0.2 degrees per pixel
    rotation.set(startRotation.current + delta * 0.2);
  };

  const onMouseUp = () => {
    isDragging.current = false;
    // We do NOT reset hasMoved here, we need it for the onClick check
  };

  const onMouseLeave = () => {
    isDragging.current = false;
  };

  // Touch handlers for mobile
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

    if (Math.abs(delta) > 5) {
      hasMoved.current = true;
    }

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
      {/* Background/Context - Separated Top Block */}
      <div className="w-full text-center pointer-events-none z-10 shrink-0 pt-12 md:pt-16 pb-4 md:pb-6">
        <h2 className="text-[12vw] md:text-[8vw] 2xl:text-[5vw] font-bold text-[#E5E5E5] leading-none tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
          PORTFOLIO
        </h2>
      </div>

      {/* 3D SCENE CONTAINER - Takes remaining space */}
      <div className="relative flex-1 2xl:flex-none w-full flex items-start justify-center cursor-grab active:cursor-grabbing pt-8 md:pt-12 pb-8 md:pb-12 2xl:pt-8 2xl:pb-8">

        {/* ROTATING CYLINDER */}
        <motion.div
          className="relative [transform-style:preserve-3d] h-[55vh] md:h-[60vh] 2xl:h-[45vh] w-[60px] pointer-events-none"
          style={{
            rotateY: smoothRotation,
            scale: isMobile ? 1.5 : 1
          }}
        >
          {filteredProjects.map((project, i) => {
            // Calculate angle for each item
            const angle = (360 / ITEM_COUNT) * i;

            return (
              <Spine3D
                key={project.uniqueId}
                project={project}
                angle={angle}
                radius={isMobile ? MOBILE_RADIUS : (isLargeDesktop ? LARGE_DESKTOP_RADIUS : DESKTOP_RADIUS)}
                onSelect={() => {
                  // Only select if we haven't dragged
                  if (!hasMoved.current) {
                    setActiveProject(project);
                  }
                }}
              />
            );
          })}
        </motion.div>

      </div>

      {/* DRAG HINT */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none text-neutral-400"
          >
            <Hand className="w-5 h-5 2xl:w-7 2xl:h-7 animate-pulse" />
            <span className="text-xs 2xl:text-base font-mono uppercase tracking-widest">Drag to Rotate</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH BAR - Bottom position with more spacing */}
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
                className="w-full pl-14 pr-14 py-5 md:py-6 2xl:py-5 bg-transparent text-[15px] 2xl:text-xl placeholder:text-neutral-400 focus:outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors"
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
        </div>
      </div>

      {/* ACTIVE PROJECT OVERLAY (Modal) */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveProject(null)}
            // Stop propagation to prevent background rotation while interacting with modal
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
              <div className="w-full md:w-1/3 h-1/2 md:h-full p-8 flex flex-col justify-between bg-white relative z-10">
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
                  <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>{activeProject.title}</h3>
                  <p className="text-neutral-500 font-mono text-sm">{activeProject.year}</p>
                </div>

                <div>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-8">
                    An exploration of form and void, capturing the essence of minimal design through spatial awareness.
                  </p>
                  <button className="w-full py-4 bg-black text-white text-sm font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 group">
                    View Project
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Spine3D({ project, angle, radius, onSelect }: { project: any, angle: number, radius: number, onSelect: () => void }) {
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