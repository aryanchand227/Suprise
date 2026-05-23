'use client';

import { motion } from 'framer-motion';

interface BookPresentationProps {
  title: string;
  subtitle: string;
  coverImageUrl?: string | null;
  onOpen: () => void;
}

export default function BookPresentation({ title, subtitle, coverImageUrl, onOpen }: BookPresentationProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen book-scene px-4">
      {/* Ambient glow behind book */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(107,70,193,0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      {/* 3D Book */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotateY: -25, rotateX: 8, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, rotateY: 5, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformStyle: 'preserve-3d', zIndex: 1 }}
        className="relative cursor-pointer group"
        onClick={onOpen}
        whileHover={{ rotateY: 12, rotateX: -3, scale: 1.03 }}
      >
        <div className="flex" style={{ height: 550 }}>
          {/* Spine */}
          <div className="book-spine flex items-center justify-center" style={{ width: 32, height: '100%' }}>
            <p style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontFamily: 'Playfair Display, serif',
              fontSize: '0.85rem',
              color: 'rgba(212,175,55,0.5)',
              letterSpacing: '0.2em',
              transform: 'rotate(180deg)',
            }}>
              MY THOUGHTS
            </p>
          </div>

          {/* Cover */}
          <div
            className="book-cover relative flex flex-col items-center justify-between py-12 px-8"
            style={{ width: 380, height: '100%' }}
          >
            {/* Top gold filigree */}
            <div className="w-full flex flex-col items-center gap-1">
              <GoldFiligree />
            </div>

            {/* Cover image or decorative center */}
            <div className="flex-1 flex items-center justify-center w-full my-6">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="Book cover"
                  className="w-full h-64 object-cover rounded-lg"
                  style={{ opacity: 0.85, boxShadow: '0 4px 25px rgba(0,0,0,0.6)' }}
                />
              ) : (
                <div className="flex flex-col items-center gap-6">
                  {/* Decorative emblem */}
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="40" stroke="#d4af37" strokeWidth="0.8" opacity="0.5" />
                      <circle cx="50" cy="50" r="30" stroke="#d4af37" strokeWidth="0.5" opacity="0.3" />
                      <path d="M50 15 L53 40 L78 40 L57 55 L65 80 L50 65 L35 80 L43 55 L22 40 L47 40 Z"
                        fill="#d4af37" opacity="0.6" />
                      <circle cx="50" cy="50" r="6" fill="#f5e09a" opacity="0.8" />
                    </svg>
                  </motion.div>

                  {/* Title on cover */}
                  <div className="text-center px-4">
                    <h2 style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '2.2rem',
                      fontWeight: 600,
                      color: '#f5e09a',
                      textShadow: '0 0 25px rgba(212,175,55,0.6)',
                      lineHeight: 1.25,
                    }}>
                      {title}
                    </h2>
                    <div className="w-24 h-px mx-auto my-4" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />
                    <p style={{
                      fontFamily: 'EB Garamond, serif',
                      fontSize: '1rem',
                      color: 'rgba(212,175,55,0.65)',
                      fontStyle: 'italic',
                      letterSpacing: '0.05em',
                    }}>
                      {subtitle}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom filigree */}
            <div className="w-full flex flex-col items-center gap-1">
              <GoldFiligree flip />
            </div>

            {/* Edge glow */}
            <motion.div
              className="absolute inset-0 rounded-r-xl pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                background: 'linear-gradient(135deg, transparent 60%, rgba(107,70,193,0.2))',
                boxShadow: 'inset -2px 0 20px rgba(155,114,207,0.2)',
              }}
            />
          </div>

          {/* Page stack */}
          <div className="book-pages" style={{ width: 14, height: '100%', borderRadius: '0 2px 2px 0' }} />
        </div>

        {/* Book shadow */}
        <div
          className="absolute -bottom-8 left-6 right-6 rounded-full"
          style={{
            height: 24,
            background: 'rgba(0,0,0,0.5)',
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      </motion.div>

      {/* Open CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="mt-12 flex flex-col items-center gap-4 z-10"
      >
        <motion.button
          onClick={onOpen}
          className="glow-btn px-12 py-5 text-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.08em' }}
        >
          ✦ Open the Book ✦
        </motion.button>
        <motion.p
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ color: 'rgba(155,114,207,0.5)', fontSize: '0.85rem', fontFamily: 'EB Garamond, serif' }}
        >
          Click the book or the button to begin
        </motion.p>
      </motion.div>
    </div>
  );
}

function GoldFiligree({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="260" height="24" viewBox="0 0 200 24" fill="none"
      style={{ transform: flip ? 'scaleY(-1)' : undefined, opacity: 0.6 }}
    >
      <path d="M10 12 Q50 4 100 12 Q150 20 190 12" stroke="#d4af37" strokeWidth="0.8" fill="none" />
      <path d="M30 12 Q60 6 100 12 Q140 18 170 12" stroke="#d4af37" strokeWidth="0.4" fill="none" opacity="0.5" />
      <circle cx="100" cy="12" r="3" fill="#d4af37" opacity="0.7" />
      <circle cx="10" cy="12" r="1.5" fill="#d4af37" opacity="0.5" />
      <circle cx="190" cy="12" r="1.5" fill="#d4af37" opacity="0.5" />
    </svg>
  );
}
