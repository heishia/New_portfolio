import { motion } from 'motion/react';
import { useState } from 'react';

const services = [
  {
    title: '모바일 앱 개발',
    description: 'iOS와 Android를 아우르는 네이티브 및 크로스플랫폼 모바일 애플리케이션을 제작합니다.'
  },
  {
    title: '웹개발',
    description: '반응형 웹사이트부터 복잡한 웹 애플리케이션까지 최신 기술로 구현합니다.'
  },
  {
    title: '자사몰 (이커머스)',
    description: '온라인 쇼핑몰 구축부터 결제 시스템 연동까지 완벽한 이커머스 솔루션을 제공합니다.'
  },
  {
    title: '자동화 프로그램',
    description: '반복 작업을 자동화하여 업무 효율성을 극대화하는 맞춤형 솔루션을 개발합니다.'
  },
  {
    title: '데스크톱 소프트웨어',
    description: 'Windows, Mac, Linux를 지원하는 크로스플랫폼 데스크톱 애플리케이션을 제작합니다.'
  },
  {
    title: '사내 프로그램',
    description: '기업 맞춤형 내부 시스템과 관리 도구를 설계하고 구축합니다.'
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
          <span className="text-[30px] md:text-4xl 2xl:text-5xl uppercase tracking-widest mb-4 block text-gray-400">03 / Service</span>
        </motion.div>

        {/* Services */}
        <div className="mb-20 md:mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                {/* Image Frame */}
                <motion.div
                  className="w-full aspect-[4/3] bg-[#1a1a1a] mb-6 overflow-hidden relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/10 text-6xl md:text-7xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="border-l-2 border-black pl-6 transition-colors group-hover:border-gray-400">
                  <h4 className="text-xl md:text-2xl 2xl:text-4xl font-bold mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {service.title}
                  </h4>
                  <p className="text-sm md:text-base 2xl:text-xl leading-relaxed text-gray-600 group-hover:text-gray-900 transition-colors" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    {service.description}
                  </p>
                </div>
              </motion.div>
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
            <span className="text-[30px] md:text-4xl 2xl:text-5xl uppercase tracking-widest mb-4 block text-gray-400">04 / Tech Stack</span>
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
                  <h4 className="text-sm md:text-base 2xl:text-xl font-bold text-gray-900" style={{ fontFamily: "'Pretendard', sans-serif" }}>
                    {stack.category}
                  </h4>
                  <p className="text-[10px] md:text-xs 2xl:text-sm uppercase tracking-widest text-gray-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {stack.categoryEn}
                  </p>
                </div>
                <ul className="space-y-2 text-sm md:text-base 2xl:text-xl" style={{ fontFamily: "'Pretendard', sans-serif" }}>
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