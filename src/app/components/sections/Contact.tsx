import { motion } from 'motion/react';
import { ArrowUpRight, Github, Instagram, Linkedin, Twitter } from 'lucide-react';

export function Contact() {
  return (
    <section
      id="contact"
      className="min-h-screen bg-[#F7F7F7] px-4 md:px-6 pt-20 md:pt-32 pb-8 md:pb-12 flex flex-col justify-between relative overflow-hidden"
    >

      <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-[5vw] md:text-[5vw] 2xl:text-[6vw] font-bold leading-[0.9]" style={{ fontFamily: "'Montserrat', sans-serif" }}>Let's collaborate</h2>
          <h2 className="text-[4.5vw] md:text-[4.5vw] 2xl:text-[5.5vw] font-medium leading-[0.9] tracking-tight mt-2">on your next big idea</h2>
        </motion.div>

        <motion.button
          className="mt-12 md:mt-16 px-6 md:px-8 2xl:px-12 py-3 md:py-4 2xl:py-6 border border-black rounded-full uppercase text-xs md:text-sm 2xl:text-lg tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start a project
        </motion.button>
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-[10px] md:text-xs 2xl:text-base font-sans uppercase tracking-wide border-t border-gray-200 pt-6 md:pt-8 mt-12 md:mt-20 relative z-10">
        <div>
          <span className="text-gray-400 block mb-3 md:mb-4">Social</span>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
              <Github className="w-3 h-3 md:w-4 md:h-4 2xl:w-6 2xl:h-6" /> Github
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
              <Linkedin className="w-3 h-3 md:w-4 md:h-4 2xl:w-6 2xl:h-6" /> LinkedIn
            </li>
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
              <Instagram className="w-3 h-3 md:w-4 md:h-4 2xl:w-6 2xl:h-6" /> Instagram
            </li>
          </ul>
        </div>
        <div>
          <span className="text-gray-400 block mb-3 md:mb-4">Portfolio</span>
          <ul className="space-y-1">
            <li className="flex items-center gap-1 cursor-pointer hover:underline">GitHub Projects <ArrowUpRight className="w-2 h-2 md:w-3 md:h-3 2xl:w-4 2xl:h-4" /></li>
            <li className="flex items-center gap-1 cursor-pointer hover:underline">Live Demos <ArrowUpRight className="w-2 h-2 md:w-3 md:h-3 2xl:w-4 2xl:h-4" /></li>
          </ul>
        </div>
        <div>
          <span className="text-gray-400 block mb-3 md:mb-4">Contact</span>
          <ul className="space-y-1">
            <li className="cursor-pointer hover:underline">010-5803-4771</li>
            <li className="cursor-pointer hover:underline">Seoul, Korea</li>
          </ul>
        </div>
        <div>
          <span className="text-gray-400 block mb-3 md:mb-4">Email</span>
          <a href="mailto:bluejin1130@gmail.com" className="hover:underline break-all">bluejin1130@gmail.com</a>
        </div>
      </div>

      <div className="absolute bottom-3 md:bottom-4 right-4 md:right-6 text-[9px] md:text-[10px] 2xl:text-sm text-gray-400">
        ©2026
      </div>
    </section>
  );
}