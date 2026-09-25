import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SplashScreen from '@/components/SplashScreen';
import ProfileSelection from '@/components/ProfileSelection';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import IntroGate from '@/components/IntroGate';
import { Toaster } from '@/components/ui/toaster';
import SEO from '@/components/SEO';

// Lazy load components for better performance
const Dashboard = lazy(() => import('@/components/Dashboard'));
const SkillsPage = lazy(() => import('@/components/SkillsPage'));
const ContactPage = lazy(() => import('@/components/ContactPage'));
const StalkerPage = lazy(() => import('@/components/StalkerPage'));
const RecruiterProjectsPage = lazy(() => import('@/components/RecruiterProjectsPage'));
const DeveloperPage = lazy(() => import('@/components/DeveloperPage'));
const FitnessPage = lazy(() => import('@/pages/FitnessPage'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Terms = lazy(() => import('@/pages/Terms'));
const Admin = lazy(() => import('@/pages/Admin'));
// Lazy too: its tree pulls in @supabase/supabase-js, @emailjs/browser and the
// knowledge base, which as a static import sat in the eager entry bundle on
// every route — including the ones that deliberately never render it.
const FloatingChatbot = lazy(() => import('@/components/FloatingChatbot'));

const PROFILE_KEY = 'selectedProfile';
const ENTERED_KEY = 'hasEntered';
const VALID_PROFILES = ['recruiter', 'developer', 'stalker', 'fitness'];

// localStorage throws in private-mode Safari and when cookies are blocked.
const safeStorage = {
  get(storage, key) {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  },
  set(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch {
      /* storage unavailable - fall back to in-memory state only */
    }
  },
};

const profileFromPath = (pathname) => {
  const match = pathname.match(/^\/browse\/([A-Za-z]+)/);
  const candidate = match ? match[1].toLowerCase() : null;
  return VALID_PROFILES.includes(candidate) ? candidate : null;
};

// Branded loading state for lazy route chunks.
const LoadingSpinner = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black">
    <div className="relative h-16 w-16">
      <div className="absolute inset-0 rounded-full border-2 border-red-600/20" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-red-600" />
    </div>
    <p className="netflix-font text-sm tracking-[0.4em] text-white/50">LOADING</p>
  </div>
);

// 404 Page component
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <p className="netflix-font text-[22vw] leading-none text-red-600/20 sm:text-[12rem]">404</p>
      <h1 className="-mt-6 text-2xl font-bold sm:text-4xl">Lost your way?</h1>
      <p className="mt-3 max-w-md text-sm text-white/60 sm:text-base">
        This page isn&apos;t in the catalogue. It may have been moved, or the link
        might be a typo.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-md bg-red-600 px-6 py-3 font-semibold transition-colors hover:bg-red-700"
        >
          Browse profiles
        </button>
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-white/30 bg-white/10 px-6 py-3 font-semibold transition-colors hover:bg-white/20"
        >
          Go back
        </button>
      </div>
    </div>
  );
};

// Gate the profile-scoped routes. `profile` is resolved synchronously by the
// caller (URL first, then the remembered choice) so a direct link or a refresh
// no longer bounces to the profile picker before an effect has had a chance to
// populate the state.
const ProtectedRoute = ({ children, profile }) => {
  if (!profile) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Component to conditionally show chatbot
const ConditionalChatbot = () => {
  const location = useLocation();

  const hiddenOn = [
    (p) => p === '/',
    (p) => p.startsWith('/browse/recruiter'),
    (p) => p.startsWith('/browse/developer'),
    (p) => p.startsWith('/browse/fitness'),
    (p) => p.startsWith('/admin'),
  ];

  if (hiddenOn.some((test) => test(location.pathname))) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <FloatingChatbot />
    </Suspense>
  );
};

// Reset scroll on navigation. Without this, moving between routes keeps the
// previous scroll offset and lands the visitor mid-page.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Routes that render their own <SEO> with richer, page-specific metadata. The
// app-level tag is skipped for these, otherwise two components emit competing
// <link rel="canonical"> and og: tags for the same page.
const SELF_MANAGED_SEO = [/^\/skills/, /^\/browse\/recruiter\/projects/, /^\/blog/];

const hasOwnSEO = (pathname) => SELF_MANAGED_SEO.some((pattern) => pattern.test(pathname));

// SEO configurations for different routes. Paths are relative here; <SEO>
// resolves them against SITE_URL (see src/lib/site.js), which is the single
// place the domain is defined.
const getSEOConfig = (pathname) => {
  const baseConfig = {
    title: 'Sreevallabh Kakarala',
    description:
      'AI Engineer building RAG systems, time-series forecasting models and LLM agents. Explore my portfolio, published research and professional experience.',
    type: 'website',
    image: '/HopeCore.png',
    url: pathname,
  };

  switch (true) {
    case pathname === '/':
      return {
        ...baseConfig,
        url: '/',
        title: 'Choose Your Experience',
        description:
          "Select your profile to explore Sreevallabh Kakarala's portfolio in different ways - Recruiter, Developer, Stalker, or Fitness.",
      };
    case pathname.startsWith('/browse/recruiter'):
      return {
        ...baseConfig,
        title: 'Professional Portfolio',
        description:
          'Applied AI experience, published research and projects: RAG pipelines, time-series forecasting, LLM agents and computer vision.',
        type: 'profile',
      };
    case pathname.startsWith('/browse/developer'):
      return {
        ...baseConfig,
        title: 'PR Quest',
        description:
          'A playable gym RPG built from real Hevy training logs: walk the gym floor, pick a machine, and try to beat the personal record stored on it.',
        type: 'profile',
      };
    case pathname.startsWith('/skills'):
      return {
        ...baseConfig,
        title: 'Technical Skills',
        description:
          'Comprehensive overview of my technical skills including programming languages, frameworks, and tools.',
        type: 'profile',
      };
    case pathname.startsWith('/browse/fitness'):
      return {
        ...baseConfig,
        title: '75 Hard',
        description:
          'A seven-day Push/Pull/Legs and Upper/Lower hybrid run as a cut: two sessions daily, 2,250 kcal, 175 g protein, tracked lifts holding while the scale drops.',
        type: 'website',
      };
    case pathname.startsWith('/contact'):
      return {
        ...baseConfig,
        title: 'Contact',
        description:
          'Get in touch with Sreevallabh Kakarala for professional opportunities, collaborations, or inquiries.',
        type: 'profile',
      };
    default:
      return baseConfig;
  }
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // The intro plays once per browser session. Refreshing a deep link inside the
  // same session goes straight back to the page instead of replaying it.
  const [hasEntered, setHasEntered] = useState(
    () => safeStorage.get(sessionStorage, ENTERED_KEY) === 'true'
  );
  const [showSplash, setShowSplash] = useState(false);

  // Remembered profile, used when the URL itself carries no profile (/skills,
  // /contact). Resolved synchronously so ProtectedRoute never sees a stale null.
  const [storedProfile, setStoredProfile] = useState(() => {
    const value = safeStorage.get(localStorage, PROFILE_KEY);
    return VALID_PROFILES.includes(value) ? value : null;
  });

  const urlProfile = profileFromPath(location.pathname);
  const activeProfile = urlProfile || storedProfile;
  const audioContextResumed = useRef(false);
  const seoConfig = getSEOConfig(location.pathname);

  // Persist whichever profile the URL is currently showing.
  useEffect(() => {
    if (urlProfile && urlProfile !== storedProfile) {
      setStoredProfile(urlProfile);
      safeStorage.set(localStorage, PROFILE_KEY, urlProfile);
    }
  }, [urlProfile, storedProfile]);

  const handleEnter = useCallback(async () => {
    // Unlock audio playback while we still hold the user gesture, so the splash
    // jingle is allowed to start.
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextCtor) {
        const context = new AudioContextCtor();
        if (context.state === 'suspended') {
          await context.resume();
        }
        await context.close();
        audioContextResumed.current = true;
      }
    } catch {
      audioContextResumed.current = false;
    }

    safeStorage.set(sessionStorage, ENTERED_KEY, 'true');
    setHasEntered(true);
    setShowSplash(true);
  }, []);

  const handleAudioEnd = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleProfileSelect = useCallback(
    (profileId) => {
      setStoredProfile(profileId);
      safeStorage.set(localStorage, PROFILE_KEY, profileId);
      navigate(`/browse/${profileId}`);
    },
    [navigate]
  );

  if (!hasEntered) {
    return <IntroGate onEnter={handleEnter} />;
  }

  if (showSplash) {
    return <SplashScreen onAudioEnd={handleAudioEnd} />;
  }

  // The navbar links to profile-scoped pages, so it is noise on the picker, and
  // the admin console is its own full-screen layout.
  // The developer page is a full-screen game with its own menu and exit.
  const hideNavbar =
    location.pathname === '/' ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/browse/developer');

  return (
    <>
      {!hasOwnSEO(location.pathname) && <SEO {...seoConfig} />}
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<ProfileSelection onProfileSelect={handleProfileSelect} />} />
            <Route
              path="/browse/:profile"
              element={
                <ProtectedRoute profile={activeProfile}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute profile={activeProfile}>
                  <SkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute profile={activeProfile}>
                  <ContactPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/stalker"
              element={
                <ProtectedRoute profile={activeProfile}>
                  <StalkerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/recruiter/projects"
              element={
                <ProtectedRoute profile={activeProfile}>
                  <RecruiterProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/developer"
              element={
                <ProtectedRoute profile={activeProfile}>
                  <DeveloperPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/fitness"
              element={
                <ProtectedRoute profile={activeProfile}>
                  <FitnessPage />
                </ProtectedRoute>
              }
            />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <ConditionalChatbot />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
