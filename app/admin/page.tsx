'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSettings, getChapters, getVisitors, getReplies, getAnalytics,
  updateSettings, updateChapter, createChapter, deleteChapter,
  defaultSettings, defaultChapters,
  type SiteSettings, type Chapter, type Visitor, type Reply, type Analytics,
} from '@/lib/supabase';

type Tab = 'dashboard' | 'settings' | 'chapters' | 'visitors' | 'replies';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);

  // Data
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [chapters, setChapters] = useState<Chapter[]>(defaultChapters);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Chapter editing state
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showNewChapter, setShowNewChapter] = useState(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const [s, c, v, r, a] = await Promise.all([
      getSettings(), getChapters(), getVisitors(), getReplies(), getAnalytics(),
    ]);
    if (s) setSettings(s);
    if (c?.length) setChapters(c);
    setVisitors(v);
    setReplies(r);
    setAnalytics(a);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    if (password === settings.admin_password || password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError(false);
      loadAllData();
    } else {
      setLoginError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 700);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    const ok = await updateSettings({
      passcode: settings.passcode,
      hint1: settings.hint1, hint2: settings.hint2, hint3: settings.hint3,
      hint4: settings.hint4, hint5: settings.hint5, hint6: settings.hint6,
      admin_password: settings.admin_password,
      book_title: settings.book_title,
      book_subtitle: settings.book_subtitle,
      cover_image_url: settings.cover_image_url,
    });
    setSaveStatus(ok ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleSaveChapter = async () => {
    if (!editingChapter) return;
    setSaveStatus('saving');
    const ok = await updateChapter(editingChapter.id, {
      title: editingChapter.title,
      content: editingChapter.content,
    });
    if (ok) {
      setChapters(prev => prev.map(c => c.id === editingChapter.id ? editingChapter : c));
      setEditingChapter(null);
    }
    setSaveStatus(ok ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleDeleteChapter = async (id: number) => {
    if (!confirm('Delete this chapter permanently?')) return;
    const ok = await deleteChapter(id);
    if (ok) setChapters(prev => prev.filter(c => c.id !== id));
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    const ch = await createChapter({
      title: newChapterTitle.trim(),
      content: '',
      order_index: chapters.length + 1,
      photo_url: null,
    });
    if (ch) {
      setChapters(prev => [...prev, ch]);
      setNewChapterTitle('');
      setShowNewChapter(false);
      setEditingChapter(ch);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        dateStyle: 'medium', timeStyle: 'short',
      });
    } catch { return iso; }
  };

  if (!isLoggedIn) {
    return <LoginScreen
      password={password}
      setPassword={setPassword}
      onLogin={handleLogin}
      isShaking={isShaking}
      hasError={loginError}
    />;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
    { id: 'chapters', label: 'Chapters', icon: '📖' },
    { id: 'visitors', label: 'Visitors', icon: '👁' },
    { id: 'replies', label: 'Replies', icon: '✉' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 40% 20%, #2d1b69 0%, #1a0a2e 50%, #0d0618 100%)' }}>
      {/* Top Bar */}
      <header style={{ borderBottom: '1px solid rgba(155,114,207,0.2)', backdropFilter: 'blur(12px)', background: 'rgba(13,6,24,0.7)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.2rem' }}>📒</span>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', background: 'linear-gradient(135deg, #c4b5fd, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                My Thoughts — Admin
              </h1>
              <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.7rem', color: 'rgba(155,114,207,0.5)' }}>Owner Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saveStatus !== 'idle' && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '0.8rem',
                    color: saveStatus === 'saved' ? '#86efac' : saveStatus === 'error' ? '#fca5a5' : '#f5e09a',
                  }}
                >
                  {saveStatus === 'saving' ? '⟳ Saving…' : saveStatus === 'saved' ? '✓ Saved' : '✗ Error'}
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsLoggedIn(false)}
              style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.8rem', color: 'rgba(155,114,207,0.6)', cursor: 'pointer', border: '1px solid rgba(155,114,207,0.2)', borderRadius: 8, padding: '4px 12px', background: 'transparent' }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1 pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: '0.85rem',
                padding: '8px 16px',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                background: activeTab === tab.id ? 'rgba(74,44,143,0.5)' : 'transparent',
                color: activeTab === tab.id ? '#c4b5fd' : 'rgba(155,114,207,0.5)',
                borderBottom: activeTab === tab.id ? '2px solid #d4af37' : '2px solid transparent',
              }}
            >
              <span className="mr-1.5">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-24">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ width: 36, height: 36, border: '2px solid rgba(155,114,207,0.3)', borderTopColor: '#9b72cf', borderRadius: '50%' }} />
            </motion.div>
          ) : activeTab === 'dashboard' ? (
            <DashboardTab key="dashboard" analytics={analytics} visitors={visitors} replies={replies} formatDate={formatDate} formatDuration={formatDuration} />
          ) : activeTab === 'settings' ? (
            <SettingsTab key="settings" settings={settings} setSettings={setSettings} onSave={handleSaveSettings} />
          ) : activeTab === 'chapters' ? (
            <ChaptersTab
              key="chapters"
              chapters={chapters}
              editingChapter={editingChapter}
              setEditingChapter={setEditingChapter}
              onSaveChapter={handleSaveChapter}
              onDeleteChapter={handleDeleteChapter}
              showNewChapter={showNewChapter}
              setShowNewChapter={setShowNewChapter}
              newChapterTitle={newChapterTitle}
              setNewChapterTitle={setNewChapterTitle}
              onAddChapter={handleAddChapter}
            />
          ) : activeTab === 'visitors' ? (
            <VisitorsTab key="visitors" visitors={visitors} formatDate={formatDate} formatDuration={formatDuration} />
          ) : (
            <RepliesTab key="replies" replies={replies} formatDate={formatDate} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Login Screen ────────────────────────────────────────

function LoginScreen({ password, setPassword, onLogin, isShaking, hasError }: {
  password: string; setPassword: (v: string) => void; onLogin: () => void;
  isShaking: boolean; hasError: boolean;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 60% 40%, #2d1b69 0%, #1a0a2e 40%, #0d0618 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1, x: isShaking ? [0, -12, 12, -10, 10, -6, 6, 0] : 0 }}
        transition={{ duration: isShaking ? 0.5 : 0.6, ease: isShaking ? 'easeInOut' : 'backOut' }}
        className="admin-card p-10 w-full max-w-sm text-center"
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔐</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', background: 'linear-gradient(135deg, #c4b5fd, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 6 }}>
          Admin Access
        </h1>
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.85rem', color: 'rgba(155,114,207,0.6)', marginBottom: 28 }}>
          Enter the admin password to manage your book.
        </p>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onLogin()}
          placeholder="Admin password"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12, marginBottom: 12,
            background: 'rgba(255,255,255,0.05)', border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'rgba(155,114,207,0.3)'}`,
            color: '#f5e09a', fontFamily: 'EB Garamond, serif', fontSize: '1rem',
            outline: 'none', textAlign: 'center', letterSpacing: '0.2em',
          }}
        />

        <AnimatePresence>
          {hasError && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.8rem', color: '#f87171', fontStyle: 'italic', marginBottom: 12 }}>
              Incorrect password. Try again.
            </motion.p>
          )}
        </AnimatePresence>

        <button onClick={onLogin} className="glow-btn w-full py-3 text-sm"
          style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.08em', cursor: 'pointer' }}>
          Enter
        </button>
      </motion.div>
    </div>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────

function DashboardTab({ analytics, visitors, replies, formatDate, formatDuration }: {
  analytics: Analytics | null; visitors: Visitor[]; replies: Reply[];
  formatDate: (s: string) => string; formatDuration: (n: number) => string;
}) {
  const stats = analytics ?? { totalVisitors: 0, successfulUnlocks: 0, failedAttempts: 0, averageDuration: 0, repliesSubmitted: 0 };

  const cards = [
    { label: 'Total Visitors', value: stats.totalVisitors, icon: '👁', color: '#9b72cf' },
    { label: 'Unlocked Book', value: stats.successfulUnlocks, icon: '🔓', color: '#d4af37' },
    { label: 'Failed Attempts', value: stats.failedAttempts, icon: '❌', color: '#f87171' },
    { label: 'Avg. Read Time', value: formatDuration(stats.averageDuration), icon: '⏱', color: '#86efac' },
    { label: 'Replies Written', value: stats.repliesSubmitted, icon: '✉', color: '#c4b5fd' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#c4b5fd', marginBottom: 24 }}>Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="admin-card p-5 text-center"
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: card.color, fontWeight: 600 }}>
              {card.value}
            </div>
            <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.72rem', color: 'rgba(155,114,207,0.6)', marginTop: 4, letterSpacing: '0.08em' }}>
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#c4b5fd', marginBottom: 16 }}>
            Recent Visitors
          </h3>
          <div className="space-y-3">
            {visitors.slice(0, 5).map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(155,114,207,0.1)' }}>
                <div>
                  <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.8rem', color: 'rgba(196,181,253,0.8)' }}>
                    {formatDate(v.created_at)}
                  </span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                    <Badge color={v.unlocked ? '#86efac' : '#f87171'} label={v.unlocked ? 'Unlocked' : 'Locked'} />
                    {v.replied && <Badge color='#c4b5fd' label='Replied' />}
                  </div>
                </div>
                <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.75rem', color: 'rgba(155,114,207,0.5)' }}>
                  {v.pages_viewed} pages
                </span>
              </motion.div>
            ))}
            {visitors.length === 0 && <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.85rem', color: 'rgba(155,114,207,0.4)', fontStyle: 'italic' }}>No visitors yet.</p>}
          </div>
        </div>

        <div className="admin-card p-6">
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#c4b5fd', marginBottom: 16 }}>
            Recent Replies
          </h3>
          <div className="space-y-3">
            {replies.slice(0, 5).map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: '10px 0', borderBottom: '1px solid rgba(155,114,207,0.1)' }}>
                <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.8rem', color: 'rgba(155,114,207,0.5)', marginBottom: 4 }}>
                  {formatDate(r.submitted_at)}
                </p>
                <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '0.95rem', color: '#f0e6c8', lineHeight: 1.5 }}>
                  "{r.content.slice(0, 120)}{r.content.length > 120 ? '…' : ''}"
                </p>
              </motion.div>
            ))}
            {replies.length === 0 && <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.85rem', color: 'rgba(155,114,207,0.4)', fontStyle: 'italic' }}>No replies yet.</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Settings Tab ────────────────────────────────────────

function SettingsTab({ settings, setSettings, onSave }: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave: () => void;
}) {
  const set = (key: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings(prev => ({ ...prev, [key]: e.target.value }));

  const hints = ['hint1', 'hint2', 'hint3', 'hint4', 'hint5', 'hint6'] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#c4b5fd' }}>Settings</h2>
        <button onClick={onSave} className="glow-btn px-6 py-2 text-sm" style={{ fontFamily: 'Playfair Display, serif', cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Book Info */}
        <div className="admin-card p-6">
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37', fontSize: '0.95rem', marginBottom: 20 }}>Book Information</h3>
          <div className="space-y-4">
            <Field label="Book Title" value={settings.book_title} onChange={set('book_title')} />
            <Field label="Book Subtitle" value={settings.book_subtitle} onChange={set('book_subtitle')} />
            <Field label="Cover Image URL" value={settings.cover_image_url || ''} onChange={set('cover_image_url')} placeholder="https://..." />
          </div>
        </div>

        {/* Access */}
        <div className="admin-card p-6">
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37', fontSize: '0.95rem', marginBottom: 20 }}>Access Control</h3>
          <div className="space-y-4">
            <Field label="Passcode (PIN)" value={settings.passcode} onChange={set('passcode')} placeholder="e.g. 030306" />
            <Field label="Admin Password" value={settings.admin_password} onChange={set('admin_password')} type="password" />
          </div>
        </div>

        {/* Hints */}
        <div className="admin-card p-6 md:col-span-2">
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37', fontSize: '0.95rem', marginBottom: 20 }}>
            Passcode Hints <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.75rem', color: 'rgba(155,114,207,0.5)', fontWeight: 400 }}>(shown on lock screen — be cryptic!)</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {hints.map((h, i) => (
              <Field key={h} label={`Hint ${i + 1}`} value={settings[h]} onChange={set(h)} placeholder={`Clue for digit ${i + 1}…`} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chapters Tab ────────────────────────────────────────

function ChaptersTab({ chapters, editingChapter, setEditingChapter, onSaveChapter, onDeleteChapter,
  showNewChapter, setShowNewChapter, newChapterTitle, setNewChapterTitle, onAddChapter }: {
  chapters: Chapter[];
  editingChapter: Chapter | null;
  setEditingChapter: (c: Chapter | null) => void;
  onSaveChapter: () => void;
  onDeleteChapter: (id: number) => void;
  showNewChapter: boolean;
  setShowNewChapter: (v: boolean) => void;
  newChapterTitle: string;
  setNewChapterTitle: (v: string) => void;
  onAddChapter: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#c4b5fd' }}>
          Chapters <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem', color: 'rgba(155,114,207,0.5)', fontWeight: 400 }}>({chapters.length})</span>
        </h2>
        <button
          onClick={() => setShowNewChapter(!showNewChapter)}
          className="glow-btn px-5 py-2 text-sm"
          style={{ fontFamily: 'Playfair Display, serif', cursor: 'pointer' }}
        >
          + Add Chapter
        </button>
      </div>

      {/* New Chapter Form */}
      <AnimatePresence>
        {showNewChapter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-card p-5 mb-6 overflow-hidden"
          >
            <p style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37', marginBottom: 12, fontSize: '0.9rem' }}>New Chapter</p>
            <div className="flex gap-3">
              <input
                value={newChapterTitle}
                onChange={e => setNewChapterTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onAddChapter()}
                placeholder="Chapter title…"
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,114,207,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f0e6c8', fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', outline: 'none' }}
              />
              <button onClick={onAddChapter} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(74,44,143,0.6)', border: '1px solid rgba(212,175,55,0.3)', color: '#f5e09a', fontFamily: 'Playfair Display, serif', fontSize: '0.85rem', cursor: 'pointer' }}>
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Chapter List */}
        <div className="space-y-2">
          {chapters.map((ch, i) => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setEditingChapter(ch)}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: editingChapter?.id === ch.id ? 'rgba(74,44,143,0.5)' : 'rgba(45,27,105,0.2)',
                border: `1px solid ${editingChapter?.id === ch.id ? 'rgba(212,175,55,0.4)' : 'rgba(155,114,207,0.15)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.7rem', color: '#9b72cf', minWidth: 22 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.9rem', color: '#f0e6c8' }}>{ch.title}</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDeleteChapter(ch.id); }}
                style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.4)', cursor: 'pointer', fontSize: '0.85rem', padding: '0 4px' }}
                title="Delete chapter"
              >✕</button>
            </motion.div>
          ))}
        </div>

        {/* Chapter Editor */}
        <AnimatePresence mode="wait">
          {editingChapter ? (
            <motion.div key={editingChapter.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="admin-card p-6">
              <p style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37', marginBottom: 14, fontSize: '0.9rem' }}>Editing Chapter</p>
              <input
                value={editingChapter.title}
                onChange={e => setEditingChapter({ ...editingChapter, title: e.target.value })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,114,207,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f5e09a', fontFamily: 'Playfair Display, serif', fontSize: '1rem', outline: 'none', marginBottom: 12 }}
                placeholder="Chapter title"
              />
              <textarea
                value={editingChapter.content}
                onChange={e => setEditingChapter({ ...editingChapter, content: e.target.value })}
                rows={14}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(155,114,207,0.2)', borderRadius: 10, padding: '12px 14px', color: '#e8d5b0', fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', lineHeight: 1.8, outline: 'none', resize: 'vertical', marginBottom: 14 }}
                placeholder="Chapter content…"
              />
              <input
                value={editingChapter.photo_url || ''}
                onChange={e => setEditingChapter({ ...editingChapter, photo_url: e.target.value || null })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,114,207,0.2)', borderRadius: 10, padding: '8px 14px', color: '#c4b5fd', fontFamily: 'EB Garamond, serif', fontSize: '0.85rem', outline: 'none', marginBottom: 14 }}
                placeholder="Optional photo URL…"
              />
              <div className="flex gap-3">
                <button onClick={onSaveChapter} className="glow-btn px-6 py-2 text-sm flex-1" style={{ fontFamily: 'Playfair Display, serif', cursor: 'pointer' }}>Save Chapter</button>
                <button onClick={() => setEditingChapter(null)} style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(155,114,207,0.2)', color: 'rgba(155,114,207,0.6)', cursor: 'pointer', fontFamily: 'EB Garamond, serif', fontSize: '0.85rem' }}>Cancel</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="admin-card p-6 flex items-center justify-center">
              <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.9rem', color: 'rgba(155,114,207,0.5)', fontStyle: 'italic', textAlign: 'center' }}>
                Select a chapter to edit its title and content
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Visitors Tab ────────────────────────────────────────

function VisitorsTab({ visitors, formatDate, formatDuration }: {
  visitors: Visitor[]; formatDate: (s: string) => string; formatDuration: (n: number) => string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#c4b5fd', marginBottom: 24 }}>
        Visitors <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem', color: 'rgba(155,114,207,0.5)', fontWeight: 400 }}>({visitors.length})</span>
      </h2>

      {visitors.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <p style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(155,114,207,0.4)', fontStyle: 'italic' }}>No visitors have arrived yet.</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(155,114,207,0.2)' }}>
                  {['Arrived', 'Unlocked At', 'Pages', 'Duration', 'Replied', 'Status'].map(h => (
                    <th key={h} style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.7rem', color: 'rgba(155,114,207,0.6)', textAlign: 'left', padding: '12px 16px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(155,114,207,0.08)' }}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'EB Garamond, serif', fontSize: '0.82rem', color: '#c4b5fd' }}>{formatDate(v.created_at)}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'EB Garamond, serif', fontSize: '0.82rem', color: 'rgba(196,181,253,0.6)' }}>{v.unlocked_at ? formatDate(v.unlocked_at) : '—'}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'EB Garamond, serif', fontSize: '0.82rem', color: '#f0e6c8' }}>{v.pages_viewed}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'EB Garamond, serif', fontSize: '0.82rem', color: '#f0e6c8' }}>{formatDuration(v.duration_seconds)}</td>
                    <td style={{ padding: '12px 16px' }}><Badge color={v.replied ? '#c4b5fd' : 'rgba(155,114,207,0.3)'} label={v.replied ? 'Yes' : 'No'} /></td>
                    <td style={{ padding: '12px 16px' }}><Badge color={v.unlocked ? '#86efac' : '#f87171'} label={v.unlocked ? 'Unlocked' : 'Bounced'} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Replies Tab ─────────────────────────────────────────

function RepliesTab({ replies, formatDate }: { replies: Reply[]; formatDate: (s: string) => string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#c4b5fd', marginBottom: 24 }}>
        Reply Letters <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem', color: 'rgba(155,114,207,0.5)', fontWeight: 400 }}>({replies.length})</span>
      </h2>

      {replies.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.1rem', color: 'rgba(155,114,207,0.4)' }}>No replies have been written yet…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {replies.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="admin-card overflow-hidden cursor-pointer"
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            >
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.75rem', color: 'rgba(155,114,207,0.5)', marginBottom: 4 }}>{formatDate(r.submitted_at)}</p>
                  <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1rem', color: '#f0e6c8' }}>
                    "{r.content.slice(0, 80)}{r.content.length > 80 ? '…' : ''}"
                  </p>
                </div>
                <span style={{ color: '#9b72cf', transition: 'transform 0.3s', display: 'inline-block', transform: expanded === r.id ? 'rotate(180deg)' : 'none' }}>↓</span>
              </div>

              <AnimatePresence>
                {expanded === r.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(155,114,207,0.15)', paddingTop: 16 }}>
                      <div
                        style={{
                          background: 'linear-gradient(160deg, #fdfaf0 0%, #f8f0d8 100%)',
                          borderRadius: 12, padding: 20,
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      >
                        <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.1rem', color: '#2d1b3d', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                          {r.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Helpers ─────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label style={{ fontFamily: 'EB Garamond, serif', fontSize: '0.72rem', color: 'rgba(155,114,207,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,114,207,0.25)', borderRadius: 10, padding: '10px 14px', color: '#f0e6c8', fontFamily: 'EB Garamond, serif', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(155,114,207,0.25)'}
      />
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      background: `${color}22`, border: `1px solid ${color}55`,
      color: color, fontFamily: 'EB Garamond, serif', fontSize: '0.72rem',
      letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
}
