'use client';

import { motion } from 'framer-motion';
import { Chapter } from '@/lib/supabase';

interface PageContentProps {
  chapter: Chapter;
  pageNumber: number;
}

export default function PageContent({ chapter, pageNumber }: PageContentProps) {
  const paragraphs = chapter.content.split('\n').filter(Boolean);

  return (
    <div className="page-surface w-full h-full overflow-y-auto relative" style={{ fontFamily: 'EB Garamond, serif' }}>
      {/* Page number top */}
      <div className="absolute top-6 w-full flex justify-center">
        <span style={{ color: '#9b72cf', fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          ✦ My Thoughts ✦
        </span>
      </div>

      <div className="px-10 md:px-14 pt-20 pb-14 h-full flex flex-col">
        {/* Chapter number */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ color: '#9b72cf', fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8 }}
        >
          Chapter {pageNumber}
        </motion.p>

        {/* Chapter title */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="chapter-heading"
          style={{ fontSize: '2.1rem', fontWeight: 600, lineHeight: 1.3, marginBottom: 20 }}
        >
          {chapter.title}
        </motion.h2>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            width: 100, height: 1,
            background: 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.3))',
            marginBottom: 24,
          }}
        />

        {/* Photo */}
        {chapter.photo_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 rounded-lg overflow-hidden"
            style={{ maxHeight: 240 }}
          >
            <img
              src={chapter.photo_url}
              alt={chapter.title}
              className="w-full h-full object-cover"
              style={{ filter: 'sepia(0.2) saturate(0.9)' }}
            />
          </motion.div>
        )}

        {/* Content paragraphs */}
        <div className="flex-1 overflow-y-auto space-y-5">
          {paragraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              className="chapter-text"
              style={{
                textAlign: 'justify',
                textIndent: i === 0 ? '2em' : undefined,
                fontSize: '1.15rem',
                lineHeight: '1.95',
              }}
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Decorative initial cap overlay for first paragraph */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 right-10 flex items-center gap-2"
        >
          <span style={{ color: 'rgba(155,114,207,0.3)', fontSize: '0.85rem', fontFamily: 'Playfair Display, serif' }}>
            {pageNumber}
          </span>
        </motion.div>
      </div>

      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.25) 0%, transparent 50%)',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
