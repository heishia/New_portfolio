import { motion } from 'motion/react';
import { Lightbulb, Music, Coffee } from 'lucide-react';

export function LineArtCharacter() {
  // Animation variants for the "breathing" loop
  const breathe = {
    animate: {
      y: [0, -3, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  const armType = {
    animate: {
      rotate: [0, 2, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  const dogTail = {
    animate: {
      rotate: [0, 10, 0],
      transition: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-end justify-center">
      {/* 
        ================================================================
        LOTTIE-LIKE VECTOR SYSTEM
        Method: SVG Paths with framer-motion variants
        Layer Separation: Background -> Furniture -> Dog -> Body -> Arms -> Laptop
        ================================================================
      */}
      <motion.svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial="initial"
        animate="animate"
      >
        {/* --- DEFS & STYLES --- */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="offsetblur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- LAYER 1: SCENE / FURNITURE --- */}
        <g id="furniture">
          {/* Floor Shadow */}
          <ellipse cx="250" cy="420" rx="180" ry="10" fill="#000000" opacity="0.05" />
          
          {/* Table */}
          <path d="M100 350 H400" stroke="#333" strokeWidth="4" strokeLinecap="round" />
          <path d="M140 350 L140 450" stroke="#333" strokeWidth="4" strokeLinecap="round" /> {/* Leg L */}
          <path d="M360 350 L360 450" stroke="#333" strokeWidth="4" strokeLinecap="round" /> {/* Leg R */}

          {/* Chair */}
          <path d="M180 350 L180 420" stroke="#555" strokeWidth="4" strokeLinecap="round" />
          <path d="M160 300 Q160 350 180 350" stroke="#555" strokeWidth="4" strokeLinecap="round" />
          <path d="M160 300 L160 220" stroke="#555" strokeWidth="4" strokeLinecap="round" /> {/* Backrest */}
        </g>

        {/* --- LAYER 2: THE DOG (Separated Parts) --- */}
        <motion.g 
          id="dog" 
          transform="translate(80, 0)"
          variants={breathe} // Inherit breathing rhythm
        >
          {/* Dog Body */}
          <path 
            d="M50 420 H90 Q100 420 100 400 V360 Q100 340 80 340 H60 Q40 340 40 360 V410 Q40 420 50 420Z" 
            fill="#E5E5E5" 
            stroke="#333" strokeWidth="3"
          />
          {/* Dog Head (Animated) */}
          <motion.g
            style={{ originX: 0.5, originY: 0.9 }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
             <circle cx="70" cy="330" r="25" fill="#E5E5E5" stroke="#333" strokeWidth="3" />
             {/* Ears */}
             <path d="M50 320 L40 300 L60 310" fill="#333" />
             <path d="M90 320 L100 300 L80 310" fill="#333" />
             {/* Face */}
             <circle cx="62" cy="330" r="2" fill="#333" />
             <circle cx="78" cy="330" r="2" fill="#333" />
             <path d="M65 340 Q70 345 75 340" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </motion.g>
          {/* Dog Tail (Wagging) */}
          <motion.path 
            d="M100 390 Q120 380 120 360" 
            stroke="#333" strokeWidth="4" strokeLinecap="round"
            style={{ originX: 0, originY: 1 }}
            variants={dogTail}
            animate="animate"
          />
        </motion.g>

        {/* --- LAYER 3: THE WOMAN (Rigged Character) --- */}
        <motion.g id="woman" transform="translate(40,0)">
          
          {/* Legs (Sitting) */}
          <path d="M220 350 L270 350 L270 410" fill="none" stroke="#333" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M270 410 H290" stroke="#333" strokeWidth="16" strokeLinecap="round" /> {/* Shoe */}

          {/* Torso Group (Breathing Animation) */}
          <motion.g variants={breathe} animate="animate">
            
            {/* Body Shape */}
            <path 
              d="M220 350 L210 250 Q210 230 230 230 H250 Q270 230 270 250 L260 350" 
              fill="#333" // Swiss Black Shirt
            />
            
            {/* Neck */}
            <rect x="232" y="210" width="16" height="25" fill="#F2C9AC" />

            {/* Head Group (Bobbing slightly opposite to body for realism) */}
            <motion.g 
              animate={{ y: [0, 2, 0] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
               {/* Face */}
               <circle cx="240" cy="190" r="35" fill="#F2C9AC" />
               {/* Hair */}
               <path d="M205 190 Q205 150 240 150 Q275 150 275 190 V200 H205 V190 Z" fill="#111" />
               <circle cx="210" cy="160" r="15" fill="#111" /> {/* Bun */}
               {/* Glasses */}
               <line x1="220" y1="190" x2="260" y2="190" stroke="#333" strokeWidth="2" />
               <circle cx="230" cy="190" r="8" stroke="#333" strokeWidth="2" fill="none"/>
               <circle cx="250" cy="190" r="8" stroke="#333" strokeWidth="2" fill="none"/>
            </motion.g>

            {/* ARM RIGGING (Complex Part) */}
            {/* Right Arm (Back) */}
            <path d="M260 250 L300 320" stroke="#F2C9AC" strokeWidth="12" strokeLinecap="round" />

            {/* Left Arm (Front - Typing) */}
            <g>
              {/* Upper Arm (Shoulder to Elbow) */}
              <path d="M220 250 L200 310" stroke="#F2C9AC" strokeWidth="14" strokeLinecap="round" />
              {/* Forearm (Elbow to Hand) - Pivoting */}
              <motion.path 
                 d="M200 310 L250 320" 
                 stroke="#F2C9AC" strokeWidth="14" strokeLinecap="round"
                 variants={armType}
                 animate="animate"
                 style={{ originX: 0, originY: 0 }} // Rotate around elbow
              />
            </g>
          </motion.g>
        </motion.g>

        {/* --- LAYER 4: LAPTOP --- */}
        <g id="laptop" transform="translate(250, 310)">
           {/* Base */}
           <path d="M0 40 H80 L90 50 H-10 Z" fill="#999" />
           {/* Screen Group */}
           <path d="M0 40 L0 0 Q0 -5 5 -5 H75 Q80 -5 80 0 L80 40" fill="#CCC" />
           {/* Logo */}
           <circle cx="40" cy="20" r="6" fill="#FFF" />
        </g>

      </motion.svg>

      {/* --- LAYER 5: FLOATING ICONS (The Lottie "Pop" Effect) --- */}
      {/* 1. Lightbulb (Idea) */}
      <motion.div
        className="absolute top-[20%] right-[25%] bg-white p-3 rounded-full shadow-lg border-2 border-black z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1], // Overshoot
          opacity: [0, 1, 1],
          y: [0, -15, 0]      // Float
        }}
        transition={{ 
          duration: 2.5, 
          times: [0, 0.4, 1],
          repeat: Infinity, 
          repeatDelay: 2 
        }}
      >
        <Lightbulb strokeWidth={2.5} size={24} className="text-yellow-500" />
      </motion.div>

      {/* 2. Music (Vibe) */}
      <motion.div
        className="absolute top-[30%] left-[20%] bg-black p-2 rounded-full shadow-lg z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1],
          rotate: [-10, 10, -10]
        }}
        transition={{ 
          duration: 3, 
          delay: 1,
          times: [0, 0.4, 1],
          repeat: Infinity, 
          repeatDelay: 1
        }}
      >
        <Music strokeWidth={2.5} size={20} className="text-white" />
      </motion.div>

      {/* 3. Coffee (Fuel) */}
      <motion.div
        className="absolute bottom-[25%] right-[10%] bg-blue-500 p-2 rounded-full shadow-lg border-2 border-black z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1], 
          opacity: [0, 1, 1],
        }}
        transition={{ 
          duration: 2, 
          delay: 2,
          times: [0, 0.4, 1],
          repeat: Infinity, 
          repeatDelay: 3
        }}
      >
        <Coffee strokeWidth={2.5} size={20} className="text-white" />
      </motion.div>
    </div>
  );
}
