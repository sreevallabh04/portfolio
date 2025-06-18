import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import ProfileSelection from '@/components/ProfileSelection';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';

// Lazy load components for better performance
const Dashboard = lazy(() => import('@/components/Dashboard'));
const SkillsPage = lazy(() => import('@/components/SkillsPage'));
const ContactPage = lazy(() => import('@/components/ContactPage'));
const StalkerPage = lazy(() => import('@/components/StalkerPage'));
const RecruiterProjectsPage = lazy(() => import('@/components/RecruiterProjectsPage'));
const DeveloperPage = lazy(() => import('@/components/DeveloperPage'));
const Client = lazy(() => import('@/pages/Client'));
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

function AppContent() {
  const [hasEntered, setHasEntered] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const audioContextResumed = useRef(false);

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
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route
              path="/"
              element={
                !selectedProfile ? (
                  <ProfileSelection onProfileSelect={setSelectedProfile} />
                ) : (
                  <Navigate to={`/browse/${selectedProfile}`} replace />
                )
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
              path="/browse/client"
              element={
                <ProtectedRoute profile={selectedProfile}>
                  <Client />
                </ProtectedRoute>
              }
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
