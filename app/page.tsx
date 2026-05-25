'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ParticleCanvas from '@/components/lock/ParticleCanvas';
import PinInput from '@/components/lock/PinInput';
import HintSystem from '@/components/lock/HintSystem';
import BirthdaySurprise from '@/components/lock/BirthdaySurprise';
import { getSettings, createVisitor, updateVisitor, defaultSettings } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export default function LockScreen() {
  const router = useRouter();
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [settings, setSettings] = useState(defaultSettings);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showDeviceNotice, setShowDeviceNotice] = useState(true);
  const { unlock } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSettings().then((s) => { if (s) setSettings(s); });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePinComplete = async (pin: string) => {
    if (pin === settings.passcode) {
      setIsSuccess(true);
      // Immediately mark as unlocked in localStorage (works without Supabase)
      if (typeof window !== 'undefined') localStorage.setItem('isUnlocked', 'true');
      // Play unlock sound
      try {
        const audio = new Audio('/sounds/unlock.mp3');
        audio.volume = 0.6;
        audio.play().catch(() => { });
      } catch { }
      setTimeout(() => setIsExploding(true), 300);
      setTimeout(() => setIsTransitioning(true), 1200);
      const visitorId = await createVisitor();
      if (visitorId) {
        await updateVisitor(visitorId, { unlocked: true, unlocked_at: new Date().toISOString() });
        unlock(visitorId);
        if (typeof window !== 'undefined') localStorage.setItem('visitorId', visitorId);
      }
      // Show birthday surprise after lock glow, then navigate
      setTimeout(() => setShowBirthday(true), 1800);
    } else {
      setIsShaking(true);
      setWrongAttempts((p) => p + 1);
      setTimeout(() => setIsShaking(false), 700);
    }
  };

  const hints = [
    settings.hint1, settings.hint2, settings.hint3,
    settings.hint4, settings.hint5, settings.hint6,
  ].filter(Boolean);

  // Floating background blobs
  const blobs = [
    { w: 300, h: 400, top: '10%', left: '5%', delay: 0 },
    { w: 250, h: 350, top: '60%', left: '75%', delay: 2 },
    { w: 200, h: 280, top: '30%', left: '60%', delay: 4 },
    { w: 350, h: 250, top: '70%', left: '10%', delay: 1 },
  ];

  return (
    <main className="lock-screen" ref={containerRef}>
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(107,70,193,0.25) 0%, transparent 70%)',
            top: '-10%', left: '-10%',
            filter: 'blur(40px)',
          }}
          animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
          transition={{ type: 'spring', stiffness: 30, damping: 20 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(155,114,207,0.2) 0%, transparent 70%)',
            bottom: '-10%', right: '-10%',
            filter: 'blur(50px)',
          }}
          animate={{ x: -mousePos.x * 0.3, y: -mousePos.y * 0.3 }}
          transition={{ type: 'spring', stiffness: 30, damping: 20 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
            top: '40%', left: '40%',
            filter: 'blur(30px)',
          }}
          animate={{ x: mousePos.x * 0.2, y: mousePos.y * 0.2 }}
          transition={{ type: 'spring', stiffness: 20, damping: 15 }}
        />
      </div>

      {/* Floating blurred photo placeholders */}
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="floating-photo"
          style={{
            width: blob.w,
            height: blob.h,
            top: blob.top,
            left: blob.left,
            background: `linear-gradient(${135 + i * 40}deg, rgba(107,70,193,0.3), rgba(45,27,105,0.2))`,
            borderRadius: '12px',
          }}
          animate={{
            y: [0, -15, 5, -10, 0],
            rotate: [i % 2 === 0 ? -3 : 2, i % 2 === 0 ? -1 : 4, i % 2 === 0 ? -3 : 2],
            x: mousePos.x * (0.05 * (i + 1)),
          }}
          transition={{
            y: { duration: 8 + blob.delay, repeat: Infinity, ease: 'easeInOut', delay: blob.delay },
            rotate: { duration: 10 + blob.delay, repeat: Infinity, ease: 'easeInOut', delay: blob.delay },
            x: { type: 'spring', stiffness: 20, damping: 15 },
          }}
        />
      ))}

      <ParticleCanvas explode={isExploding} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Lock Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'backOut' }}
          className="mb-8"
        >
          <motion.div
            animate={
              isSuccess
                ? { scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, -10, 10, 0] }
                : { y: [0, -6, 0] }
            }
            transition={
              isSuccess
                ? { duration: 0.6 }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
            className="lock-icon"
            style={{ filter: isSuccess ? 'drop-shadow(0 0 40px #d4af37) drop-shadow(0 0 80px #d4af3799)' : undefined }}
          >
            <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lockGrad" x1="0" y1="0" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor={isSuccess ? '#f5e09a' : '#9b72cf'} />
                  <stop offset="1" stopColor={isSuccess ? '#d4af37' : '#6b46c1'} />
                </linearGradient>
              </defs>
              {/* Shackle */}
              <motion.path
                d="M20 38 V22 C20 11 60 11 60 22 V38"
                stroke="url(#lockGrad)" strokeWidth="5" strokeLinecap="round" fill="none"
                animate={isSuccess ? { d: 'M20 38 V22 C20 11 60 11 60 22 V28' } : {}}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
              {/* Body */}
              <rect x="8" y="36" width="64" height="46" rx="10" fill="url(#lockGrad)" opacity={isSuccess ? '1' : '0.9'} />
              {/* Keyhole */}
              <circle cx="40" cy="56" r="8" fill={isSuccess ? '#1a0a2e' : '#1a0a2e'} />
              <rect x="37" y="56" width="6" height="12" rx="3" fill={isSuccess ? '#1a0a2e' : '#1a0a2e'} />
              {/* Glow rings */}
              {isSuccess && (
                <>
                  <circle cx="40" cy="59" r="32" stroke="#d4af37" strokeWidth="1" opacity="0.4" fill="none" />
                  <circle cx="40" cy="59" r="42" stroke="#d4af37" strokeWidth="0.5" opacity="0.2" fill="none" />
                </>
              )}
            </svg>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-2"
        >
          <h1
            className="text-4xl md:text-5xl mb-3"
            style={{
              fontFamily: 'Playfair Display, serif',
              background: 'linear-gradient(135deg, #c4b5fd 0%, #d4af37 60%, #f5e09a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.01em',
            }}
          >
            Locked Memory Book
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              fontFamily: 'EB Garamond, serif',
              color: 'rgba(196,181,253,0.7)',
              fontSize: '1.05rem',
              fontStyle: 'italic',
              letterSpacing: '0.04em',
            }}
          >
            Only those who know the memories may enter.
          </motion.p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="w-48 h-px my-8"
          style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
        />

        {/* PIN Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-6 w-full max-w-xs"
        >
          <PinInput
            length={6}
            onComplete={handlePinComplete}
            isShaking={isShaking}
            isSuccess={isSuccess}
          />
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {wrongAttempts > 0 && !isSuccess && (
            <motion.p
              key={wrongAttempts}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm mb-4"
              style={{ color: '#f87171', fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}
            >
              {wrongAttempts === 1
                ? "That wasn't quite right. Try the hints below."
                : `Incorrect \u2014 ${wrongAttempts} attempts. The hints might help.`}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {isSuccess && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm mb-4"
              style={{ color: '#f5e09a', fontFamily: 'Dancing Script, cursive', fontSize: '1.2rem' }}
            >
              ✨ Welcome... opening your book
            </motion.p>
          )}
        </AnimatePresence>

        {/* Hint System */}
        {!isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="w-full max-w-sm"
          >
            <HintSystem hints={hints} />
          </motion.div>
        )}

        {/* Decorative footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-10 text-xs"
          style={{
            color: 'rgba(155,114,207,0.35)',
            fontFamily: 'EB Garamond, serif',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Diary · A Private Memory
        </motion.p>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && !showBirthday && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50"
            style={{ background: 'radial-gradient(circle at center, #2d1b69, #0d0618)' }}
          />
        )}
      </AnimatePresence>

      {/* Birthday Surprise Overlay */}
      <AnimatePresence>
        {showBirthday && (
          <BirthdaySurprise onComplete={() => router.push('/book')} />
        )}
      </AnimatePresence>

      {/* Device notice modal */}
      <AnimatePresence>
        {showDeviceNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(13, 6, 24, 0.85)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-md p-6 rounded-2xl border text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(45, 27, 105, 0.9) 0%, rgba(26, 10, 46, 0.95) 100%)',
                borderColor: 'rgba(212, 175, 55, 0.4)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(155, 114, 207, 0.25)',
              }}
            >
              {/* Glowing decorative background orbs inside modal */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div 
                  className="absolute rounded-full" 
                  style={{
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
                    top: '-20%',
                    right: '-20%',
                    filter: 'blur(20px)',
                  }}
                />
              </div>

              {/* Icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(155, 114, 207, 0.2), rgba(107, 70, 193, 0.2))',
                  border: '1px solid rgba(155, 114, 207, 0.3)',
                }}
              >
                <span style={{ fontSize: '2rem' }}>🖥️</span>
              </motion.div>

              {/* Title */}
              <h2 
                className="text-2xl mb-3"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  background: 'linear-gradient(135deg, #faf3e0 0%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 600,
                }}
              >
                Optimal View Required
              </h2>

              {/* Description */}
              <p
                className="mb-6 leading-relaxed"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: 'rgba(250, 243, 224, 0.85)',
                  fontSize: '0.95rem',
                }}
              >
                Please use laptop or computer or desktop view for this. Don't do in phone/mobile.
              </p>

              {/* Dismiss Button */}
              <button
                onClick={() => setShowDeviceNotice(false)}
                className="glow-btn px-8 py-3 w-full font-medium cursor-pointer"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1rem',
                }}
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
