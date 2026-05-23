import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isOffline = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL === '';

// ──────────────────────────────────────────────────────────────────
export interface SiteSettings {
  id: number;
  passcode: string;
  hint1: string;
  hint2: string;
  hint3: string;
  hint4: string;
  hint5: string;
  hint6: string;
  admin_password: string;
  book_title: string;
  book_subtitle: string;
  cover_image_url: string | null;
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
  order_index: number;
  photo_url: string | null;
}

export interface Visitor {
  id: string;
  ip: string | null;
  created_at: string;
  unlocked: boolean;
  unlocked_at: string | null;
  pages_viewed: number;
  duration_seconds: number;
  replied: boolean;
}

export interface Reply {
  id: string;
  visitor_id: string | null;
  content: string;
  submitted_at: string;
}

// ──────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings | null> {
  if (isOffline) return defaultSettings;
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    if (error) return defaultSettings;
    return data || defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function getChapters(): Promise<Chapter[]> {
  if (isOffline) return defaultChapters;
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('order_index');
    if (error) return defaultChapters;
    return data || defaultChapters;
  } catch {
    return defaultChapters;
  }
}

export async function createVisitor(): Promise<string | null> {
  if (isOffline) return null;
  try {
    const { data, error } = await supabase
      .from('visitors')
      .insert({ unlocked: false, pages_viewed: 0, duration_seconds: 0, replied: false })
      .select('id')
      .single();
    if (error) {
      console.error("Supabase createVisitor error:", error);
      return null;
    }
    return data?.id || null;
  } catch (err) {
    console.error("Supabase createVisitor exception:", err);
    return null;
  }
}

export async function updateVisitor(id: string, updates: Partial<Visitor>) {
  if (isOffline) return;
  try {
    const { error } = await supabase.from('visitors').update(updates).eq('id', id);
    if (error) {
      console.error("Supabase updateVisitor error:", error);
    }
  } catch (err) {
    console.error("Supabase updateVisitor exception:", err);
  }
}

export async function submitReply(visitorId: string | null, content: string) {
  if (isOffline) {
    console.log("Offline mode: Saved reply letter to console:", content);
    return true;
  }
  try {
    // If visitorId is not a valid UUID (or null), convert it to undefined so it doesn't cause foreign key format errors
    const formattedVisitorId = (visitorId && visitorId.length === 36) ? visitorId : null;
    const { error } = await supabase
      .from('replies')
      .insert({ visitor_id: formattedVisitorId, content });
    if (error) {
      console.error("Supabase submitReply error:", error);
    }
    if (formattedVisitorId && !error) {
      await supabase.from('visitors').update({ replied: true }).eq('id', formattedVisitorId);
    }
    return !error;
  } catch (err) {
    console.error("Supabase submitReply exception:", err);
    return false;
  }
}

// â”€â”€â”€ Admin helper functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function updateSettings(updates: Partial<Omit<SiteSettings, 'id'>>) {
  if (isOffline) return true;
  try {
    const { error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', 1);
    return !error;
  } catch {
    return false;
  }
}

export async function updateChapter(id: number, updates: Partial<Omit<Chapter, 'id'>>) {
  if (isOffline) return true;
  try {
    const { error } = await supabase
      .from('chapters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function createChapter(chapter: Omit<Chapter, 'id'>): Promise<Chapter | null> {
  if (isOffline) return { id: Math.floor(Math.random() * 1000), ...chapter } as Chapter;
  try {
    const { data, error } = await supabase
      .from('chapters')
      .insert(chapter)
      .select()
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function deleteChapter(id: number) {
  if (isOffline) return true;
  try {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function reorderChapters(orderedIds: { id: number; order_index: number }[]) {
  if (isOffline) return true;
  try {
    for (const item of orderedIds) {
      await supabase
        .from('chapters')
        .update({ order_index: item.order_index })
        .eq('id', item.id);
    }
    return true;
  } catch {
    return false;
  }
}

export interface Analytics {
  totalVisitors: number;
  successfulUnlocks: number;
  failedAttempts: number;
  averageDuration: number;
  repliesSubmitted: number;
}

export async function getAnalytics(): Promise<Analytics> {
  try {
    const visitors = await getVisitors();
    const replies = await getReplies();
    const totalVisitors = visitors.length;
    const successfulUnlocks = visitors.filter(v => v.unlocked).length;
    const failedAttempts = totalVisitors - successfulUnlocks;
    const durations = visitors
      .filter(v => v.duration_seconds > 0)
      .map(v => v.duration_seconds);
    const averageDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    return {
      totalVisitors,
      successfulUnlocks,
      failedAttempts,
      averageDuration,
      repliesSubmitted: replies.length,
    };
  } catch {
    return { totalVisitors: 0, successfulUnlocks: 0, failedAttempts: 0, averageDuration: 0, repliesSubmitted: 0 };
  }
}

export async function getVisitors(): Promise<Visitor[]> {
  if (isOffline) return [];
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getReplies(): Promise<Reply[]> {
  if (isOffline) return [];
  try {
    const { data, error } = await supabase
      .from('replies')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// â”€â”€â”€ Default data (used when DB not connected) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const defaultSettings: SiteSettings = {
  id: 1,
  passcode: '931748',
  hint1: 'My nickname (it is a single digit)',
  hint2: 'No. of digits of the colour you call me',
  hint3: 'The first digit of the last date we spoke',
  hint4: 'Total no. of ppl in your fav group',
  hint5: 'First digit of the weeks since I didn\'t text you',
  hint6: 'Addition of your birthdate',
  admin_password: '@ryan123',
  book_title: 'My Thoughts',
  book_subtitle: 'Some words I never stopped carrying.',
  cover_image_url: null,
};

export const defaultChapters: Chapter[] = [
  {
    id: 1, order_index: 1, photo_url: null,
    title: "Why I'm Writing This",
    content: `Idk if I should write this or not, but today feels like it gave me permission to. Wow… it's been a while. Never thought it would be this long.`,
  },
  {
    id: 2, order_index: 2, photo_url: null,
    title: "Missing You & Wondering About You",
    content: `Do I miss you? Absolutely. Do I regret it? Yes and no. I miss the time I had with you. I miss my safe, comfortable place. I miss my grammar corrector. I know I asked you not to text me, and I know you would have if I hadn't asked. I'm thankful you listened and cared enough to follow through. But you've become the biggest "what if" I'll question for the rest of my life. I wonder if you ever think about me, if you miss me, if you miss my silly questions. I often wonder how you're doing. I know I could just text you and ask, and I know you'd reply, but I still sit here wondering… is life better when I'm not in it?`,
  },
  {
    id: 3, order_index: 3, photo_url: null,
    title: "What No Contact Taught Me",
    content: `No contact made me realize that I'm actually okay without you… but sometimes I'm not. It was hard at first. I kept checking my phone, waiting for a message that never came. Some days I felt empty, like a part of me was missing. But slowly, day by day, I started feeling lighter. I spent more time alone, doing little things that make me happy. I know we've both grown, and we're not the same people we were when we left things behind.`,
  },
  {
    id: 4, order_index: 4, photo_url: null,
    title: "Realizing I Hadn't Moved On",
    content: `What surprised me most was thinking I was moving on… and I almost was, until my birthday. My mind still waited for that one notification from you. Funny, right? Waiting for a message from someone I told not to text me again. Funny how I used to tell you everything, and now I don't even know how your day was. I don't know what you like now, what you dislike, what makes you happy, what's bothering you… like I used to. I've learned to live without hearing about your days, but that doesn't mean I stopped caring.`,
  },
  {
    id: 5, order_index: 5, photo_url: null,
    title: "Missing Our Connection & Realizing I Still Love You",
    content: `I didn't reach out because I suddenly wanted to disturb your peace. I reached out because sometimes distance makes you realize how much you love someone. And I guess I never really stopped loving you. No matter where we go or what we become, a part of you will always stay with me, and a part of me will always love you.`,
  },
  {
    id: 6, order_index: 6, photo_url: null,
    title: "Letting Go, Fighting for Love & What I Miss Most",
    content: `One day something hit me hard. If I really loved you, was letting go the only thing I could do? And honestly… no. That felt like bullshit. What kind of love is it if you can't fight for it? But then I realized something else too — if you loved me enough, maybe you would've fought too. And there I was, fighting for the love of a person while the person themselves had already given up.\n\nWhat scares me isn't forgetting you… it's forgetting your voice, the way you talk, the tiny details, the parts of you I thought I'd remember forever. I miss you, but not only when I'm lonely. I miss you when I'm excited. When I achieve something. I miss having someone I wanted to tell everything to. I miss the version of me that had you to share it all with.`,
  },
  {
    id: 7, order_index: 7, photo_url: null,
    title: "Regret, Guilt & My Apology",
    content: `Just because I let you go doesn't mean I wanted to. I'm a leaver, but I'm also a waiter. I'll leave you alone… but wait the whole time for you. I'd love to talk to you, but I know where I stand now. And honestly, how lucky will the man be who gets your love? I still ask myself how I let you go when you had become part of my daily routine. I know I messed up. I know I shouldn't have done what I did. And I know if we start talking again maybe we could go back to what we once were… but I also know maybe we can't.\n\nI know I should've sent this a long time ago. Maybe I'm late. Forgive me if you can. I know the problem was in me, I just realized it too late. I feel guilty for the way I treated you. I miss you… really. My choices weren't good back then. Maybe that's why I felt numb. You tried to fix things between us, and I know I should've respected that, but I didn't.`,
  },
  {
    id: 8, order_index: 8, photo_url: null,
    title: "The Story We Never Finished",
    content: `We were the best book I never finished. We had the perfect plot, the perfect chemistry… we just ran out of pages. A masterpiece nobody ever got to read. Yeah, LOL I copied that from a reel 😂 but it felt true. I made you a promise to love you always and forever, and that's still a promise I've never broken. Somewhere in me, I still believe our story isn't over yet. I feel like there's more left between us. I still believe in us.\n\nYour point of view always felt like this: the intimacy of knowing you can't be together forever and still choosing to stay a little longer for a few final moments. And mine? "Still be friends after loving you?" Honestly… I couldn't do that. I wanted to marry you.`,
  },
  {
    id: 9, order_index: 9, photo_url: null,
    title: "Your View, My View & Why It Still Feels Unfinished",
    content: `I know there's no hope, and somehow I still waited. If I wait for you, it'll never be me. If I move on, it'll never be you. Somewhere deep down I keep feeling like we'll meet again. Maybe the universe knew we weren't done yet. Or maybe it's just my heart refusing to accept an ending without meaning.`,
  },
  {
    id: 10, order_index: 10, photo_url: null,
    title: "Why Distance Happened & Why It Might Not Be the End",
    content: `Sometimes I feel like life separated us not to say goodbye, but to build us. Like maybe if it ever brings us back together again, we'll be ready this time. Ready to love each other better. It's hard waiting around for something that might never happen… but it's harder giving up on something that feels like everything you ever wanted. Maybe we both needed to fall apart to understand how much we belonged to each other. Maybe distance isn't always a bad thing. Sometimes distance pulls people closer than ever. Sometimes distance makes things clearer. Maybe sometimes distance is necessary to come closer.\n\nI still wonder… what if I never forget you? What if this stays with me forever? What if I meet someone new someday and still try to find pieces of you in them? I feel like I haven't moved on enough. I closed the door… but I never locked it. A part of me still looks at it, waiting for it to open.`,
  },
  {
    id: 11, order_index: 11, photo_url: null,
    title: "Trying to Move On But Still Waiting",
    content: `I remember New Year's. Everyone around me was happy, and I was too… but quietly I was grieving because we didn't make it to another year together. You are worth missing. Worth waiting for. Worth spending time with. Maybe this no contact was just life testing how long we could survive without each other, and what we'd become while apart. Funny how Instagram reels somehow understand situations better than we do. Never thought I'd be in a place where I'd copy reels and save them because they sound like us.`,
  },
  {
    id: 12, order_index: 12, photo_url: null,
    title: "New Year Without You & What We Were",
    content: `You know what hurts? We have too much connection to be just friends, too many problems to be a couple, and too many memories to let each other go. I hate how unfinished I feel about us. Maybe that's why we met so early. Maybe we were never meant to grow old together. Maybe we were just meant to be a beautiful beginning and not a lifelong story. Maybe we were a lesson, a memory, a "what if." But even then, I still hope when you hear certain songs… you think of me too.`,
  },
  {
    id: 13, order_index: 13, photo_url: null,
    title: "Falling in Love with Every Version of You",
    content: `I once saw something that said we fall in love with a person twice — first when it's easy, when it's their smile, their energy, their effortless version… and second when we see their fears, insecurities, moods, flaws, and the parts they hide from everyone else. The first kind of love just happens. The second is a choice. And I think I fell harder the second time. I fell for your fears, your insecurities… all of it.\n\nIf you can… please come back to me. And if you don't want to, that's okay too. I'll take it as a lesson. But just forgive me. I know I was wrong, and I admit it. Time made me learn what I couldn't understand back then. I hope you understand me… because you always did.`,
  },
  {
    id: 14, order_index: 14, photo_url: null,
    title: "Memories I Still Carry",
    content: `I still have our pictures. I don't look at them anymore, but whenever my eyes accidentally land on that album, it feels like something inside me cracks all over again. Because somewhere in my phone there's still a version of us that never fell apart… a version where you stayed, where I was enough. Sometimes I tell myself I'm over it, but the truth is your memory still lives in places inside me no one else can see.`,
  },
  {
    id: 15, order_index: 15, photo_url: null,
    title: "What I Still Wish for You",
    content: `Still… I hope you're safe. I hope you laugh freely. I hope someone protects your heart the way I wanted to… and honestly, I still hope that someone is me. And if not now, maybe in another lifetime… or maybe someday in the future… if we ever meet again, I hope we get more pages.`,
  },
  {
    id: 16, order_index: 16, photo_url: null,
    title: "The Biggest What If & My Final Words",
    content: `You were the best hello, the worst goodbye, and the biggest what if.\n\nAnother year has been added to your life… but not the version of you I knew. My only wish is that when you think of me, you feel happiness somewhere in it. I know you're hurt… but I am too. Can we start again? Because sometimes I really miss the old us.\n\nIf I ever get the chance to find someone again in this life, I think I'll still find you. Again and again. And I'll choose you every time. Somewhere deep down, I feel like maybe you feel some of this too.\n\nWe stopped talking long ago, but sometimes it still feels like you're here in the quiet moments. I wanted to text so many times. Just "hey" or "I hope you're okay"… but I couldn't. And I still wonder what we could've been if I had stayed.\n\nBy one act, I ruined everything. Not loudly. Not dramatically. Just one moment, one choice… and everything I loved slipped through my hands. What hurts most isn't just losing it. It's knowing how little it took to lose it. One second… and a lifetime of "what ifs" was born. I replay it so many times wishing I could go back, wishing I could stop that version of me before everything broke. Sometimes I wish life had a restart button.\n\nAnd maybe the truth is… what I really want is for us to try again. But I'm scared you'd hate me if I said that out loud.\n\nWho started no contact? Me.\nWho's continuing it? Me.\nWho's sad about it? Also me.\n\nAnd the worst part is… who do I run to when I'm the one who ruined everything?\n\nFor now maybe we focus on ourselves. Grow. Build good lives. And maybe one day, with enough time and patience… things change. Isn't that possible?\n\nAnd lastly… take your time coming back to me. I really mean that. If you ever truly want to come back, I promise I'll still be here. When you're ready… come find me.\n\nI swear this time, I'll do things right.`,
  },
];
