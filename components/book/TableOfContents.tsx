'use client';

import { motion } from 'framer-motion';
import { Chapter } from '@/lib/supabase';

interface TableOfContentsProps {
  chapters: Chapter[];
  onChapterClick?: (index: number) => void;
  title?: string;
  subtitle?: string;
}

export default function TableOfContents({ chapters, onChapterClick, title = 'Diary', subtitle = '' }: TableOfContentsProps) {
  return (
    <div className="page-surface w-full h-full overflow-y-auto p-10 md:p-14" style={{ fontFamily: 'EB Garamond, serif' }}>
      {/* Header */}
      <div className="text-center mb-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ color: '#9b72cf', fontSize: '0.95rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12 }}
        >
          ✦ Contents ✦
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="chapter-heading"
          style={{ fontSize: '2.6rem', fontWeight: 600, marginBottom: 6 }}
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ width: 120, height: 1, background: 'linear-gradient(90deg, transparent, #9b72cf, transparent)', margin: '0 auto 8px' }}
        />
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ color: '#6b46c1', fontSize: '1.1rem', fontStyle: 'italic' }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Chapter List */}
      <div className="space-y-2">
        {chapters.map((ch, i) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.03 }}
            className="toc-item flex items-baseline justify-between py-2 px-1 cursor-pointer group"
            onClick={() => onChapterClick?.(i + 1)}
          >
            <div className="flex items-baseline gap-4">
              <span style={{ color: '#9b72cf', fontSize: '0.85rem', minWidth: 24 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="group-hover:text-violet-600 transition-colors"
                style={{ fontSize: '1.15rem', color: '#2d1b3d' }}
              >
                {ch.title}
              </span>
            </div>
            <span style={{ color: '#9b72cf', fontSize: '0.95rem', flexShrink: 0, marginLeft: 8 }}>
              {i + 2}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center mt-14"
      >
        <div style={{ width: 90, height: 1, background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '0.85rem', color: '#9b72cf', fontStyle: 'italic', letterSpacing: '0.1em' }}>
          Turn the page to begin
        </p>
      </motion.div>
    </div>
  );
}
