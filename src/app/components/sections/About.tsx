import { motion } from 'motion/react';

export function About() {
  return (
    <section
      id="about"
      className="min-h-screen bg-[#F7F7F7] px-4 md:px-6 py-20 md:py-32 lg:py-48"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header - Separated */}
        <motion.div
          className="mb-16 md:mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span className="text-[30px] md:text-4xl 2xl:text-4xl uppercase tracking-widest block text-gray-400">02 / About</span>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-32">

          <div className="flex flex-col justify-center order-2 md:order-1">
            <div className="relative">
              <div className="w-full aspect-[3/4] bg-gray-200 overflow-hidden">
                {/* Profile Image */}
                <img 
                  src="/images/증명사진.png" 
                  alt="진푸른 프로필 사진"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm md:text-base text-gray-400 uppercase tracking-widest mb-2">
                Team Leader
              </p>
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl 2xl:text-5xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                진푸른
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-500 mb-8 md:mb-12 tracking-wide">
                Fullstack Developer
              </p>
            </motion.div>

            <motion.p
              className="text-base md:text-lg lg:text-xl 2xl:text-xl font-light leading-relaxed text-gray-600"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              다양한 언어와 기술 스택을 다루며, DB 설계부터 서버 구축, 배포 자동화, 모니터링, SEO까지 서비스의 기획부터 운영까지 전 과정을 수행합니다.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}