'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter } from '@/lib/supabase';
import TableOfContents from './TableOfContents';
import PageContent from './PageContent';
import FinalPage from './FinalPage';
import { useAppStore } from '@/lib/store';
import { updateVisitor } from '@/lib/supabase';

interface BookReaderProps {
  chapters: Chapter[];
  title?: string;
  subtitle?: string;
}

export default function BookReader({ chapters, title = 'Diary', subtitle = '' }: BookReaderProps) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const { visitorId, isMuted } = useAppStore();

  const [dimensions, setDimensions] = useState({ width: 420, height: 580 });
  const [usePortrait, setUsePortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setUsePortrait(isMobile);
      if (isMobile) {
        // Dynamic scaling factor on mobile
        const scale = Math.min((window.innerWidth - 32) / 420, 1);
        setDimensions({
          width: Math.floor(420 * scale),
          height: Math.floor(580 * scale)
        });
      } else {
        setDimensions({ width: 420, height: 580 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = chapters.length + 3; // cover + TOC + chapters + final

  const playFlipSound = useCallback(() => {
    if (isMuted) return;
    try {
      const audio = new Audio('/sounds/page-flip.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch {}
  }, [isMuted]);

  const handleFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
    setIsFlipping(true);
    playFlipSound();
    setTimeout(() => setIsFlipping(false), 600);
    // Track pages viewed
    if (visitorId) {
      updateVisitor(visitorId, { pages_viewed: e.data });
    }
  }, [visitorId, playFlipSound]);

  const goNext = () => bookRef.current?.pageFlip()?.flipNext();
  const goPrev = () => bookRef.current?.pageFlip()?.flipPrev();
  const goToPage = (idx: number) => bookRef.current?.pageFlip()?.flip(idx);

  const progressPct = Math.round((currentPage / Math.max(totalPages - 1, 1)) * 100);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-4 px-4">
        <div className="flex justify-between items-center mb-1">
          <span style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(196,181,253,0.6)', fontSize: '0.75rem' }}>
            Page {currentPage} of {totalPages - 1}
          </span>
          <span style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(212,175,55,0.6)', fontSize: '0.75rem' }}>
            {progressPct}% read
          </span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6b46c1, #d4af37)', transformOrigin: 'left' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Book */}
      <div className="relative">
        <HTMLFlipBook
          ref={bookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="fixed"
          minWidth={280}
          maxWidth={600}
          minHeight={380}
          maxHeight={800}
          drawShadow={true}
          flippingTime={700}
          usePortrait={usePortrait}
          startPage={0}
          autoSize={false}
          clickEventForward={false}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          maxShadowOpacity={0.5}
          showCover={false}
          style={{}}
          startZIndex={0}
          mobileScrollSupport={true}
          onFlip={handleFlip}
          className="shadow-2xl"
        >
          {/* Page 0: Cover (left) */}
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #2d1b69 0%, #1a0a2e 60%, #3d2490 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset -4px 0 20px rgba(0,0,0,0.5)',
          }}>
            <div className="text-center px-10 flex flex-col items-center">
              <div style={{ width: 100, height: 1, background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '0 auto 20px' }} />
              
              {/* Cover small photo */}
              <div className="p-1 rounded-lg mb-4" style={{
                background: 'linear-gradient(135deg, #d4af37, #f5e09a, #a07c20)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
              }}>
                <div className="w-28 h-28 overflow-hidden rounded-md border border-black/40 bg-cream-page">
                  <img src="/images/hugpic.jpg" alt="Cover pic" className="w-full h-full object-cover" />
                </div>
              </div>

              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', color: '#f5e09a', fontStyle: 'italic', lineHeight: 1.3 }}>
                {title}
              </h1>
              {subtitle && (
                <>
                  <div style={{ width: 100, height: 1, background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '12px auto' }} />
                  <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.05rem', color: 'rgba(212,175,55,0.6)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {subtitle}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Page 1: Table of Contents */}
          <div className="w-full h-full">
            <TableOfContents chapters={chapters} onChapterClick={goToPage} title={title} subtitle={subtitle} />
          </div>

          {/* Chapter pages */}
          {chapters.map((chapter, i) => (
            <div key={chapter.id} className="w-full h-full">
              <PageContent chapter={chapter} pageNumber={i + 1} title={title} />
            </div>
          ))}

          {/* Final Page */}
          <div className="w-full h-full">
            <FinalPage />
          </div>

          {/* Back cover */}
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0618 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path d="M30 8 L33 24 L50 24 L36 33 L41 50 L30 41 L19 50 L24 33 L10 24 L27 24 Z"
                  fill="#d4af37" opacity="0.5" />
              </svg>
            </motion.div>
          </div>
        </HTMLFlipBook>

        {/* Page flip hint corners */}
        <AnimatePresence>
          {currentPage === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: 3 }}
              className="absolute bottom-4 right-4 pointer-events-none"
              style={{ color: 'rgba(212,175,55,0.6)', fontSize: '0.7rem', fontFamily: 'EB Garamond, serif' }}
            >
              ↗ turn page
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
          style={{
            background: 'rgba(74,44,143,0.4)',
            border: '1px solid rgba(155,114,207,0.3)',
            color: '#c4b5fd',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ‹
        </button>

        <div className="text-center">
          <p style={{ fontFamily: 'Dancing Script, cursive', color: '#9b72cf', fontSize: '0.85rem' }}>
            {currentPage === 0 ? 'Cover' :
             currentPage === 1 ? 'Contents' :
             currentPage <= chapters.length + 1 ? chapters[currentPage - 2]?.title || '' :
             'The End'}
          </p>
        </div>

        <button
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
          style={{
            background: 'rgba(74,44,143,0.4)',
            border: '1px solid rgba(155,114,207,0.3)',
            color: '#c4b5fd',
            cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
