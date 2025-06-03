
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'; // Import useParams
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import ProfileSelection from '@/components/ProfileSelection';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar'; // Import Navbar
import SkillsPage from '@/components/SkillsPage'; // Import SkillsPage
// Removed RecruiterProfilePage import
import { Toaster } from '@/components/ui/toaster';

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


function App() {
  const [hasEntered, setHasEntered] = useState(false); // Controls if user has clicked "Enter"
  const [showSplash, setShowSplash] = useState(false); // Controls splash visibility *after* entering
  const [selectedProfile, setSelectedProfile] = useState(null);
  const audioContextResumed = useRef(false); // Track if context was successfully resumed

  // Function to handle the initial "Enter" click
  const handleEnter = async () => {
    // Attempt to create/resume AudioContext on first interaction
    // This is the key step to enable audio playback later
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') {
        await context.resume();
        console.log('AudioContext resumed successfully on enter.');
      }
      // Close the context immediately if we only need it to unlock autoplay
      // Or keep it if SplashScreen needs it (current SplashScreen creates its own)
      await context.close();
      audioContextResumed.current = true; // Mark as resumed
    } catch (e) {
      console.error('Failed to resume AudioContext on enter:', e);
      // Proceed anyway, playback might still work or fallback timer will trigger transition
      audioContextResumed.current = false;
    }

    setHasEntered(true); // User has entered
    setShowSplash(true); // Now show the splash screen
  };


  // Function to be called when the splash screen audio ends (or times out)
  const handleAudioEnd = () => {
    setShowSplash(false); // Hide splash screen to show profile selection/dashboard
  };

  // Render "Click to Enter" button if the user hasn't entered yet
  if (!hasEntered) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'black' }}>
        <EnterButton onClick={handleEnter} />
      </div>
    );
  }

  // Render SplashScreen if user has entered and splash is active
  if (showSplash) {
    // Pass the handleAudioEnd function as a prop
    // SplashScreen will attempt playback, hopefully succeeding now
    return <SplashScreen onAudioEnd={handleAudioEnd} />;
  }

  // --- Rest of the application logic (Router, Profile Selection, Dashboard) ---

  return (
    <Router>
      <Navbar /> {/* Add Navbar here */}
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
            element={<Dashboard />} // Render Dashboard directly
          />
          <Route path="/skills" element={<SkillsPage />} /> {/* Add SkillsPage route */}
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Router>
  );
}

// Removed ProfileSpecificDashboard wrapper component

export default App;
