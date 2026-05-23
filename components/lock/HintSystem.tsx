'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface HintSystemProps {
  hints: string[];
}

export default function HintSystem({ hints }: HintSystemProps) {
  const [revealed, setRevealed] = useState<number | null>(null);

  return (
    <div className="w-full max-w-sm">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center mb-4"
        style={{ color: '#9b72cf', fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', letterSpacing: '0.08em' }}
      >
        ✦ Hints ✦
      </motion.p>

      <div className="space-y-2">
        {hints.map((hint, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 + i * 0.1 }}
          >
            <button
              onClick={() => setRevealed(revealed === i ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-300"
              style={{
                background: revealed === i
                  ? 'rgba(155,114,207,0.15)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${revealed === i ? 'rgba(155,114,207,0.5)' : 'rgba(155,114,207,0.15)'}`,
              }}
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'rgba(155,114,207,0.2)',
                  color: '#c4b5fd',
                  fontFamily: 'Playfair Display, serif',
                }}
              >
                {i + 1}
              </span>
              <AnimatePresence mode="wait">
                {revealed === i ? (
                  <motion.span
                    key="hint"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    style={{
                      fontFamily: 'EB Garamond, serif',
                      color: '#f5e09a',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {hint}
                  </motion.span>
                ) : (
                  <motion.span
                    key="hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontFamily: 'EB Garamond, serif',
                      color: 'rgba(155,114,207,0.6)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Tap to reveal clue {i + 1}...
                  </motion.span>
                )}
              </AnimatePresence>
              <span
                className="ml-auto flex-shrink-0 transition-transform duration-300"
                style={{
                  color: '#9b72cf',
                  transform: revealed === i ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ↓
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
