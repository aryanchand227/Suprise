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
      <motion.div
        className="breathing"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'backOut' }}
      >
        <svg width="260" height="260" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Thought cloud */}
          <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ellipse cx="100" cy="42" rx="55" ry="28" fill="white" opacity="0.9" />
            <ellipse cx="70" cy="58" rx="18" ry="14" fill="white" opacity="0.9" />
            <ellipse cx="130" cy="56" rx="16" ry="12" fill="white" opacity="0.9" />
            <circle cx="80" cy="72" r="7" fill="white" opacity="0.85" />
            <circle cx="100" cy="77" r="5" fill="white" opacity="0.75" />
            <circle cx="118" cy="72" r="4" fill="white" opacity="0.7" />

            {/* Text in thought cloud */}
            <text
              x="100" y="38"
              textAnchor="middle"
              fontSize="9"
              fontFamily="Dancing Script, cursive"
              fill="#2d1b69"
              fontStyle="italic"
            >
              Miss you,
            </text>
            <text
              x="100" y="52"
              textAnchor="middle"
              fontSize="9"
              fontFamily="Dancing Script, cursive"
              fill="#2d1b69"
              fontStyle="italic"
            >
              Hasini.💜
            </text>
          </motion.g>

          {/* Person 1 - left */}
          <g transform="translate(55, 85)">
            {/* Head */}
            <circle cx="20" cy="12" r="12" fill="#c4b5fd" opacity="0.9" />
            {/* Hair */}
            <path d="M10 8 Q20 0 30 8" fill="#6b46c1" opacity="0.7" />
            {/* Body */}
            <rect x="10" y="24" width="20" height="30" rx="8" fill="#9b72cf" opacity="0.85" />
            {/* Arm hugging */}
            <path d="M30 30 Q55 28 60 40" stroke="#9b72cf" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
          </g>

          {/* Person 2 - right */}
          <g transform="translate(105, 88)">
            {/* Head */}
            <circle cx="20" cy="12" r="12" fill="#d4af37" opacity="0.9" />
            {/* Hair */}
            <path d="M8 8 Q20 -2 32 8 Q32 2 20 4 Q8 2 8 8" fill="#a07c20" opacity="0.8" />
            {/* Body */}
            <rect x="10" y="24" width="20" height="30" rx="8" fill="#c4974a" opacity="0.85" />
            {/* Arm hugging */}
            <path d="M10 30 Q-15 28 -20 40" stroke="#c4974a" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
          </g>

          {/* Hearts */}
          {[
            { cx: 95, cy: 88, s: 0.6, delay: 0 },
            { cx: 105, cy: 82, s: 0.4, delay: 0.5 },
            { cx: 100, cy: 78, s: 0.5, delay: 1 },
          ].map((h, i) => (
            <motion.path
              key={i}
              d={`M${h.cx},${h.cy + 4 * h.s} C${h.cx},${h.cy} ${h.cx - 8 * h.s},${h.cy - 4 * h.s} ${h.cx},${h.cy - 8 * h.s} C${h.cx + 8 * h.s},${h.cy - 4 * h.s} ${h.cx},${h.cy} ${h.cx},${h.cy + 4 * h.s}Z`}
              fill="#e879a0"
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0.5], y: -20 }}
              transition={{ duration: 2, repeat: Infinity, delay: h.delay, ease: 'easeOut' }}
            />
          ))}

          {/* Ground shadow */}
          <ellipse cx="100" cy="190" rx="55" ry="6" fill="rgba(45,27,105,0.1)" />
        </svg>
      </motion.div>

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
