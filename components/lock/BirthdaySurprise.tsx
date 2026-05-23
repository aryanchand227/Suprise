'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  particles: FireworkParticle[];
  startTime: number;
  duration: number;
}

interface FireworkParticle {
  angle: number;
  speed: number;
  length: number;
  color: string;
  alpha: number;
  gravity: number;
}

const FIREWORK_COLORS = [
  '#d4af37', '#f5e09a', '#c4b5fd', '#9b72cf',
  '#e879f9', '#f0abfc', '#fcd34d', '#a78bfa',
  '#ffffff', '#ddd6fe',
];

export default function BirthdaySurprise({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const animFrameRef = useRef<number>(0);
  const nextIdRef = useRef(0);
  const [phase, setPhase] = useState<'fireworks' | 'text' | 'fadeout'>('fireworks');

  // ── Canvas fireworks engine ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const makeFirework = (): Firework => {
      const x = 0.1 * canvas.width + Math.random() * 0.8 * canvas.width;
      const y = 0.05 * canvas.height + Math.random() * 0.5 * canvas.height;
      const count = 40 + Math.floor(Math.random() * 30);
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      const particles: FireworkParticle[] = Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        speed: 1.5 + Math.random() * 3.5,
        length: 3 + Math.random() * 5,
        color,
        alpha: 1,
        gravity: 0.04 + Math.random() * 0.04,
      }));
      return { id: nextIdRef.current++, x, y, particles, startTime: performance.now(), duration: 1600 + Math.random() * 800 };
    };

    // Spawn initial burst
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        fireworksRef.current.push(makeFirework());
      }, i * 180);
    }

    // Keep spawning for 5s
    let spawnCount = 0;
    const spawnInterval = setInterval(() => {
      fireworksRef.current.push(makeFirework());
      spawnCount++;
      if (spawnCount > 20) clearInterval(spawnInterval);
    }, 320);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      fireworksRef.current = fireworksRef.current.filter(fw => {
        const elapsed = now - fw.startTime;
        const t = elapsed / fw.duration;
        if (t >= 1) return false;

        fw.particles.forEach(p => {
          const dist = p.speed * elapsed * 0.06;
          const vy = dist * Math.sin(p.angle) + p.gravity * (elapsed * 0.06) ** 2;
          const vx = dist * Math.cos(p.angle);
          const alpha = Math.max(0, 1 - t * 1.2);

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.length * (1 - t * 0.5);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(fw.x + vx, fw.y + vy);
          ctx.lineTo(fw.x + vx + Math.cos(p.angle) * p.length, fw.y + vy + Math.sin(p.angle) * p.length);
          ctx.stroke();

          // Sparkle dot at tip
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(fw.x + vx, fw.y + vy, p.length * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        return true;
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    // Phase transitions
    const t1 = setTimeout(() => setPhase('text'), 800);
    const t2 = setTimeout(() => setPhase('fadeout'), 4800);
    const t3 = setTimeout(() => onComplete(), 6000);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(spawnInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Floating sparkle particles
  const sparkles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
    color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'radial-gradient(ellipse at 50% 30%, #1e0a3c 0%, #120618 40%, #0a0310 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Fireworks canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(155,114,207,0.25) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Floating sparkle dots */}
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: '50%',
            background: s.color,
            pointerEvents: 'none',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.9, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Birthday Text */}
      <AnimatePresence>
        {phase === 'text' || phase === 'fadeout' ? (
          <motion.div
            key="birthday-text"
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
            animate={phase === 'fadeout'
              ? { opacity: 0, scale: 1.08, filter: 'blur(8px)' }
              : { opacity: 1, scale: 1, filter: 'blur(0px)' }
            }
            transition={phase === 'fadeout'
              ? { duration: 1.2, ease: 'easeIn' }
              : { duration: 1.0, ease: 'easeOut' }
            }
            style={{
              position: 'relative', zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', padding: '0 24px',
            }}
          >
            {/* Emoji row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ fontSize: '2.5rem', marginBottom: 16, letterSpacing: '0.2em' }}
            >
              🎂 🎉 🎊
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.2rem, 7vw, 5rem)',
                lineHeight: 1.15,
                marginBottom: 8,
                position: 'relative',
                // Gold shimmer gradient
                background: 'linear-gradient(100deg, #c4b5fd 0%, #d4af37 30%, #f5e09a 50%, #d4af37 70%, #c4b5fd 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              <motion.span
                animate={{ backgroundPosition: ['0% center', '200% center'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                  display: 'block',
                  background: 'inherit',
                  backgroundSize: 'inherit',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Happy Birthday
              </motion.span>
            </motion.h1>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                fontFamily: 'Dancing Script, cursive',
                fontSize: 'clamp(2.8rem, 9vw, 6.5rem)',
                background: 'linear-gradient(135deg, #f5e09a 0%, #d4af37 40%, #fffbeb 80%, #f5e09a 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 16,
                filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))',
              }}
            >
              <motion.span
                animate={{ backgroundPosition: ['0% center', '200% center'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                style={{
                  display: 'block',
                  background: 'inherit',
                  backgroundSize: 'inherit',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Hasini ✨
              </motion.span>
            </motion.div>

            {/* Divider line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              style={{
                width: 180, height: 1,
                background: 'linear-gradient(90deg, transparent, #d4af37, #f5e09a, #d4af37, transparent)',
                marginBottom: 20,
              }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
                color: 'rgba(196,181,253,0.75)',
                fontStyle: 'italic',
                letterSpacing: '0.06em',
                maxWidth: 440,
                lineHeight: 1.6,
              }}
            >
              A secret is waiting behind this door, just for you.
            </motion.p>

            {/* Pulsing glow ring */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 30px rgba(212,175,55,0.2)',
                  '0 0 80px rgba(212,175,55,0.4)',
                  '0 0 30px rgba(212,175,55,0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: -40,
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
      }} />

      {/* Subtle scan-line shimmer at bottom */}
      <motion.div
        animate={{ opacity: [0, 0.06, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
          background: 'linear-gradient(to top, rgba(212,175,55,0.08), transparent)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
