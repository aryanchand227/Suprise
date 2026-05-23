'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleCanvasProps {
  explode?: boolean;
  className?: string;
}

const COLORS = ['#9b72cf', '#c4b5fd', '#d4af37', '#f5e09a', '#6b46c1', '#a78bfa'];

export default function ParticleCanvas({ explode = false, className = '' }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const explodedRef = useRef(false);

  const createAmbientParticle = useCallback((): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Particle;
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(Math.random() * 1.5 + 0.3),
      radius: Math.random() * 3 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: Math.random() * 200 + 150,
    };
  }, []);

  const createExplosionParticle = useCallback((cx: number, cy: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 5 + 2,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: Math.random() * 60 + 40,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed ambient particles
    for (let i = 0; i < 60; i++) {
      const p = createAmbientParticle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particlesRef.current.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      // Spawn ambient
      if (particlesRef.current.length < 80 && !explodedRef.current) {
        particlesRef.current.push(createAmbientParticle());
      }

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (!explodedRef.current) {
          p.vy -= 0.003;
        } else {
          p.vy += 0.15; // gravity on explosion
        }

        const progress = p.life / p.maxLife;
        const alpha = p.alpha * (1 - progress);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [createAmbientParticle]);

  useEffect(() => {
    if (explode && !explodedRef.current) {
      explodedRef.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (let i = 0; i < 200; i++) {
        particlesRef.current.push(createExplosionParticle(cx, cy));
      }
    }
  }, [explode, createExplosionParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-canvas ${className}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  );
}
