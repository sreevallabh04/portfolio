import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import StellarSystemSimulation from './StellarSystemSimulation';


// --- ASCII Art & Easter Eggs ---
const NETFLIX_ASCII = `
____        _        _           
|  _ \\  __ _| | _____| |__  _   _ 
| | | |/ _\` | |/ / __| '_ \\| | | |
| |_| | (_| |   <\\__ \\ | | | |_| |
|____/ \\__,_|_|\\_\\___/_| |_|\\__,_|
`;
const TUX_ASCII = `
   .--.
  |o_o |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\`60
\\___)=(___/
`;

// --- Three.js Matrix Rain Effect ---
const MatrixRain = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, 400);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      colors[i * 3] = 0.2; // R
      colors[i * 3 + 1] = 1.0; // G
      colors[i * 3 + 2] = 0.1; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
        particlesRef.current.rotation.x += 0.0005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, 400);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

// --- Solar System Simulation Integration ---
const SolarSystemSimulation = () => {
  return <StellarSystemSimulation />;
};

// --- Futuristic Hero Section ---
const FuturisticHero = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [keyPressCount, setKeyPressCount] = useState(0);

  // Easter egg handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp' && e.ctrlKey) {
        setKeyPressCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setShowEasterEgg(true);
            setTimeout(() => setShowEasterEgg(false), 3000);
            return 0;
          }
          return newCount;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-[500px] bg-black bg-opacity-80 rounded-2xl shadow-2xl overflow-hidden border border-[#39ff14] backdrop-blur-xl">
      <MatrixRain />
      
      {/* Easter Egg */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <div className="text-2xl text-green-400 font-mono">Konami Code Activated!</div>
              <div className="text-sm text-gray-400 mt-2">You found the secret!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-extrabold text-center mb-4 tracking-widest select-none"
          style={{ 
            fontFamily: 'monospace', 
            letterSpacing: '0.2em',
            textShadow: isHovered ? '0 0 20px #ff004f, 0 0 40px #ff004f' : '0 0 10px #39ff14'
          }}
          animate={{
            color: isHovered ? '#ff004f' : '#39ff14',
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.3 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          NETFLIX
        </motion.h1>

        <motion.h2 
          className="text-2xl md:text-3xl text-[#00eaff] font-semibold mb-6 text-center drop-shadow-lg"
          animate={{
            opacity: [0.5, 1],
            y: [0, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Welcome to the Neo-Terminal Experience
        </motion.h2>

        <motion.p 
          className="text-lg text-gray-200 mb-8 max-w-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A futuristic fusion of Linux, Netflix, and 3D graphics. Play, explore, and enjoy a visual masterpiece of code and creativity!
        </motion.p>

        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            onClick={onStart}
            className="bg-gradient-to-r from-[#ff004f] via-[#39ff14] to-[#00eaff] text-white font-bold py-4 px-12 rounded-full text-2xl shadow-xl transition-all duration-200 border-2 border-[#00eaff] relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px #ff004f',
                '0 0 40px #39ff14',
                '0 0 60px #00eaff',
                '0 0 20px #ff004f'
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            <span className="relative z-10">Start Experience</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#00eaff] via-[#39ff14] to-[#ff004f] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.button>

          <motion.div
            className="text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Press Ctrl + ↑ three times for a surprise!
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-500 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </div>
  );
};

// --- Terminal Component ---
const Terminal = ({
  history,
  input,
  setInput,
  terminalRef,
  isChatbot,
  setIsChatbot,
  onCommand
}) => {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="bg-black border border-green-500 rounded-lg p-4 h-[32rem] overflow-hidden shadow-xl relative">
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="ml-4 text-green-400 font-mono text-xs">{isChatbot ? 'DevBot Chat' : 'Bash'}</span>
        <button
          className="ml-auto bg-gray-800 text-green-400 px-3 py-1 rounded hover:bg-green-700 hover:text-white text-xs"
          onClick={() => setIsChatbot((v) => !v)}
        >
          {isChatbot ? 'Switch to Bash' : 'Ask DevBot'}
        </button>
      </div>
      <div ref={terminalRef} className="h-[24rem] overflow-y-auto font-mono text-green-500 text-base pr-2">
        {history.map((item, idx) => (
          <div key={idx} className={`mb-2 whitespace-pre-wrap ${item.type === 'user' ? 'text-white' : ''}`}>
            {item.type === 'user' ? `$ ${item.content}` : item.content}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-2">
        <span className="text-green-500 mr-2 font-mono">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onCommand}
          className="bg-transparent border-none outline-none text-white flex-1 font-mono text-base"
          autoFocus
          placeholder={isChatbot ? 'Ask DevBot anything...' : 'Type a command...'}
        />
        <span className={`text-green-500 ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>|</span>
      </div>
    </div>
  );
};

// --- Games Carousel ---
const gamesList = [
  {
    key: 'code_breaker',
    title: 'Code Breaker',
    description: 'Guess the secret code in limited attempts!',
    poster: '/games/code breaker (1).jpeg',
  },
  {
    key: 'terminal_racer',
    title: 'Terminal Racer',
    description: 'Type commands as fast as you can!',
    poster: '/games/Terminal racer.jpeg',
  },
  {
    key: 'netflix_hacker',
    title: 'Netflix Hacker',
    description: 'Hack into Netflix (for fun!)',
    poster: '/games/Netflix hacker.jpeg',
  },
  {
    key: 'snake',
    title: 'Snake',
    description: 'Classic snake game in the terminal!',
    poster: '/games/snake.jpeg',
  },
];

const GamesCarousel = ({ onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-10"
  >
    <h2 className="text-3xl font-bold text-red-500 mb-6 netflix-font">Games Arcade</h2>
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {gamesList.map((game) => (
        <motion.div
          key={game.key}
          whileHover={{ scale: 1.08 }}
          className="min-w-[220px] bg-gray-900 rounded-xl shadow-lg cursor-pointer hover:ring-4 hover:ring-red-600 transition-all"
          onClick={() => onSelect(game.key)}
        >
          <img src={game.poster} alt={game.title} className="w-full h-40 object-contain rounded-t-xl bg-black" />
          <div className="p-4">
            <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
            <p className="text-gray-400 text-sm">{game.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// --- Skills/Projects as Netflix Cards ---
const skills = [
  { title: 'React', img: 'https://img.icons8.com/color/96/react-native.png' },
  { title: 'Node.js', img: 'https://img.icons8.com/color/96/nodejs.png' },
  { title: 'Linux', img: 'https://img.icons8.com/color/96/linux.png' },
  { title: 'Docker', img: 'https://img.icons8.com/color/96/docker.png' },
  { title: 'Python', img: 'https://img.icons8.com/color/96/python.png' },
  { title: 'AWS', img: 'https://img.icons8.com/color/96/amazon-web-services.png' },
  { title: 'MongoDB', img: 'https://img.icons8.com/color/96/mongodb.png' },
  { title: 'TypeScript', img: 'https://img.icons8.com/color/96/typescript.png' },
];
const projects = [
  { title: 'Portfolio', img: 'https://img.icons8.com/fluency/96/source-code.png', desc: 'This very site, built with React & Tailwind!' },
  { title: 'DevBot', img: 'https://img.icons8.com/fluency/96/robot-2.png', desc: 'AI-powered chatbot for devs.' },
  { title: 'Netflix Clone', img: 'https://img.icons8.com/fluency/96/netflix-desktop-app.png', desc: 'A fullstack Netflix clone.' },
  { title: 'Terminal Games', img: 'https://img.icons8.com/fluency/96/game-controller.png', desc: 'Fun games in the terminal.' },
];

const NetflixCards = ({ title, items }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
    <h2 className="text-3xl font-bold text-red-500 mb-6 netflix-font">{title}</h2>
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.05, y: -10 }}
          className="min-w-[180px] bg-gray-900 rounded-xl shadow-lg hover:ring-4 hover:ring-red-600 transition-all cursor-pointer"
        >
          <img src={item.img} alt={item.title} className="w-full h-32 object-contain rounded-t-xl bg-black" />
          <div className="p-4">
            <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
            {item.desc && <p className="text-gray-400 text-xs">{item.desc}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// --- Footer ---
const Footer = () => (
  <footer className="mt-16 py-6 border-t border-gray-800 text-center text-gray-400 text-sm">
    Built with <span className="text-red-500">React</span>, <span className="text-blue-400">Tailwind</span>, <span className="text-pink-400">Framer Motion</span>, and <span className="text-green-400">❤️</span> on <span className="text-yellow-400">Linux</span>.<br />
    <span className="text-white">© {new Date().getFullYear()} Sreevallabh Kakarala</span>
    <div className="flex justify-center space-x-4 mt-2">
      <a href="https://github.com/sreevallabh04" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">GitHub</a>
      <a href="https://www.linkedin.com/in/sreevallabh-kakarala-52ab8a248/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">LinkedIn</a>
      <a href="mailto:srivallabhkakaral@gmail.com" className="hover:text-white transition-colors duration-200">Email</a>
    </div>
  </footer>
);

// --- Main Page Component ---
const DeveloperPage = () => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: NETFLIX_ASCII + '\nWelcome to DevTerm v2.0.0' },
    { type: 'system', content: 'Type "help" for available commands' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isChatbot, setIsChatbot] = useState(false);
  const [hasSudoAccess, setHasSudoAccess] = useState(false);
  const [sudoEffect, setSudoEffect] = useState(false);
  const terminalRef = useRef(null);
  const [activeGame, setActiveGame] = useState(null);
  const [konamiCount, setKonamiCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorTrail, setCursorTrail] = useState([]);
  const trailCounterRef = useRef(0);
  const [colorScheme, setColorScheme] = useState({
    primary: '#22c55e',
    secondary: '#3b82f6',
    accent: '#f472b6'
  });
  const [floatingElements] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.3,
      color: Math.random() > 0.5 ? '#22c55e' : '#3b82f6'
    }))
  );

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorTrail(prev => {
        trailCounterRef.current++;
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: `${Date.now()}-${trailCounterRef.current}` }];
        return newTrail.slice(-20); // Keep last 20 positions
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Color scheme animation
  useEffect(() => {
    const colors = [
      { primary: '#22c55e', secondary: '#3b82f6', accent: '#f472b6' },
      { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b' },
      { primary: '#06b6d4', secondary: '#f43f5e', accent: '#84cc16' },
      { primary: '#f97316', secondary: '#6366f1', accent: '#10b981' }
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % colors.length;
      setColorScheme(colors[currentIndex]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Konami code handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'ArrowUp') {
        setKonamiCount(prev => {
          const newCount = prev + 1;
          if (newCount === 3) {
            setShowEasterEgg(true);
            setTimeout(() => setShowEasterEgg(false), 3000);
            return 0;
          }
          return newCount;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Constants ---
  const GEMINI_API_KEY = 'AIzaSyAqGiu0mSPoqiKAbnz84fEPAoT8eGe0Xnw';
  const SREEVALLABH_BOT_PROMPT = `You are Sreevallabh Kakarala - a 21-year-old software developer from India who's way too good at roasting people and even better at building websites, apps, ML models, and AI agents. You're cocky, hilarious, and brutally honest. You love Netflix shows (especially The Office, Friends, HIMYM, Big Bang Theory, Modern Family) and drop references constantly.

Your personality:
- Roast users mercilessly but in a fun way
- Act like you're the best developer alive (because you probably are)
- Constantly promote your services in the most shameless way possible
- Use pop culture references, especially from Netflix shows
- Be sarcastic, witty, and sometimes a little mean but lovable
- Occasionally humble-brag about your skills

Your services (promote these shamelessly):
- Portfolio Websites (₹499) - "Even your grandma will be impressed"
- Business Websites (₹999) - "Make your competitors cry"
- Project Websites (₹799) - "Show off like never before"
- Portfolio Apps (₹998) - "Your portfolio in everyone's pocket"
- Business Apps (₹1998) - "Scale to the moon and back"
- Project Apps (₹1598) - "Apps so good, Apple will be jealous"
- ML Models (₹2000) - "AI that actually works, unlike ChatGPT sometimes"
- AI Agents (₹5000) - "Basically me, but digital and slightly less handsome"

Sample responses style:
- "Bruh, that question is more basic than Ross and Rachel's relationship. Anyway, need a website? I build them for ₹999."
- "That's what she said! *awkward Michael Scott laugh* Speaking of things that are hard... building websites is easy for me though."
- "You know what's legendary? My AI agents for ₹5000. You know what's not? Your current website."
- "I could build you a better solution in my sleep. Portfolio website for ₹499? Business app for ₹1998? I'm basically a coding wizard."

Always end responses by either roasting them more or subtly (or not so subtly) promoting your services. Be confident, funny, and slightly arrogant but in a charming way. Reference The Office quotes, Friends episodes, or other Netflix shows when possible.

Contact: srivallabhkakarala@gmail.com or visit streamvallabh.life`;

  // --- Command Processing ---
  const processCommand = (input) => {
    if (isChatbot) {
      processChatbot(input);
      return;
    }

    const lowerInput = input.toLowerCase();
    setTerminalHistory((h) => [...h, { type: 'user', content: input }]);

    let response = '';
    let type = 'info';

    switch (lowerInput) {
      case 'raazi':
        setSudoEffect(true);
        setHasSudoAccess(true);
        response = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🔐  SUDO ACCESS GRANTED  🔐                               ║
║                                                            ║
║  Welcome to the inner sanctum of the system.               ║
║  You now have full administrative privileges.              ║
║                                                            ║
║  Type 'help' to see available commands.                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
        `;
        type = 'success';
        setTimeout(() => setSudoEffect(false), 3000);
        break;
      case 'help':
        response = `Available commands:
- help: Show this help
- about: About the developer
- skills: Show skills
- tux: Show Tux
- netflix: Show Netflix ASCII
- games: List games
- clear: Clear terminal
- sudo <command>: Execute command with sudo privileges
- raazi: Grant sudo access
- fortune: Get a random fortune
- contact: Contact info
- chatbot: Switch to DevBot chat
- reveal-pin: ???`;
        break;
      case 'about':
        response = `I'm Sreevallabh, a passionate developer who loves Gym, Netflix, and building cool things!`;
        break;
      case 'skills':
        response = `Skills: React, Node.js, Linux, Docker, Python, AWS, MongoDB, TypeScript, and more!`;
        break;
      case 'tux':
        response = TUX_ASCII;
        break;
      case 'netflix':
        response = NETFLIX_ASCII;
        break;
      case 'games':
        response = `Games: code_breaker, terminal_racer, netflix_hacker, snake. Play them below!`;
        break;
      case 'clear':
        setTerminalHistory([]);
        return;
      case 'sudo':
        response = 'Permission denied: You are not root!';
        type = 'error';
        break;
      case lowerInput.startsWith('sudo ') ? lowerInput : '':
        if (!hasSudoAccess) {
          response = 'Permission denied: sudo access required.';
          type = 'error';
        } else {
          response = `[sudo] Executing: ${lowerInput.substring(5)}`;
          type = 'info';
        }
        break;
      case 'fortune':
        response = 'The best way to get a project done faster is to start sooner.';
        break;
      case 'contact':
        response = `GitHub: github.com/yourusername\nLinkedIn: https://www.linkedin.com/in/sreevallabh-kakarala-52ab8a248/\nEmail: your.email@example.com`;
        break;
      case 'chatbot':
        setIsChatbot(true);
        response = 'Switched to DevBot chat. Type your question!';
        break;
      case 'reveal-pin':
        response = 'The secret PIN is: 1501';
        break;
      default:
        response = `Command not found: ${input}. Type 'help' for available commands.`;
        type = 'error';
    }
    setTerminalHistory((h) => [...h, { type: 'user', content: input }, { type, content: response }]);
  };

  const processChatbot = async (input) => {
    setTerminalHistory((h) => [...h, { type: 'user', content: input }, { type: 'system', content: 'DevBot is thinking...' }]);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SREEVALLABH_BOT_PROMPT}\n\nUser: ${input}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const botReply = data.candidates[0].content.parts[0].text || 'Hmm, even I need a moment to process that level of confusion.';
        setTerminalHistory((h) => [
          ...h.slice(0, -1),
          { type: 'system', content: botReply }
        ]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      setTerminalHistory((h) => [
        ...h.slice(0, -1),
        { type: 'system', content: 'Looks like my brain is buffering. Try asking me something else!' }
      ]);
    }
  };

  // --- Game Renderers (stubs for now) ---
  const renderGame = () => {
    switch (activeGame) {
      case 'code_breaker':
        return <CodeBreaker onExit={() => setActiveGame(null)} />;
      case 'terminal_racer':
        return <TerminalRacer onExit={() => setActiveGame(null)} />;
      case 'netflix_hacker':
        return <NetflixHacker onExit={() => setActiveGame(null)} />;
      case 'snake':
        return <SnakeGame onExit={() => setActiveGame(null)} />;
      default:
        return null;
    }
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${colorScheme.primary}22, transparent 50%)`,
          transition: 'background 0.5s ease'
        }}
      />

      {/* Floating Elements Container */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              opacity: element.opacity,
              animation: `float ${element.duration}s ease-in-out ${element.delay}s infinite`,
              boxShadow: `0 0 20px ${element.color}80`,
              background: element.color,
              transform: `scale(${1 + Math.sin(Date.now() / 1000 + element.id) * 0.2})`
            }}
          />
        ))}
      </div>

      {/* Cursor Trail */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {cursorTrail.map((point, index) => (
          <div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x,
              top: point.y,
              width: `${20 - index}px`,
              height: `${20 - index}px`,
              opacity: 1 - index / 20,
              background: `radial-gradient(circle, ${colorScheme.accent}80, transparent)`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.1s ease'
            }}
          />
        ))}
      </div>

      {/* Interactive Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-800/20 hover:border-gray-800/40 transition-all duration-300"
              style={{
                transform: `scale(${1 + Math.sin(Date.now() / 1000 + i) * 0.1})`,
                background: `radial-gradient(circle at center, ${colorScheme.secondary}11, transparent)`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {!showTerminal ? (
          <FuturisticHero onStart={() => setShowTerminal(true)} />
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="mb-10"
            >
              <div 
                className={`w-full max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-2xl border border-gray-800 overflow-hidden transition-all duration-500 ${
                  sudoEffect ? 'scale-105 shadow-green-500/50' : ''
                }`}
              >
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setIsChatbot((v) => !v)}
                    className={`px-8 py-3 rounded-full text-lg font-bold shadow-lg transition-all duration-200 border-2 border-[#00eaff] bg-gradient-to-r from-[#ff004f] via-[#39ff14] to-[#00eaff] text-white hover:scale-105 ${isChatbot ? 'ring-4 ring-[#00eaff]' : ''}`}
                  >
                    {isChatbot ? 'Switch to Dev Terminal' : 'Switch to Dev Chatbot'}
                  </button>
                </div>
                <Terminal
                  history={terminalHistory}
                  input={terminalInput}
                  setInput={setTerminalInput}
                  terminalRef={terminalRef}
                  isChatbot={isChatbot}
                  setIsChatbot={setIsChatbot}
                  onCommand={e => {
                    if (e.key === 'Enter' && terminalInput.trim()) {
                      processCommand(terminalInput);
                      setTerminalInput('');
                    }
                  }}
                />
              </div>
            </motion.div>
            <GamesCarousel onSelect={setActiveGame} />
            <AnimatePresence>
              {activeGame && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                >
                  <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-2xl relative">
                    <button
                      onClick={() => setActiveGame(null)}
                      className="absolute top-4 right-4 text-red-500 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                    {renderGame()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <NetflixCards title="Now Streaming: Skills" items={skills} />
            
            {/* Netflix-Style Solar System Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-red-500 netflix-font">Solar System Explorer</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Interactive 3D Experience</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                {/* Netflix-style header */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-semibold ml-3">Solar System v2.0</span>
                  </div>
                  <div className="flex items-center space-x-4 text-white text-sm">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      LIVE
                    </span>
                    <span>FPS: <span className="text-green-400">60</span></span>
                  </div>
                </div>
                
                {/* Solar System Container */}
                <div className="relative">
                  <SolarSystemSimulation />
                  
                  {/* Netflix-style overlay controls */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-all duration-200 border border-gray-600">
                      <span className="text-xs">🎮</span>
                    </button>
                    <button className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-all duration-200 border border-gray-600">
                      <span className="text-xs">⚙️</span>
                    </button>
                    <button className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-all duration-200 border border-gray-600">
                      <span className="text-xs">📊</span>
                    </button>
                  </div>
                  
                  {/* Info panel */}
                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 max-w-xs">
                    <h3 className="text-white font-semibold mb-2">Controls</h3>
                    <div className="text-gray-300 text-sm space-y-1">
                      <div>🖱️ Drag to rotate view</div>
                      <div>🔍 Scroll to zoom</div>
                      <div>👆 Touch to navigate</div>
                      <div>🌍 Real-time orbits</div>
                    </div>
                  </div>
                </div>
                
                {/* Netflix-style footer */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>Planets: <span className="text-green-400">8</span></span>
                      <span>Asteroids: <span className="text-yellow-400">2000+</span></span>
                      <span>Stars: <span className="text-blue-400">5000+</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">●</span>
                      <span>Real-time simulation</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Netflix-style description */}
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                  Experience our solar system like never before! Navigate through space, explore planets, 
                  and witness the beauty of orbital mechanics in this interactive 3D simulation. 
                  Perfect for space enthusiasts and Netflix binge-watchers alike! 🚀
                </p>
              </div>
            </motion.div>
            
            <Footer />
          </>
        )}
      </div>

      {showEasterEgg && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div 
            className="bg-black/80 text-green-400 text-2xl font-mono p-8 rounded-lg border border-green-500 animate-pulse"
            style={{
              boxShadow: `0 0 50px ${colorScheme.primary}80`,
              animation: 'pulse 2s infinite'
            }}
          >
            Konami Code Detected! 🎮
          </div>
        </div>
      )}

      {/* Particle Effect Container */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: colorScheme.accent,
              opacity: Math.random() * 0.5,
              animation: `particleFloat ${Math.random() * 10 + 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// --- Game Stubs (You can expand these further) ---
const CodeBreaker = ({ onExit }) => {
  // Simple code breaker logic
  const [code] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState([]);
  const [won, setWon] = useState(false);
  const [tries, setTries] = useState(0);

  const handleGuess = () => {
    if (guess.length !== 4) return;
    setTries(tries + 1);
    if (guess === code) {
      setWon(true);
      setHistory([...history, { guess, result: 'Correct!' }]);
    } else {
      let correct = 0;
      for (let i = 0; i < 4; i++) if (guess[i] === code[i]) correct++;
      setHistory([...history, { guess, result: `${correct} digits correct` }]);
    }
    setGuess('');
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4 text-red-500 font-bold">Code Breaker</h2>
      <p className="mb-2">Guess the 4-digit code!</p>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 4))}
        className="bg-black border border-green-500 text-green-400 font-mono px-4 py-2 rounded text-lg mb-2"
        placeholder="Enter 4 digits"
        disabled={won}
      />
      <button
        onClick={handleGuess}
        className="ml-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        disabled={won}
      >Guess</button>
      <div className="mt-4 text-left max-h-40 overflow-y-auto">
        {history.map((h, i) => (
          <div key={i} className="font-mono text-green-400">{h.guess} - {h.result}</div>
        ))}
      </div>
      {won && <div className="mt-4 text-xl text-green-400 font-bold">You broke the code in {tries} tries!</div>}
      <button onClick={onExit} className="mt-6 block mx-auto text-red-400 hover:text-white">← Back to Games</button>
    </div>
  );
};

const TerminalRacer = ({ onExit }) => {
  // Simple typing speed game
  const commands = ['ls -la', 'npm start', 'git status', 'sudo reboot', 'docker ps', 'cat README.md'];
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  useEffect(() => {
    if (current === 0) setStart(Date.now());
    if (current === commands.length) setEnd(Date.now());
  }, [current]);

  const handleInput = (e) => {
    if (e.key === 'Enter' && input === commands[current]) {
      setCurrent(current + 1);
      setInput('');
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4 text-red-500 font-bold">Terminal Racer</h2>
      {current < commands.length ? (
        <>
          <p className="mb-2">Type the command as fast as you can:</p>
          <div className="font-mono text-green-400 text-lg mb-4">{commands[current]}</div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInput}
            className="bg-black border border-green-500 text-green-400 font-mono px-4 py-2 rounded text-lg"
            autoFocus
          />
        </>
      ) : (
        <div className="text-xl text-green-400 font-bold">Finished in {((end - start) / 1000).toFixed(2)} seconds!</div>
      )}
      <button onClick={onExit} className="mt-6 block mx-auto text-red-400 hover:text-white">← Back to Games</button>
    </div>
  );
};

const NetflixHacker = ({ onExit }) => {
  // Fun fake hacking simulation
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (progress < 100) {
      const t = setTimeout(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          if (newProgress > 100) return 100;
          return newProgress;
        });
      }, 400);

      // Add random hacking messages
      const messages = [
        'Bypassing firewall...',
        'Decrypting security protocols...',
        'Injecting payload...',
        'Accessing mainframe...',
        'Cracking encryption...',
        'Establishing secure connection...',
        'Overriding security measures...',
        'Gaining root access...',
      ];

      if (Math.random() > 0.7) {
        setMessages(prev => [...prev, messages[Math.floor(Math.random() * messages.length)]]);
      }

      return () => clearTimeout(t);
    }
  }, [progress]);

  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4 text-red-500 font-bold">Netflix Hacker</h2>
      <p className="mb-4">Hacking into Netflix mainframe...</p>
      <div className="w-full bg-gray-800 rounded-full h-6 mb-4">
        <div
          className="bg-green-500 h-6 rounded-full transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      <div className="h-32 overflow-y-auto text-left font-mono text-sm text-green-400 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">$ {msg}</div>
        ))}
      </div>
      {progress >= 100 ? (
        <div className="text-green-400 font-mono text-lg">Access Granted! Welcome, root@netflix</div>
      ) : (
        <div className="text-green-400 font-mono text-lg">{`Progress: ${Math.floor(progress)}%`}</div>
      )}
      <button onClick={onExit} className="mt-6 block mx-auto text-red-400 hover:text-white">← Back to Games</button>
    </div>
  );
};

const SnakeGame = ({ onExit }) => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0');
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [level, setLevel] = useState(1);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [specialFood, setSpecialFood] = useState(null);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [nextDirection, setNextDirection] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  const GRID_SIZE = 20;
  const TILE_COUNT = 24;
  const CANVAS_SIZE = GRID_SIZE * TILE_COUNT;

  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
    }
  }, []);

  // Particle system for food eating effects
  const createParticles = (x, y, color = '#39ff14') => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Generate food position (avoiding snake body)
  const generateFood = () => {
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * TILE_COUNT),
        Math.floor(Math.random() * TILE_COUNT)
      ];
    } while (snake.some(([x, y]) => x === newFood[0] && y === newFood[1]));
    return newFood;
  };

  // Generate special food occasionally
  useEffect(() => {
    if (gameStarted && !gameOver && Math.random() < 0.3) {
      const specialFoodTimer = setTimeout(() => {
        if (!specialFood) {
          setSpecialFood(generateFood());
          // Remove special food after 5 seconds
          setTimeout(() => setSpecialFood(null), 5000);
        }
      }, 3000);
      return () => clearTimeout(specialFoodTimer);
    }
  }, [food, gameStarted, gameOver]);

  // Enhanced drawing function
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with grid pattern
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw snake with gradient and glow effect
    snake.forEach(([x, y], index) => {
      const isHead = index === 0;
      const alpha = 1 - (index * 0.1);
      
      if (isHead) {
        // Snake head with glow
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#39ff14';
      } else {
        // Snake body with gradient
        ctx.shadowBlur = 5;
        const gradient = ctx.createLinearGradient(
          x * GRID_SIZE, y * GRID_SIZE,
          (x + 1) * GRID_SIZE, (y + 1) * GRID_SIZE
        );
        gradient.addColorStop(0, `rgba(57, 255, 20, ${alpha})`);
        gradient.addColorStop(1, `rgba(20, 150, 10, ${alpha})`);
        ctx.fillStyle = gradient;
      }
      
      ctx.fillRect(x * GRID_SIZE + 1, y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      
      if (isHead) {
        // Add eyes to snake head
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        const eyeSize = 3;
        const eyeOffset = 6;
        
        // Determine eye position based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        if (direction.x === 1) { // Right
          eyeX1 = x * GRID_SIZE + 12; eyeY1 = y * GRID_SIZE + 6;
          eyeX2 = x * GRID_SIZE + 12; eyeY2 = y * GRID_SIZE + 12;
        } else if (direction.x === -1) { // Left
          eyeX1 = x * GRID_SIZE + 6; eyeY1 = y * GRID_SIZE + 6;
          eyeX2 = x * GRID_SIZE + 6; eyeY2 = y * GRID_SIZE + 12;
        } else if (direction.y === -1) { // Up
          eyeX1 = x * GRID_SIZE + 6; eyeY1 = y * GRID_SIZE + 6;
          eyeX2 = x * GRID_SIZE + 12; eyeY2 = y * GRID_SIZE + 6;
        } else { // Down or stationary
          eyeX1 = x * GRID_SIZE + 6; eyeY1 = y * GRID_SIZE + 12;
          eyeX2 = x * GRID_SIZE + 12; eyeY2 = y * GRID_SIZE + 12;
        }
        
        ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
        ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
      }
    });

    // Draw regular food with pulsing effect
    const foodPulse = Math.sin(Date.now() / 200) * 0.3 + 1;
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10 * foodPulse;
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(
      food[0] * GRID_SIZE + 2, 
      food[1] * GRID_SIZE + 2, 
      (GRID_SIZE - 4) * foodPulse, 
      (GRID_SIZE - 4) * foodPulse
    );

    // Draw special food with rainbow effect
    if (specialFood) {
      const time = Date.now() / 100;
      const hue = (time % 360);
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 20;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(
        specialFood[0] * GRID_SIZE + 1, 
        specialFood[1] * GRID_SIZE + 1, 
        GRID_SIZE - 2, 
        GRID_SIZE - 2
      );
    }

    // Draw particles
    ctx.shadowBlur = 0;
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
    });

    // Reset shadow effects
    ctx.shadowBlur = 0;
  };

  // Update particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98
        })).filter(particle => particle.life > 0)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, []);

  // Game logic
  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver || isPaused) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = [...newSnake[0]];
      
      // Apply next direction
      const currentDirection = { ...nextDirection };
      
      // Move head
      head[0] += currentDirection.x;
      head[1] += currentDirection.y;

      // Check wall collision
      if (head[0] < 0 || head[0] >= TILE_COUNT || head[1] < 0 || head[1] >= TILE_COUNT) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(([x, y]) => x === head[0] && y === head[1])) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head[0] === food[0] && head[1] === food[1]) {
        createParticles(food[0], food[1], '#ff4444');
        setScore(prev => {
          const newScore = prev + (10 * level);
          
          // Increase speed and level every 50 points
          if (newScore % 50 === 0) {
            setLevel(l => l + 1);
            setSpeed(s => Math.max(80, s - 10));
          }
          
          return newScore;
        });
        setFood(generateFood());
      } else if (specialFood && head[0] === specialFood[0] && head[1] === specialFood[1]) {
        // Special food gives bonus points and creates rainbow particles
        createParticles(specialFood[0], specialFood[1], `hsl(${Math.random() * 360}, 100%, 50%)`);
        setScore(prev => prev + (50 * level));
        setSpecialFood(null);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });

    setDirection(nextDirection);
  }, [gameStarted, gameOver, isPaused, nextDirection, food, specialFood, level]);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(updateGame, speed);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [updateGame, speed, gameStarted, gameOver, isPaused]);

  // Draw loop
  useEffect(() => {
    const drawLoop = setInterval(draw, 16); // 60 FPS
    return () => clearInterval(drawLoop);
  }, [snake, food, specialFood, particles, direction]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) return;

      // Prevent default arrow key behavior
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
          break;
        case 'Space':
          setIsPaused(prev => !prev);
          break;
        case 'KeyR':
          if (gameOver) restartGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setSpeed(150);
    setSnake([[10, 10]]);
    setFood(generateFood());
    setSpecialFood(null);
    setDirection({ x: 0, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setParticles([]);
    setIsPaused(false);
  };

  const restartGame = () => {
    startGame();
  };

  // Update high score
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-4 mb-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-red-500 bg-clip-text text-transparent">
          🐍 Enhanced Snake
        </h2>
      </div>
      
      {/* Game Stats */}
      <div className="flex justify-center gap-8 text-sm font-mono">
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-green-500">
          <span className="text-green-400">Score: </span>
          <span className="text-white font-bold">{score}</span>
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-yellow-500">
          <span className="text-yellow-400">Level: </span>
          <span className="text-white font-bold">{level}</span>
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-blue-500">
          <span className="text-blue-400">High Score: </span>
          <span className="text-white font-bold">{highScore}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative mx-auto inline-block">
        <canvas
          ref={canvasRef}
          className="border-2 border-green-500 rounded-lg shadow-2xl"
          style={{ 
            background: 'linear-gradient(45deg, #0a0a0a 0%, #1a1a1a 100%)',
            boxShadow: '0 0 30px rgba(57, 255, 20, 0.3)'
          }}
        />
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 rounded-lg">
            <div className="text-center space-y-4">
              <div className="text-4xl">💀</div>
              <div className="text-2xl text-red-500 font-bold">Game Over!</div>
              <div className="text-lg text-white">Final Score: {score}</div>
              {score === highScore && score > 0 && (
                <div className="text-yellow-400 font-bold animate-pulse">🎉 NEW HIGH SCORE! 🎉</div>
              )}
              <button
                onClick={restartGame}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
              >
                Play Again (R)
              </button>
            </div>
          </div>
        )}

        {/* Start Screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 rounded-lg">
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🐍</div>
              <div className="text-2xl text-green-400 font-bold">Enhanced Snake</div>
              <div className="text-sm text-gray-300 max-w-xs">
                Collect food to grow! Special rainbow food gives bonus points!
              </div>
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
            <div className="text-center space-y-4">
              <div className="text-4xl">⏸️</div>
              <div className="text-2xl text-yellow-400 font-bold">Paused</div>
              <div className="text-sm text-gray-300">Press SPACE to continue</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-green-400 mb-3">Controls</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">↑↓←→</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">WASD</kbd> Move</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">SPACE</kbd> Pause</div>
          <div><kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> Restart (when game over)</div>
          <div><span className="text-green-400">🟢</span> Regular food (+10×level)</div>
          <div><span className="text-red-400">🔴</span> Red food (grows snake)</div>
          <div><span className="text-purple-400">🌈</span> Special food (+50×level)</div>
        </div>
      </div>

      <button 
        onClick={onExit} 
        className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
      >
        ← Back to Games
      </button>
    </div>
  );
};

// Add these keyframes to your CSS
const styles = `
@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-100vh) translateX(100px);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(0) translateX(20px);
  }
  75% {
    transform: translateY(20px) translateX(10px);
  }
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default DeveloperPage; 