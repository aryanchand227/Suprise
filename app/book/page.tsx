'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import BookPresentation from '@/components/book/BookPresentation';
import BookReader from '@/components/book/BookReader';
import AudioManager from '@/components/audio/AudioManager';
import { getSettings, getChapters, updateVisitor, defaultSettings, defaultChapters } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export default function BookPage() {
  const router = useRouter();
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [chapters, setChapters] = useState(defaultChapters);
  const [loading, setLoading] = useState(true);
  const { visitorId, startTime } = useAppStore();

  useEffect(() => {
    // Accept: Zustand visitorId, stored visitorId, or simple unlock flag (no Supabase)
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('visitorId') : null;
    const isUnlockedLocally = typeof window !== 'undefined' ? localStorage.getItem('isUnlocked') === 'true' : false;
    const vid = visitorId || storedId;
    if (!vid && !isUnlockedLocally) {
      router.replace('/');
      return;
    }

    Promise.all([getSettings(), getChapters()]).then(([s, c]) => {
      if (s) setSettings(s);
      if (c?.length) setChapters(c);
      setLoading(false);
    });

    // Save reading duration when user leaves the page
    const handleUnload = () => {
      if (vid && startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        updateVisitor(vid, { duration_seconds: duration });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const handleOpenBook = () => {
    try {
      const audio = new Audio('/sounds/book-open.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
    setIsBookOpen(true);
  };

  // Floating background blobs
  const floatingBlobs = [
    { w: 320, h: 400, top: '5%', left: '2%', opacity: 0.08 },
    { w: 260, h: 340, top: '55%', left: '72%', opacity: 0.07 },
    { w: 200, h: 260, top: '25%', left: '65%', opacity: 0.06 },
    { w: 350, h: 240, top: '68%', left: '8%', opacity: 0.07 },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 30%, #2d1b69 0%, #1a0a2e 45%, #0d0618 100%)', position: 'relative', overflow: 'hidden' }}>
      <AudioManager />

      {/* Floating background memory photos */}
      {floatingBlobs.map((blob, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: blob.w, height: blob.h,
            top: blob.top, left: blob.left,
            background: `linear-gradient(${120 + i * 45}deg, rgba(107,70,193,0.4), rgba(45,27,105,0.2))`,
            borderRadius: 12,
            filter: 'blur(3px)',
            opacity: blob.opacity,
            pointerEvents: 'none',
          }}
          animate={{ y: [0, -20, 5, -12, 0], rotate: [i % 2 === 0 ? -2 : 1, i % 2 === 0 ? 0 : 3, i % 2 === 0 ? -2 : 1] }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
        />
      ))}

      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(107,70,193,0.2) 0%, transparent 70%)',
          top: '-10%', left: '-10%', filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(155,114,207,0.15) 0%, transparent 70%)',
          bottom: '-10%', right: '-10%', filter: 'blur(50px)',
        }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, border: '2px solid rgba(155,114,207,0.3)', borderTopColor: '#9b72cf', borderRadius: '50%' }}
          />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!isBookOpen ? (
            <motion.div key="presentation" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}>
              <BookPresentation
                title={settings.book_title}
                subtitle={settings.book_subtitle}
                coverImageUrl={settings.cover_image_url}
                onOpen={handleOpenBook}
              />
            </motion.div>
          ) : (
            <motion.div
              key="reader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.6rem',
                  background: 'linear-gradient(135deg, #c4b5fd, #d4af37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {settings.book_title}
                </h1>
                <p style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(196,181,253,0.6)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: 4 }}>
                  {settings.book_subtitle}
                </p>
              </motion.div>

              <BookReader chapters={chapters} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
  );
}
