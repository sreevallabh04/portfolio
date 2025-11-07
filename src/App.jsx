import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import SplashScreen from '@/components/SplashScreen';
import ProfileSelection from '@/components/ProfileSelection';
import Navbar from '@/components/Navbar';
import FloatingChatbot from '@/components/FloatingChatbot';
import { Toaster } from '@/components/ui/toaster';
import SEO from '@/components/SEO';

// Lazy load components for better performance
const Dashboard = lazy(() => import('@/components/Dashboard'));
const SkillsPage = lazy(() => import('@/components/SkillsPage'));
const ContactPage = lazy(() => import('@/components/ContactPage'));
const StalkerPage = lazy(() => import('@/components/StalkerPage'));
const RecruiterProjectsPage = lazy(() => import('@/components/RecruiterProjectsPage'));
const DeveloperPage = lazy(() => import('@/components/DeveloperPage'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Terms = lazy(() => import('@/pages/Terms'));

// Loading component for route transitions
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

// 404 Page component
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
    <h1 className="text-6xl font-bold mb-4">404</h1>
    <p className="text-xl mb-8">Page not found</p>
    <button
      onClick={() => window.history.back()}
      className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Go Back
    </button>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, profile }) => {
  if (!profile) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Simple Button component for styling consistency (optional)
const EnterButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '15px 30px',
      fontSize: '1.2rem',
      cursor: 'pointer',
      backgroundColor: '#e50914', // Netflix red
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      fontWeight: 'bold',
    }}
  >
    Click to Enter
  </button>
);

// Component to conditionally show chatbot
const ConditionalChatbot = () => {
  const location = useLocation();
  
  // Don't show chatbot on recruiter pages OR profile selection page
  const isRecruiterPage = location.pathname.includes('/browse/recruiter');
  const isProfileSelectionPage = location.pathname === '/';
  
  if (isRecruiterPage || isProfileSelectionPage) {
    return null;
  }
  
  return <FloatingChatbot />;
};

// SEO configurations for different routes
const getSEOConfig = (pathname, profile) => {
  const baseConfig = {
    title: "Sreevallabh Kakarala",
    description: "Software Engineering student specializing in full-stack development and AI/ML solutions. Explore my portfolio, projects, and professional experience.",
    type: "website",
    image: "/HopeCore.png",
    url: `https://streamvallabh.life${pathname}`
  };

  switch (true) {
    case pathname === '/':
      return {
        ...baseConfig,
        title: "Choose Your Experience",
        description: "Select your profile to explore Sreevallabh Kakarala's portfolio in different ways - Developer, Recruiter, or Blog perspective."
      };
    case pathname.includes('/browse/recruiter'):
      return {
        ...baseConfig,
        title: "Professional Portfolio",
        description: "Explore my professional experience, projects, and technical skills. View my work in web development, AI/ML, and software engineering.",
        type: "profile"
      };
    case pathname.includes('/browse/developer'):
      return {
        ...baseConfig,
        title: "Developer Portfolio",
        description: "Technical deep-dive into my development projects, coding skills, and software engineering expertise.",
        type: "profile"
      };
    case pathname.includes('/skills'):
      return {
        ...baseConfig,
        title: "Technical Skills",
        description: "Comprehensive overview of my technical skills including programming languages, frameworks, and tools.",
        type: "profile"
      };
    case pathname.includes('/browse/blog'):
      return {
        ...baseConfig,
        title: "Blog",
        description: "Stories and learnings from building products, exploring AI, and shipping experiences.",
        type: "article"
      };
    case pathname.includes('/browse/blog/'):
      return {
        ...baseConfig,
        title: "Blog Post",
        description: "Read the latest article from Sreevallabh.",
        type: "article"
      };
    case pathname.includes('/contact'):
      return {
        ...baseConfig,
        title: "Contact",
        description: "Get in touch with Sreevallabh Kakarala for professional opportunities, collaborations, or inquiries.",
        type: "profile"
      };
    default:
      return baseConfig;
  }
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasEntered, setHasEntered] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const audioContextResumed = useRef(false);
  const seoConfig = getSEOConfig(location.pathname, selectedProfile);

  // Helper: get profile from URL
  const getProfileFromPath = () => {
    const match = location.pathname.match(/^\/browse\/(\w+)/);
    return match ? match[1] : null;
  };

  // On mount: restore profile from URL or localStorage
  useEffect(() => {
    const urlProfile = getProfileFromPath();
    const storedProfile = localStorage.getItem('selectedProfile');
    if (urlProfile) {
      setSelectedProfile(urlProfile);
      localStorage.setItem('selectedProfile', urlProfile);
    }
    // Don't auto-restore stored profile - let user choose on root path
  }, [location.pathname]);

  // Save selectedProfile to localStorage when it changes
  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem('selectedProfile', selectedProfile);
    }
  }, [selectedProfile]);

  // Function to handle the initial "Enter" click
  const handleEnter = async () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') {
        await context.resume();
        console.log('AudioContext resumed successfully on enter.');
      }
      await context.close();
      audioContextResumed.current = true;
    } catch (e) {
      console.error('Failed to resume AudioContext on enter:', e);
      audioContextResumed.current = false;
    }

    setHasEntered(true);
    setShowSplash(true);
  };

  // Function to be called when the splash screen audio ends (or times out)
  const handleAudioEnd = () => {
    setShowSplash(false);
  };

  // Function to handle profile selection
  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId);
    navigate(`/browse/${profileId}`);
  };

  if (!hasEntered) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'black' }}>
        <EnterButton onClick={handleEnter} />
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen onAudioEnd={handleAudioEnd} />;
  }

  return (
    <>
      <SEO {...seoConfig} />
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProfileSelection onProfileSelect={handleProfileSelect} />
              }
            />
            <Route
              path="/browse/:profile"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <SkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <ContactPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/stalker"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <StalkerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/recruiter/projects"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <RecruiterProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/developer"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <DeveloperPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/blog"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <Blog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/blog/:slug"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <BlogPost />
                </ProtectedRoute>
              }
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <ConditionalChatbot />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
