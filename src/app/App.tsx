import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SmoothScroll } from '@/app/components/layout/SmoothScroll';
import { Header } from '@/app/components/layout/Header';
import { FloatingButtons } from '@/app/components/layout/FloatingButtons';
import { Intro } from '@/app/components/Intro';
import { Hero } from '@/app/components/sections/Hero';
import { Works } from '@/app/components/sections/Works';
import { About } from '@/app/components/sections/About';
import { Expertise } from '@/app/components/sections/Expertise';
import { Contact } from '@/app/components/sections/Contact';
import '@/styles/fonts.css';
import '@/styles/theme.css';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Intro onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <SmoothScroll>
          <div className="relative bg-[#F7F7F7] min-h-screen">
            <Header />
            <FloatingButtons />
            <motion.main
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <Hero />
              <Works />
              <About />
              <Expertise />
              <Contact />
            </motion.main>
          </div>
        </SmoothScroll>
      )}
    </>
  );
}