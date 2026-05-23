import { create } from 'zustand';
import { SiteSettings, Chapter, defaultSettings, defaultChapters } from './supabase';

interface AppState {
  // Auth
  isUnlocked: boolean;
  visitorId: string | null;
  startTime: number | null;

  // Book state
  currentPage: number;
  totalPages: number;
  isBookOpen: boolean;

  // Data
  settings: SiteSettings;
  chapters: Chapter[];

  // Audio
  isMuted: boolean;

  // Admin
  isAdmin: boolean;

  // Actions
  unlock: (visitorId: string) => void;
  setCurrentPage: (page: number) => void;
  openBook: () => void;
  setSettings: (settings: SiteSettings) => void;
  setChapters: (chapters: Chapter[]) => void;
  toggleMute: () => void;
  setAdmin: (isAdmin: boolean) => void;
  setVisitorId: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isUnlocked: false,
  visitorId: null,
  startTime: null,

  currentPage: 0,
  totalPages: 0,
  isBookOpen: false,

  settings: defaultSettings,
  chapters: defaultChapters,

  isMuted: false,
  isAdmin: false,

  unlock: (visitorId) =>
    set({ isUnlocked: true, visitorId, startTime: Date.now() }),

  setCurrentPage: (page) => set({ currentPage: page }),

  openBook: () => set({ isBookOpen: true }),

  setSettings: (settings) => set({ settings }),

  setChapters: (chapters) => set({ chapters }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setAdmin: (isAdmin) => set({ isAdmin }),

  setVisitorId: (id) => set({ visitorId: id }),
}));
