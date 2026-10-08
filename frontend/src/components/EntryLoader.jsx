import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function EntryLoader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smoothly animate progress bar from 0 to 100 over 2.8s
    const startTime = performance.now();
    const duration = 2800;

    const tick = (now) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        // Start exit fade
        setIsVisible(false);
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#05070D' }}
        >
          {/* Ambient background glows */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(21,101,192,0.18) 0%, rgba(10,61,145,0.08) 50%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '38%', left: '46%',
              width: 200, height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(66,165,245,0.10) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Central glowing orb */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1, 1.05, 1],
              boxShadow: [
                '0 0 40px 10px rgba(21,101,192,0.5), 0 0 80px 20px rgba(10,61,145,0.3)',
                '0 0 60px 18px rgba(30,136,229,0.65), 0 0 120px 35px rgba(21,101,192,0.4)',
                '0 0 40px 10px rgba(21,101,192,0.5), 0 0 80px 20px rgba(10,61,145,0.3)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center justify-center mb-12"
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #42A5F5 0%, #1E88E5 30%, #1565C0 60%, #0A3D91 100%)',
              boxShadow: '0 0 40px 10px rgba(21,101,192,0.5), 0 0 80px 20px rgba(10,61,145,0.3)',
            }}
          >
            {/* Inner bright core */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FFFFFF 0%, #90CAF9 40%, #42A5F5 100%)',
                boxShadow: '0 0 16px 6px rgba(144,202,249,0.7)',
              }}
            />

            {/* Orbiting ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '1.5px solid rgba(66,165,245,0.25)',
                borderTopColor: 'rgba(66,165,245,0.8)',
                borderRightColor: 'rgba(30,136,229,0.5)',
              }}
            />

            {/* Outer slow ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '1px solid rgba(21,101,192,0.15)',
                borderBottomColor: 'rgba(21,101,192,0.55)',
              }}
            />
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-2 text-center"
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #42A5F5 0%, #90CAF9 50%, #1E88E5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              InterviewIQ AI
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              color: 'rgba(148,163,184,0.7)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 32,
            }}
          >
            AI-Powered Interview Platform
          </motion.p>

          {/* Premium progress bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            style={{
              width: 220,
              height: 3,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                borderRadius: 99,
                background: 'linear-gradient(90deg, #0A3D91, #1E88E5, #42A5F5)',
                boxShadow: '0 0 10px rgba(66,165,245,0.8)',
                width: `${progress}%`,
              }}
            />
          </motion.div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{ delay: 0.6, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              marginTop: 14,
              color: 'rgba(100,116,139,0.8)',
              fontSize: 11,
              letterSpacing: '0.1em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Initializing AI Systems...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EntryLoader;
