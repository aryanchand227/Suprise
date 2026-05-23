'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export default function AudioManager() {
  const { isMuted, toggleMute } = useAppStore();
  const [ambientAudio, setAmbientAudio] = useState<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/sounds/ambient-piano.mp3');
    audio.loop = true;
    audio.volume = 0.1;
    setAmbientAudio(audio);

    const startAudio = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        audio.play().catch(() => { });
      }
    };
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });

    return () => {
      audio.pause();
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
  }, []);

  useEffect(() => {
    if (!ambientAudio) return;
    if (isMuted) {
      ambientAudio.pause();
    } else if (hasInteracted) {
      ambientAudio.play().catch(() => { });
    }
  }, [isMuted, ambientAudio, hasInteracted]);

  const bars = [1, 0.6, 0.8, 0.5, 0.9, 0.7, 1, 0.6];

  return (
    <button
      onClick={toggleMute}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
      style={{
        background: 'rgba(26,10,46,0.8)',
        border: '1px solid rgba(155,114,207,0.3)',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
      }}
      title={isMuted ? 'Unmute music' : 'Mute music'}
    >
      {isMuted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b72cf" strokeWidth="2" strokeLinecap="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <div className="flex items-end gap-0.5" style={{ height: 18 }}>
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="w-0.5 rounded-full"
              style={{ background: '#9b72cf', height: `${h * 100}%` }}
              animate={{ scaleY: [1, h * 0.5 + 0.3, 1] }}
              transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
      <span style={{ color: '#9b72cf', fontSize: '0.65rem', fontFamily: 'EB Garamond, serif' }}>
        {isMuted ? 'Unmute' : 'Music'}
      </span>
    </button>
  );
}
