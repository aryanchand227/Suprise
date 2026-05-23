'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function FinalPage() {
  const router = useRouter();

  return (
    <div className="page-surface w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Soft ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 60%, rgba(155,114,207,0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: i % 3 === 0 ? '#d4af37' : i % 3 === 1 ? '#9b72cf' : '#c4b5fd',
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            opacity: 0.6,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Illustrated scene */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, zIndex: 10 }}>
        {/* Thought cloud */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center relative"
          style={{ height: 90, width: 220 }}
        >
          <div
            className="flex flex-col items-center justify-center p-3 px-6 bg-white rounded-3xl shadow-[0_4px_15px_rgba(45,27,105,0.08)] relative"
            style={{ border: '1px solid rgba(155,114,207,0.1)' }}
          >
            <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1rem', color: '#2d1b69', fontStyle: 'italic', fontWeight: 'bold' }}>
              Happy Birthday,
            </p>
            <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.1rem', color: '#6b46c1', fontStyle: 'italic', fontWeight: 'bold' }}>
              Hasini.💜
            </p>
            {/* Thought cloud little bubbles */}
            <div className="absolute bottom-[-6px] left-[45%] w-3.5 h-3.5 bg-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.05)]" />
            <div className="absolute bottom-[-14px] left-[41%] w-2 h-2 bg-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.05)]" />
          </div>
        </motion.g>

        {/* Real photo hug card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -4, 0],
            rotate: [-1.5, 1.5, -1.5]
          }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 0.8, ease: 'backOut' },
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{ transformOrigin: 'center center' }}
          className="p-3 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.35)] border border-amber-200/25 pointer-events-none"
        >
          <div className="w-48 h-48 overflow-hidden rounded-lg shadow-inner bg-cream-page">
            <img src="/images/hugpic.jpg" alt="Our hug" className="w-full h-full object-cover" />
          </div>
          <div className="mt-3 text-center">
            <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.25rem', color: '#4a2c8f', fontWeight: 'bold' }}>
              Always & Forever 💜
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quote text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-center mt-4 px-10"
      >
        <p style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.4rem',
          color: '#2d1b69',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          "Miss you, Purple"
        </p>
        <div style={{ width: 70, height: 1, background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '16px auto' }} />
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.05rem', color: '#6b46c1', fontStyle: 'italic' }}>
          — The end of this book. Not the end of us.
        </p>
      </motion.div>

      {/* Reply button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => router.push('/reply')}
        className="mt-8 px-8 py-4 rounded-2xl text-base transition-all"
        style={{
          background: 'linear-gradient(135deg, #4a2c8f, #6b46c1)',
          color: '#f5e09a',
          fontFamily: 'Playfair Display, serif',
          border: '1px solid rgba(212,175,55,0.3)',
          boxShadow: '0 4px 20px rgba(107,70,193,0.3)',
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}
        whileHover={{ scale: 1.05, boxShadow: '0 6px 30px rgba(107,70,193,0.5)' }}
        whileTap={{ scale: 0.97 }}
      >
        ✍️ Write your reply
      </motion.button>
    </div>
  );
}
