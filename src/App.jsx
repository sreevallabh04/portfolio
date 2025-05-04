
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import ProfileSelection from '@/components/ProfileSelection';
import Dashboard from '@/components/Dashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Function to be called when the splash screen audio ends
  const handleAudioEnd = () => {
    setShowSplash(false);
  };

  // No longer need the timer-based useEffect

  if (showSplash) {
    // Pass the handleAudioEnd function as a prop
    return <SplashScreen onAudioEnd={handleAudioEnd} />;
  }

  return (
    <Router>
      <AnimatePresence mode="wait">
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
            element={<Dashboard />} 
          />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Router>
  );
}

export default App;
