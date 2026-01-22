import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';

import { FaThreads, FaYoutube, FaGithub, FaLinkedin } from 'react-icons/fa6';

const navItems = [
  { id: '01', label: 'Portfolio', section: 'portfolio' },
  { id: '02', label: 'About', section: 'about' },
  { id: '03', label: 'Service', section: 'service' },
  { id: '04', label: 'Tech Stack', section: 'tech-stack' },
  { id: '05', label: 'Contact', section: 'contact' },
];

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-8 flex flex-col justify-between overflow-hidden">
      {/* Main Title */}
      <div className="flex flex-col items-center justify-center mb-8 md:mb-12 relative z-10">
        <motion.div
          className="flex items-center justify-center relative"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <h1 className="font-sans text-[7.5vw] md:text-[6vw] lg:text-[7.5vw] 2xl:text-[7.5vw] font-bold tracking-[0.05em] uppercase leading-none text-center mix-blend-difference">
            KIMPPOP
          </h1>
          <span className="font-sans text-sm md:text-lg lg:text-2xl 2xl:text-2xl absolute -right-8 md:-right-12 lg:-right-16 2xl:-right-16 top-0 md:top-1 lg:top-2 2xl:top-2 text-gray-400">(DEV)</span>
        </motion.div>
      </div>

      {/* Nav Row */}
      {/* Nav Row */}
      <div className="w-full flex flex-col md:grid md:grid-cols-5 gap-6 md:gap-4 border-t border-gray-200 pt-6 md:pt-4 text-3xl md:text-2xl 2xl:text-2xl font-sans uppercase tracking-wide mb-8 md:mb-0">
        {navItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="cursor-pointer hover:text-gray-500 transition-colors flex items-center justify-center md:justify-start md:block whitespace-nowrap"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            onClick={() => scrollToSection(item.section)}
          >
            <span className="mr-4 md:mr-2 opacity-50 text-base md:text-inherit align-top">{item.id}</span>
            {item.label}
          </motion.div>
        ))}
      </div>

      {/* Content Area */}
      {/* Content Area */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 items-end relative mt-4 md:mt-0">

        {/* SNS Logos - Left on Mobile, Left on Desktop */}
        <div className="order-2 md:order-1 md:col-span-3 flex justify-start items-center gap-6 md:gap-5 lg:gap-6 pb-2 md:pb-0 w-full">
          <motion.div
            className="flex gap-6 justify-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            <a href="https://threads.net" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
              <FaThreads className="w-6 h-6 md:w-7 md:h-7 2xl:w-8 2xl:h-8 text-black" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
              <FaYoutube className="w-6 h-6 md:w-7 md:h-7 2xl:w-8 2xl:h-8 text-black" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
              <FaGithub className="w-6 h-6 md:w-7 md:h-7 2xl:w-8 2xl:h-8 text-black" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
              <FaLinkedin className="w-6 h-6 md:w-7 md:h-7 2xl:w-8 2xl:h-8 text-black" />
            </a>
          </motion.div>
        </div>

        {/* Center Image - Simulated Motion Graphic */}
        <div className="order-1 md:order-2 md:col-span-6 flex justify-center items-end relative min-h-[15vh] md:min-h-[40vh] w-full">
          {/* Placeholder for new motion */}
          <div className="w-full h-full flex items-center justify-center">
            {/* New Motion Content Will Go Here */}
          </div>

          <motion.div
            className="absolute -bottom-6 md:-bottom-10 text-[9px] md:text-[10px] 2xl:text-[11px] uppercase tracking-wider opacity-60 hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 2 }}
          >
            Python. TS. DevOps. Fullstack.
          </motion.div>
        </div>

        {/* Right Text */}
        <motion.div
          className="order-3 md:order-3 md:col-span-3 text-[10px] md:text-xs 2xl:text-sm leading-relaxed uppercase w-full md:max-w-[240px] 2xl:max-w-[280px] md:text-right md:justify-self-end mt-4 md:mt-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          <div className="mb-2 md:mb-4 text-xl md:text-2xl 2xl:text-3xl flex md:justify-end">✦</div>
          <p className="md:text-right max-w-[80%] md:max-w-full">
            Web, App, Automation, and Desktop Software. Building everything from scratch.
          </p>
        </motion.div>

        {/* Mobile Only Tagline */}
        <motion.div
          className="order-4 block md:hidden text-[9px] uppercase tracking-wider opacity-60 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
        >
          Python. TS. DevOps. Fullstack.
        </motion.div>
      </div>
    </section>
  );
}