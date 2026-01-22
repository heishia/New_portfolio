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
                {/* Placeholder for About Image or just a solid color block as per minimalist style */}
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-white/20 font-serif text-4xl md:text-6xl">
                  (Me)
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center order-1 md:order-2">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl 2xl:text-5xl font-bold text-gray-900 mb-8 md:mb-12"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              TURNING VISION INTO REALITY
            </motion.h2>

            <motion.p
              className="text-base md:text-lg lg:text-xl 2xl:text-xl font-light leading-relaxed text-gray-600"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              코드가 닿을 수 있는 모든 영역을 다룹니다. 플랫폼의 경계는 제게 장벽이 아닌 연결의 기회입니다. 어떤 형태든 아이디어든 상상한대로 구현해드립니다.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}