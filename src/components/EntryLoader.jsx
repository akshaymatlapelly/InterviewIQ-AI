import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function EntryLoader({ onComplete }) {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Set proper high DPI resolution
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Luxury blue palette
    const colors = [
      '#0A3D91', // Rich deep blue
      '#1565C0', // Premium royal blue
      '#1E88E5', // Brilliant cobalt blue
      '#42A5F5'  // Premium soft sky glow blue
    ];

    // Particle template
    const particleCount = 60;
    const particles = [];
    
    // Core parameters
    const startTime = performance.now();
    const totalDuration = 3200; // 3.2 seconds total duration

    // Setup initial particles
    const initParticles = (width, height) => {
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          startX: cx,
          startY: cy,
          color: colors[i % colors.length],
          size: 1.5 + Math.random() * 2,
          alpha: 1,
          glowIntensity: 10 + Math.random() * 15
        });
      }
    };

    // Calculate network targets relative to center
    const getNetworkTargets = (cx, cy) => {
      const targets = [];
      
      // Left Lobe (Inner/Outer)
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        const r = 50 + Math.sin(angle * 2.5) * 12;
        targets.push({
          x: cx + Math.cos(angle) * r - 15,
          y: cy + Math.sin(angle) * r * 0.85
        });
      }

      // Right Lobe (Inner/Outer)
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        const r = 50 + Math.sin(angle * 2.5) * 12;
        targets.push({
          x: cx - Math.cos(angle) * r + 15,
          y: cy + Math.sin(angle) * r * 0.85
        });
      }

      // Interconnecting center nodes (The Core)
      targets.push({ x: cx, y: cy });
      targets.push({ x: cx, y: cy - 25 });
      targets.push({ x: cx, y: cy + 25 });
      targets.push({ x: cx - 25, y: cy });
      targets.push({ x: cx + 25, y: cy });
      targets.push({ x: cx - 12, y: cy - 12 });
      targets.push({ x: cx + 12, y: cy + 12 });
      targets.push({ x: cx - 12, y: cy + 12 });
      targets.push({ x: cx + 12, y: cy - 12 });

      return targets;
    };

    const width = window.innerWidth;
    const height = window.innerHeight;
    initParticles(width, height);

    // Orbit particles around the central orb initially
    const orbitCount = 6;
    const orbits = [];
    for (let i = 0; i < orbitCount; i++) {
      orbits.push({
        angle: (i * Math.PI * 2) / orbitCount,
        radius: 65 + Math.random() * 15,
        speed: 0.003 + Math.random() * 0.002,
        color: colors[i % colors.length],
        size: 1.8 + Math.random() * 1.2
      });
    }

    let explosionInitialized = false;
    let regroupInitialized = false;

    // Main animation loop
    const render = (time) => {
      const elapsed = time - startTime;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      // Clear with very subtle trace trail to give particles dynamic motion blur
      ctx.fillStyle = 'rgba(5, 7, 13, 0.25)'; // Background #05070D
      ctx.fillRect(0, 0, w, h);

      // Enable high quality additive screen glow blending
      ctx.globalCompositeOperation = 'screen';

      if (elapsed < 1000) {
        // --- STAGE 1: Orb Pulse & Orbit (0ms - 1000ms) ---
        const fadeIn = Math.min(1, elapsed / 300);
        
        // Gentlest pulse
        const pulse = 1 + Math.sin(elapsed * 0.008) * 0.07;
        const pulseScale = (elapsed > 700) ? pulse * (1 + (elapsed - 700) * 0.0012) : pulse; // Expand at the end of Stage 1
        const orbRadius = 24 * pulseScale * fadeIn;

        // Draw central orb shadow glow (Expensive volumetric bloom feeling)
        ctx.save();
        ctx.shadowBlur = 45 * pulseScale;
        ctx.shadowColor = 'rgba(21, 101, 192, 0.5)';
        
        // Draw the core glowing blue gradients
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 1.5);
        grad.addColorStop(0, '#FFFFFF'); // Hot center
        grad.addColorStop(0.2, '#42A5F5'); // Soft sky blue
        grad.addColorStop(0.5, '#1E88E5'); // Cobalt
        grad.addColorStop(0.8, '#1565C0'); // Royal Blue
        grad.addColorStop(1, 'rgba(10, 61, 145, 0.0)');
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.arc(cx, cy, orbRadius * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Orbiting Particles
        orbits.forEach((orb) => {
          orb.angle += orb.speed;
          const ox = cx + Math.cos(orb.angle) * orb.radius * fadeIn;
          const oy = cy + Math.sin(orb.angle) * orb.radius * fadeIn * 0.7; // elliptical orbit
          
          ctx.beginPath();
          ctx.arc(ox, oy, orb.size, 0, Math.PI * 2);
          ctx.fillStyle = orb.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = orb.color;
          ctx.fill();
        });

      } else if (elapsed >= 1000 && elapsed < 1800) {
        // --- STAGE 2: Particle Explosion (1000ms - 1800ms) ---
        if (!explosionInitialized) {
          particles.forEach((p) => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 3.5 + Math.random() * 6.5;
            p.vx = Math.cos(angle) * velocity;
            p.vy = Math.sin(angle) * velocity * 0.85; // slightly elliptical explosion
          });
          explosionInitialized = true;
        }

        // Draw expanding particles
        particles.forEach((p) => {
          // Physics: friction / drag slowing them down
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.glowIntensity;
          ctx.shadowColor = p.color;
          ctx.fill();
        });

      } else if (elapsed >= 1800 && elapsed < 2500) {
        // --- STAGE 3: Network Regroup (1800ms - 2500ms) ---
        if (!regroupInitialized) {
          // Store positions right before regroup starts so we interpolate smoothly
          particles.forEach((p) => {
            p.startX = p.x;
            p.startY = p.y;
          });
          regroupInitialized = true;
        }

        const networkTargets = getNetworkTargets(cx, cy);
        const progress = Math.min(1, (elapsed - 1800) / 700);
        // Cinematic cubic ease-out
        const ease = 1 - Math.pow(1 - progress, 3);

        // Interpolate particles to network targets
        particles.forEach((p, idx) => {
          const target = networkTargets[idx % networkTargets.length];
          p.x = p.startX + (target.x - p.startX) * ease;
          p.y = p.startY + (target.y - p.startY) * ease;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.glowIntensity * 0.6;
          ctx.shadowColor = p.color;
          ctx.fill();
        });

        // Draw constellations/network lines between nearby nodes
        ctx.lineWidth = 0.6;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 48) {
              const alpha = (1 - dist / 48) * 0.38 * ease;
              ctx.strokeStyle = `rgba(30, 136, 229, ${alpha})`; // glowing blue lines
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

      } else if (elapsed >= 2500 && elapsed <= totalDuration) {
        // --- STAGE 4: Dissolve & Exit (2500ms - 3200ms) ---
        const progress = Math.min(1, (elapsed - 2500) / 700);
        const easeOut = progress * progress; // acceleration out

        // Particles drift apart slightly and fade out
        particles.forEach((p) => {
          p.x += (Math.random() - 0.5) * 1.5;
          p.y += (Math.random() - 0.5) * 1.5 + 0.3; // drift down slightly
          p.alpha = 1 - easeOut;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.glowIntensity * 0.4 * (1 - easeOut);
          ctx.shadowColor = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // Slowly dissolve network lines too
        ctx.lineWidth = 0.6 * (1 - easeOut);
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 48) {
              const alpha = (1 - dist / 48) * 0.38 * (1 - easeOut);
              ctx.strokeStyle = `rgba(30, 136, 229, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      if (elapsed < totalDuration) {
        animationId = requestAnimationFrame(render);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          onComplete();
        }, 400); // match exit transition delay
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ backgroundColor: '#05070D' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default EntryLoader;
