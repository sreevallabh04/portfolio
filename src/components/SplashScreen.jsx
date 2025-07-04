import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import introSoundPath from '@/assets/nouveau-jingle-netflix.mp3'; // Renamed import for clarity
import sreevallabhLogo from '@/assets/sreevallabhkakarala.png';

const SplashScreen = ({ onAudioEnd }) => {
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const timeoutRef = useRef(null);
  const transitionTriggeredRef = useRef(false);

  // Function to trigger the transition reliably
  const triggerTransition = () => {
    if (!transitionTriggeredRef.current) {
      transitionTriggeredRef.current = true;
      console.log('Transition triggered.');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout if transition is triggered by audio end
      }
      if (onAudioEnd) {
        onAudioEnd();
      }
    }
  };

  // Effect for Web Audio API setup and playback
  useEffect(() => {
    let localAudioContext; // Use local var for context within effect scope
    let localSourceNode; // Use local var for source node

    const setupAndPlayAudio = async () => {
      try {
        // Create AudioContext
        localAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = localAudioContext;

        // Immediately attempt to resume the context if it's suspended
        // This is crucial for autoplay attempts
        if (localAudioContext.state === 'suspended') {
          try {
            await localAudioContext.resume();
            console.log('AudioContext resumed successfully.');
          } catch (resumeError) {
            console.error('Failed to resume AudioContext:', resumeError);
            // If resume fails, autoplay is unlikely to work. Rely on fallback.
            // We could potentially show a 'click to play' button here.
          }
        }

        // Fetch the audio file data
        const response = await fetch(introSoundPath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        // Decode the audio data
        const audioBuffer = await localAudioContext.decodeAudioData(arrayBuffer);

        // Create a source node
        localSourceNode = localAudioContext.createBufferSource();
        sourceNodeRef.current = localSourceNode; // Store source node in ref for cleanup
        localSourceNode.buffer = audioBuffer;

        // Connect the source to the context's destination (speakers)
        localSourceNode.connect(localAudioContext.destination);

        // Set the onended event handler for the source node
        localSourceNode.onended = () => {
          console.log('Web Audio source finished playing.');
          triggerTransition();
        };

        // Attempt to start playback after a tiny delay, hoping it helps timing issues
        setTimeout(() => {
          // Ensure context is still valid and source node exists before starting
          if (localAudioContext && localAudioContext.state === 'running' && localSourceNode) {
            localSourceNode.start(0); // Start playing
            console.log('Web Audio playback initiated after short delay.');
          } else {
             console.warn('Audio context not running or source node invalid before delayed start.');
             // Rely on fallback timer
          }
        }, 50); // 50ms delay


      } catch (error) {
        console.error('Web Audio API setup/playback failed:', error);
        // Rely on fallback timer if Web Audio fails
      }
    };

    setupAndPlayAudio();

    // Set fallback timeout regardless of Web Audio success/failure
    timeoutRef.current = setTimeout(() => {
      console.log('Fallback timeout triggered transition.');
      triggerTransition();
    }, 5000); // 5 seconds fallback

    // Cleanup function
    return () => {
      // Stop the source node if it exists and is playing
      if (sourceNodeRef.current && sourceNodeRef.current.buffer) {
        try {
          sourceNodeRef.current.onended = null; // Remove listener
          sourceNodeRef.current.stop();
        } catch (e) {
          console.warn('Error stopping Web Audio source node:', e);
        }
      }
      // Close the AudioContext if it exists
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn('Error closing AudioContext:', e));
      }
      // Clear the fallback timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Run only once on mount (onAudioEnd shouldn't change)

  return (
    <motion.div
      initial={{ backgroundColor: '#000' }}
      animate={{ backgroundColor: '#000' }}
      exit={{ opacity: 0 }}
      className="flex h-screen w-screen items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="netflix-logo w-full flex flex-col items-center justify-center"
      >
        <img
          src={sreevallabhLogo}
          alt="Sreevallabh Kakarala Logo"
          className="mx-auto max-w-[90vw] md:max-w-[700px] mt-8"
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
