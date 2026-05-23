'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitReply, updateVisitor } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export default function ReplyPage() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { visitorId, startTime } = useAppStore();

  useEffect(() => {
    // Focus textarea after mount
    setTimeout(() => textareaRef.current?.focus(), 800);
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);

    // Save duration
    const vid = visitorId || (typeof window !== 'undefined' ? localStorage.getItem('visitorId') : null);
    if (vid && startTime) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      await updateVisitor(vid, { duration_seconds: duration });
    }

    const success = await submitReply(vid, content.trim());

    if (success && vid) {
      await updateVisitor(vid, { replied: true });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCharCount(e.target.value.length);
  };

  // Floating particles for background
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1.5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 5 + Math.random() * 6,
    delay: Math.random() * 4,
    color: i % 4 === 0 ? '#d4af37' : i % 4 === 1 ? '#9b72cf' : i % 4 === 2 ? '#c4b5fd' : '#f5e09a',
  }));

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #2d1b69 0%, #1a0a2e 45%, #0d0618 100%)',
      }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute', width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(107,70,193,0.2) 0%, transparent 70%)',
            top: '-15%', left: '-10%', filter: 'blur(50px)',
          }}
        />
        <div
          style={{
            position: 'absolute', width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
            bottom: '-10%', right: '-10%', filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size, height: p.size,
            background: p.color,
            left: `${p.x}%`, top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-lg"
            >
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <p
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '0.75rem',
                    color: 'rgba(155,114,207,0.6)',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  ✦ Your Words ✦
                </p>
                <h1
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '2rem',
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #d4af37 60%, #f5e09a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.3,
                  }}
                >
                  My Reply For Your Book
                </h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mx-auto mt-4"
                  style={{
                    width: 120, height: 1,
                    background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                  }}
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '0.9rem',
                    color: 'rgba(196,181,253,0.6)',
                    fontStyle: 'italic',
                    marginTop: 12,
                  }}
                >
                  Write your feelings, your response, your letter back…
                </motion.p>
              </motion.div>

              {/* Letter Paper */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotateX: 5 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="letter-paper rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, #fdfaf0 0%, #f8f0d8 100%)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 3px rgba(255,255,255,0.8)',
                }}
              >
                {/* Red margin line */}
                <div
                  className="absolute left-12 top-0 bottom-0 w-px pointer-events-none"
                  style={{ background: 'rgba(220,80,80,0.2)' }}
                />

                {/* Paper texture overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    mixBlendMode: 'overlay',
                  }}
                />

                <div className="letter-lines relative p-8 pt-10 pl-16">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    placeholder="Dear you…"
                    className="letter-textarea"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'Dancing Script, cursive',
                      fontSize: '1.15rem',
                      color: '#2d1b3d',
                      lineHeight: '2rem',
                      width: '100%',
                      minHeight: 320,
                      padding: 0,
                    }}
                  />
                </div>

                {/* Character count */}
                <div className="px-8 pb-4 flex justify-end">
                  <span
                    style={{
                      fontFamily: 'EB Garamond, serif',
                      fontSize: '0.7rem',
                      color: 'rgba(45,27,105,0.35)',
                    }}
                  >
                    {charCount} characters
                  </span>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center mt-8 gap-3"
              >
                <motion.button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="glow-btn px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={content.trim() ? { scale: 1.05 } : {}}
                  whileTap={content.trim() ? { scale: 0.97 } : {}}
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    letterSpacing: '0.08em',
                  }}
                >
                  {isSubmitting ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      Sending your words…
                    </motion.span>
                  ) : (
                    '✦ Submit Reply ✦'
                  )}
                </motion.button>

                <p
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '0.75rem',
                    color: 'rgba(155,114,207,0.4)',
                    fontStyle: 'italic',
                  }}
                >
                  Your reply will be kept privately
                </p>
              </motion.div>
            </motion.div>
          ) : (
            /* ──── Confirmation ──── */
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'backOut' }}
              className="flex flex-col items-center text-center px-8"
            >
              {/* Animated envelope / check */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    {/* Envelope body */}
                    <rect x="15" y="35" width="70" height="45" rx="6" fill="#2d1b69" opacity="0.9" />
                    {/* Envelope flap */}
                    <path d="M15 40 L50 62 L85 40" stroke="#d4af37" strokeWidth="1.5" fill="none" />
                    {/* Seal */}
                    <circle cx="50" cy="52" r="10" fill="#d4af37" opacity="0.9" />
                    <motion.path
                      d="M44 52 L48 56 L56 48"
                      stroke="#1a0a2e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    />
                    {/* Glow rings */}
                    <motion.circle
                      cx="50" cy="52" r="20"
                      stroke="#d4af37" strokeWidth="0.5" fill="none"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.5, 2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                    />
                    <motion.circle
                      cx="50" cy="52" r="30"
                      stroke="#9b72cf" strokeWidth="0.3" fill="none"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1.5, 2] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                    />
                    {/* Sparkles */}
                    {[
                      { x: 25, y: 28, delay: 0.4 },
                      { x: 75, y: 30, delay: 0.6 },
                      { x: 50, y: 20, delay: 0.8 },
                      { x: 30, y: 75, delay: 1.0 },
                      { x: 70, y: 72, delay: 1.2 },
                    ].map((s, i) => (
                      <motion.circle
                        key={i}
                        cx={s.x} cy={s.y} r="2"
                        fill="#f5e09a"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: s.delay }}
                      />
                    ))}
                  </svg>
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.8rem',
                  background: 'linear-gradient(135deg, #c4b5fd, #d4af37, #f5e09a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: 12,
                }}
              >
                Your words have been saved
              </motion.h2>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                style={{
                  width: 80, height: 1,
                  background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                  margin: '0 auto 16px',
                }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                  fontFamily: 'EB Garamond, serif',
                  fontSize: '1rem',
                  color: 'rgba(196,181,253,0.7)',
                  fontStyle: 'italic',
                  maxWidth: 360,
                  lineHeight: 1.7,
                }}
              >
                Thank you for reading every page, and for writing back. 
                Your reply means more than you know. 💜
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-12"
                style={{
                  fontFamily: 'Dancing Script, cursive',
                  fontSize: '1.2rem',
                  color: '#d4af37',
                }}
              >
                — With love, always.
              </motion.p>

              {/* Decorative footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-16"
                style={{
                  color: 'rgba(155,114,207,0.3)',
                  fontFamily: 'EB Garamond, serif',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                My Thoughts · A Private Memory
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
