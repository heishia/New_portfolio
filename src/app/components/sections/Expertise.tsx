import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

interface ServiceCardProps {
  service: {
    title: string;
    description: string;
    mediaType: 'video' | 'image' | 'mockup';
    videoSrc?: string;
    imageSrc?: string;
    mockupImages?: string[];  // 여러 이미지 슬라이드용
  };
  index: number;
}

function ServiceCard({ service, index }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 목업 이미지 슬라이드 자동 재생
  useEffect(() => {
    if (service.mediaType === 'mockup' && service.mockupImages && service.mockupImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % service.mockupImages!.length);
      }, 2500); // 2.5초마다 전환
      return () => clearInterval(interval);
    }
  }, [service.mediaType, service.mockupImages]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image/Video Frame */}
      <div className="w-full aspect-[4/3] bg-[#1a1a1a] mb-6 overflow-hidden relative">
        {service.mediaType === 'video' && service.videoSrc ? (
          <video
            ref={videoRef}
            src={service.videoSrc}
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
            style={{
              filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
              opacity: isHovered ? 1 : 0.7,
            }}
          />
        ) : service.mediaType === 'image' && service.imageSrc ? (
          <img
            src={service.imageSrc}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
            style={{
              filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
              opacity: isHovered ? 1 : 0.7,
            }}
          />
        ) : service.mediaType === 'mockup' && service.mockupImages && service.mockupImages.length > 0 ? (
          /* Image Slideshow - Top portion of mobile screenshots */
          <>
            {service.mockupImages.map((imgSrc, imgIndex) => (
              <img
                key={imgSrc}
                src={imgSrc}
                alt={`${service.title} ${imgIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-700"
                style={{
                  opacity: imgIndex === currentImageIndex ? 1 : 0,
                  filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
                }}
              />
            ))}
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/10 text-6xl md:text-7xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="border-l-2 border-black pl-6 transition-colors group-hover:border-gray-400">
        <h4 className="text-xl md:text-2xl 2xl:text-2xl font-bold mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {service.title}
        </h4>
        <p className="text-sm md:text-base 2xl:text-base leading-relaxed text-gray-600 group-hover:text-gray-900 transition-colors" style={{ fontFamily: "'Pretendard', sans-serif" }}>
          {service.description}
        </p>
      </div>
    </div>
  );
}

const services = [
  {
    title: '모바일 앱 개발',
    description: 'iOS와 Android를 아우르는 네이티브 및 크로스플랫폼 모바일 애플리케이션을 제작합니다.',
    mediaType: 'mockup' as const,
    mockupImages: ['/images/3.png', '/images/9.png', '/images/11.png']
  },
  {
    title: '반응형 홈페이지',
    description: '모든 디바이스에서 완벽하게 작동하는 반응형 웹사이트를 제작합니다.',
    mediaType: 'video' as const,
    videoSrc: '/videos/사이트.mp4'
  },
  {
    title: '쇼핑몰 (이커머스)',
    description: '온라인 쇼핑몰 구축부터 결제 시스템 연동까지 완벽한 이커머스 솔루션을 제공합니다.',
    mediaType: 'image' as const,
    imageSrc: '/images/lune.png'
  },
  {
    title: '자동화 프로그램',
    description: '반복 작업을 자동화하여 업무 효율성을 극대화하는 맞춤형 솔루션을 개발합니다.',
    mediaType: 'video' as const,
    videoSrc: '/videos/자동화프로그램.mp4'
  },
  {
    title: '플랫폼 개발',
    description: 'SaaS, 관리 시스템, 대시보드 등 비즈니스에 맞는 플랫폼을 구축합니다.',
    mediaType: 'video' as const,
    videoSrc: '/videos/플랫폼.mp4'
  }
];

const techStacks = [
  {
    category: '언어',
    categoryEn: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Go']
  },
  {
    category: '프론트엔드',
    categoryEn: 'Frontend',
    items: ['React', 'Next.js', 'Vite', 'TailwindCSS', 'Radix UI', 'Electron']
  },
  {
    category: '백엔드',
    categoryEn: 'Backend',
    items: ['FastAPI', 'Uvicorn', 'WebSocket']
  },
  {
    category: '데이터베이스 & ORM',
    categoryEn: 'Database & ORM',
    items: ['Supabase', 'PostgreSQL', 'Prisma']
  },
  {
    category: '클라우드 & 인프라',
    categoryEn: 'Cloud & Infrastructure',
    items: ['Google Cloud', 'Vultr', 'Naver Cloud']
  },
  {
    category: '테스팅 & 모니터링',
    categoryEn: 'Testing & Monitoring',
    items: ['Pytest', 'Jest', 'Playwright', 'Sentry']
  },
  {
    category: 'API & 외부 서비스',
    categoryEn: 'API & External Services',
    items: ['Google Ads API', 'Kakao API', 'Naver API', 'OpenAI API']
  },
  {
    category: '데브옵스 & 도구',
    categoryEn: 'DevOps & Tools',
    items: ['Vercel', 'Railway', 'Docker', 'GitHub Actions', 'Git', 'GitHub', 'npm', 'Cursor']
  }
];

export function Expertise() {
  const [showAllTechStacks, setShowAllTechStacks] = useState(false);

  return (
    <section
      id="service"
      className="min-h-screen bg-white px-4 md:px-6 py-20 md:py-32"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-16 md:mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span className="text-[30px] md:text-4xl 2xl:text-4xl uppercase tracking-widest mb-4 block text-gray-400">03 / Service</span>
        </motion.div>

        {/* Services */}
        <div className="mb-20 md:mb-32">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {services.map((service, index) => (
              <div key={service.title} className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)]">
                <ServiceCard service={service} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div id="tech-stack" className="scroll-mt-20 md:scroll-mt-32">
          <motion.div
            className="mb-16 md:mb-24 mt-20 md:mt-32 border-t border-gray-200 pt-16 md:pt-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-[30px] md:text-4xl 2xl:text-4xl uppercase tracking-widest mb-4 block text-gray-400">04 / Tech Stack</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {techStacks.map((stack, index) => (
              <motion.div
                key={stack.category}
                className={`${!showAllTechStacks && index >= 4 ? 'hidden md:block' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="mb-4">
                  <h4 className="text-sm md:text-base 2xl:text-base font-bold text-gray-900" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    {stack.category}
                  </h4>
                  <p className="text-[10px] md:text-xs 2xl:text-xs uppercase tracking-widest text-gray-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {stack.categoryEn}
                  </p>
                </div>
                <ul className="space-y-2 text-sm md:text-base 2xl:text-base" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                  {stack.items.map((item) => (
                    <li key={item} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {!showAllTechStacks && (
            <motion.div
              className="mt-12 text-center md:hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setShowAllTechStacks(true)}
                className="px-8 py-3 border-2 border-black text-black font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-black hover:text-white transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                더보기
              </button>
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
}