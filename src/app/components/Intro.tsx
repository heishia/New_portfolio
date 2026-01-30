import { motion, useAnimation, animate } from 'motion/react';
import { useEffect, useState } from 'react';

interface IntroProps {
  onComplete: () => void;
}

export function Intro({ onComplete }: IntroProps) {
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  const topLineControls = useAnimation();
  const bottomLineControls = useAnimation();

  const ppopContainerBlueControls = useAnimation();
  const ppopContainerWhiteControls = useAnimation();
  const devContainerControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // INIT
      // PPOP Text Zone: ~400px wide, centered in 800px.
      // Start: 200px (25%), End: 600px (75%).

      // Blue visible full.
      ppopContainerBlueControls.set({ opacity: 1, clipPath: 'inset(0 0 0 0)' });
      // White hidden fully.
      // Inset Left 25% (Start of text). Right 75% (End of text -> Hidden relative to Start).
      ppopContainerWhiteControls.set({ opacity: 1, clipPath: 'inset(49% 75% 49% 25%)' });

      devContainerControls.set({ opacity: 1, clipPath: 'inset(0 0 0 100%)' });

      // Lines start at Left 200 (25%) with Width 0
      topLineControls.set({ width: 0, left: 200, rotate: 0, y: 0 });
      bottomLineControls.set({ width: 0, left: 200, rotate: 0, y: 0 });

      // Force initial render frame
      await new Promise(r => setTimeout(r, 100));

      // 1. Strike (Left 200 -> Grows 400px)
      // Strike Zone: 200px to 600px.
      const textStartX = 200;
      const textWidth = 400;
      const stageWidth = 800; // Fixed stage

      await animate(0, 100, {
        duration: 0.7, // Accelerate
        ease: 'easeIn',
        onUpdate: (val) => {
          // val is 0-100 percentage of the TextWidth (400px)
          const currentWidth = (textWidth * val) / 100;

          topLineControls.set({ width: currentWidth });
          bottomLineControls.set({ width: currentWidth });

          // Mask Reveal
          // Left Inset fixed at 25% (200px).
          // Right Inset moves from 75% (600px) to 25% (200px) based on progress.
          // Formula: RightInset% = 100 - ( (Start + Width*Progress) / Stage * 100 )

          const lag = 2; // Slight lag
          const revealVal = Math.max(0, val - lag);

          // Calculate pixel position of the "reveal edge"
          const revealX = textStartX + (textWidth * revealVal / 100);

          // Convert to Inset from Right
          // Right Inset = (800 - revealX) / 800 * 100
          const rightInset = ((stageWidth - revealX) / stageWidth) * 100;

          ppopContainerWhiteControls.set({
            // Left fixed at 25%
            clipPath: `inset(49% ${rightInset}% 49% 25%)`
          });
        }
      });

      // 2. Wedge Open
      const wedgePivotX = 600; // End of text (75%)
      const wedgeStartLeft = 200;
      const wedgeStartWidth = 400; // Full text width

      const wedgeEndWidth = 150; // Compact wedge
      const wedgeEndLeft = wedgePivotX - wedgeEndWidth; // 450
      const targetAngle = 35;

      await animate(0, 1, {
        duration: 0.5, // Maintain velocity (no stop)
        ease: 'linear',
        onUpdate: (progress) => {
          const currWidth = wedgeStartWidth + (wedgeEndWidth - wedgeStartWidth) * progress;
          const currLeft = wedgeStartLeft + (wedgeEndLeft - wedgeStartLeft) * progress;
          const currAngle = targetAngle * progress;

          // Update Lines (Pinned to Right side by logic, but handled by calculation)
          // Actually transformOrigin '100% 50%' will pin the element to its right edge.
          // So if we position `left` such that `left + width` is constant, it looks pinned?
          // No, transformOrigin affects Rotation pivot.
          // We want pivot at `wedgePivotX`.
          // If `left` + `width` = `wedgePivotX` (ALWAYS), then right edge is at wedgePivotX.
          // Let's verify: Start: 200+400=600. End: 450+150=600. Yes.

          topLineControls.set({ width: currWidth, left: currLeft, rotate: currAngle, transformOrigin: '100% 50%' });
          bottomLineControls.set({ width: currWidth, left: currLeft, rotate: -currAngle, transformOrigin: '100% 50%' });

          // Update Mask (Polygon Triangle)
          const rad = (currAngle * Math.PI) / 180;

          // Tip is always at wedgePivotX (600px -> 75%)
          const pTipX = 75;
          const pTipY = 50;

          // Calculate Top/Bottom End relative to 800x400
          // The "Base" of the wedge is at (TipX - Width_projected)
          // But with rotation, the corners move.
          // dx, dy are offsets from the Tip (Right Edge).
          const dx = currWidth * Math.cos(rad);
          const dy = currWidth * Math.sin(rad);

          // Tip Pixel X = 600.
          // Top Pixel X = 600 - dx.
          const topPixelX = 600 - dx;
          const topPixelY = 200 - dy; // Center 200
          const botPixelY = 200 + dy;

          const pTopX = (topPixelX / 800) * 100;
          const pTopY = (topPixelY / 400) * 100;
          const pBotY = (botPixelY / 400) * 100;

          ppopContainerWhiteControls.set({
            clipPath: `polygon(${pTipX}% ${pTipY}%, ${pTopX}% ${pTopY}%, ${pTopX}% ${pBotY}%)`
          });
        }
      });

      // No pause, continuous flow
      // await new Promise(r => setTimeout(r, 600));

      // 3. Flatten to Vertical Line
      const flattenDuration = 0.3;
      // Flatten end width: 60px total vertical height.
      const verticalHalfHeight = 80;

      await animate(0, 1, {
        duration: flattenDuration,
        ease: 'linear', // Maintain moving velocity
        onUpdate: (progress) => {
          const currWidth = 150 + (verticalHalfHeight - 150) * progress;
          const currAngle = 35 + (90 - 35) * progress;

          // Pivot is 600.
          // Left = Pivot - Width
          const currLeft = 600 - currWidth;

          topLineControls.set({ width: currWidth, left: currLeft, rotate: currAngle, transformOrigin: '100% 50%' });
          bottomLineControls.set({ width: currWidth, left: currLeft, rotate: -currAngle, transformOrigin: '100% 50%' });

          // Mask Morph
          const rad = (currAngle * Math.PI) / 180;
          const dx = currWidth * Math.cos(rad);
          const dy = currWidth * Math.sin(rad);

          const topPixelX = 600 - dx;
          const topPixelY = 200 - dy;
          const botPixelY = 200 + dy;

          const pTopX = (topPixelX / 800) * 100;
          const pTopY = (topPixelY / 400) * 100;
          const pBotY = (botPixelY / 400) * 100;

          ppopContainerWhiteControls.set({
            // Tip X is 75% (600px)
            clipPath: `polygon(75% 50%, ${pTopX}% ${pTopY}%, ${pTopX}% ${pBotY}%)`
          });
        }
      });

      // 4. Wipe Left
      // Line is at ~540px left (600 - 60 width)
      // wipeDistance needs to be enough to go past the left edge of the text.
      const wipeStartLeft = 540;
      const wipeDistance = 600; // Reduced to 600 to minimize gap

      await animate(0, 1, {
        duration: 0.8,
        ease: 'easeOut', // Decelerate to finish
        onUpdate: (progress) => {
          const xOffset = -progress * wipeDistance;

          topLineControls.set({ x: xOffset });
          bottomLineControls.set({ x: xOffset });

          // Visual Line X Position in Stage
          const currentVisualX = wipeStartLeft + xOffset;

          // Calculate Insets
          // Blue Mask (hides from Right up to Line Pos)
          // inset(0 RIGHT% 0 0)
          // RIGHT% = Distance from Right Edge to Line.
          // Line is at currentVisualX.
          // Right Distance = 800 - currentVisualX.
          // Pct = (800 - currentVisualX) / 800 * 100.
          // If currentVisualX < 0, rightInset > 100 which is fine (full hide).
          const rightInsetPct = Math.max(0, ((800 - currentVisualX) / 800) * 100);

          ppopContainerBlueControls.set({ clipPath: `inset(0 ${rightInsetPct}% 0 0)` });

          // Dev Mask (reveals from Right of Line)
          // inset(0 0 0 LEFT%)
          // LEFT% = currentVisualX / 800 * 100.
          const leftInsetPct = Math.max(0, (currentVisualX / 800) * 100);

          devContainerControls.set({ clipPath: `inset(0 0 0 ${leftInsetPct}%)` });
        }
      });

      // Immediate Exit
      // Cleanup & Exit
      topLineControls.start({ opacity: 0 });
      bottomLineControls.start({ opacity: 0 });

      setIsAnimationDone(true);
      // Wait for the fade-out (0.3s) then unmount
      setTimeout(onComplete, 300);
    };

    sequence();
  }, [topLineControls, bottomLineControls, ppopContainerBlueControls, ppopContainerWhiteControls, devContainerControls, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={isAnimationDone ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-screen flex items-center justify-center">

        {/* 800px FIXED STAGE - 모바일 스케일 상향 조정 */}
        <div className="intro-stage relative w-[800px] h-[400px] flex items-center justify-center scale-[0.4] sm:scale-[0.45] md:scale-[0.5] lg:scale-[0.55] xl:scale-[0.6] 2xl:scale-[0.7] transform-gpu">

          {/* PPOP Layer */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
            animate={ppopContainerBlueControls}
          >
            <h1 className="text-9xl font-bold tracking-tighter text-[#0044CC]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              PPOP
            </h1>
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1, clipPath: 'inset(49% 75% 49% 25%)' }}
            animate={ppopContainerWhiteControls}
          >
            <h1 className="text-9xl font-bold tracking-tighter text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              PPOP
            </h1>
          </motion.div>

          {/* Dev Layer */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1, clipPath: 'inset(0 0 0 100%)' }}
            animate={devContainerControls}
          >
            <h1 className="text-6xl md:text-7xl font-sans text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              developer kimppop
            </h1>
          </motion.div>

          {/* Lines Layer */}
          <div className="absolute inset-x-0 top-1/2 h-0 z-50">
            <motion.div
              className="absolute bg-white h-[4px]"
              style={{ left: 0, top: 0, transformOrigin: '100% 50%' }}
              initial={{ width: 0 }}
              animate={topLineControls}
            />
            <motion.div
              className="absolute bg-white h-[4px]"
              style={{ left: 0, top: 0, transformOrigin: '100% 50%' }}
              initial={{ width: 0 }}
              animate={bottomLineControls}
            />
          </div>

        </div>
      </div>
    </motion.div>
  );
}
