import { motion } from 'motion/react';
import { Asterisk } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 flex justify-between items-start p-4 md:p-6 mix-blend-difference text-[#111111]"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start gap-2 max-w-[150px] md:max-w-[200px] text-[9px] md:text-xs font-sans uppercase tracking-wide leading-tight">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Asterisk className="w-3 h-3 md:w-4 md:h-4" />
        </motion.div>
        <span>Open for any<br />collaborations and offers</span>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 text-[6px] md:text-[7px] font-bold tracking-widest uppercase">
        KIMPPOP®
      </div>

      <div className="text-[9px] md:text-xs font-sans uppercase tracking-wide text-right">
        Folio<br />Vol.1 —
      </div>
    </motion.header>
  );
}
