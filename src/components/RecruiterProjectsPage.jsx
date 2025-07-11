import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ChevronRight, ChevronLeft, X, Calendar, Code, Folder } from 'lucide-react';
import SEO from '@/components/SEO';

// Projects data from Dashboard recruiter section
const projects = [
  {
    title: "Quiznetic",
    period: "2024",
    description: "Educational platform for Telangana State Board students with interactive quizzes and map exercises.",
    techStack: "React, TypeScript, Tailwind CSS, Framer Motion, Leaflet",
    imageUrl: "https://i.ibb.co/RGcgMwXL/telangana2.jpg",
    link: "https://quiznetic.vercel.app/",
    github: "https://github.com/sreevallabh04/Quiznetic",
    category: "Web Development"
  },
  {
    title: "Metic Synergy Website",
    period: "Dec 2024 - Apr 2025",
    description: "Responsive corporate website using NextJS, Firebase, and Tailwind CSS.",
    techStack: "NextJS, Firebase, Tailwind CSS",
    imageUrl: "https://i.postimg.cc/xC0WrB6B/logo.png",
    link: "https://meticsynergy.com",
    category: "Web Development"
  },
  {
    title: "VHTOP - Hostel Management Suite",
    period: "March 2024",
    description: "Management suite for hostel students integrating carpooling and various utilities.",
    techStack: "NextJS, Firebase, React",
    imageUrl: "https://i.postimg.cc/ZqzGHWpb/vitlogo.jpg",
    link: "https://vhtop-six.vercel.app/",
    category: "Web Development"
  },
  {
    title: "One Direction Fan Game",
    period: "2025",
    description: `A modern, interactive fan game for One Direction enthusiasts!\n\nFeatures:\n- 🎤 One Direction quizzes and trivia\n- 🕹️ Mini-games and challenges\n- 🌈 Modern, responsive UI with Tailwind CSS\n- ⚡ Fast, interactive experience\n- 🏆 Score tracking and leaderboards\n- 💬 Community features (add your own questions!)\n\nEnjoy a beautiful, responsive UI, smooth animations, and a fun, community-driven experience.`,
    techStack: "Next.js, TypeScript, Tailwind CSS, Radix UI",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    link: "https://onedirection-ai.vercel.app/",
    github: "https://github.com/sreevallabh04/onedirectionfangame",
    category: "Games"
  },
  {
    title: "Sarah - AI-Driven Virtual Assistant",
    period: "2024",
    description: "Open-source, AI-powered virtual assistant with speech recognition, NLP, and automation.",
    techStack: "Python, Machine Learning, NLP",
    imageUrl: "https://i.postimg.cc/yNhwb7yF/Sarah-AI-agent.jpg",
    link: "https://github.com/sreevallabh04/AIzara",
    category: "AI/ML"
  },
  {
    title: "AI integrated Blockchain voting system",
    period: "2024",
    description: "Voting platform combining blockchain with AI for secure and intelligent elections.",
    techStack: "Blockchain, AI, Solidity, ZKP, Groq LLM",
    imageUrl: "https://i.postimg.cc/qvKf2stD/AIin-Blockchain.png",
    link: "https://github.com/sreevallabh04/AI-Integrated-Advanced-Blockchain-Voting-system",
    category: "Blockchain"
  },
  {
    title: "🔮 AI Palmistry Reader ✨",
    period: "2024",
    description: `Unlock the secrets written in the lines of your palm with the power of AI and ancient palmistry wisdom!\n\nAI Palmistry Reader is a modern web app that analyzes a photo of your palm, detects your major palm lines, and generates a mystical palmistry report based on traditional rules—all with a beautiful, engaging interface. The application uses computer vision techniques to identify palm lines and AI to generate personalized readings.\n\nFeatures:\n- 📸 Palm Line Detection: Upload a clear photo of your palm and let the AI find your Life Line, Head Line, Heart Line, and Fate Line.\n- 🤖 AI-Powered Palmistry Report: Get a detailed, personalized reading based on the detected lines and real palmistry rules.\n- 🎨 Beautiful, Modern UI: Enjoy a mystical, aesthetic web experience with gradients, emojis, and a user-friendly layout.\n- 🖼️ Annotated Results: See your palm image with detected lines and download both the annotated image and your report.\n- 📱 Mobile Friendly: Access via QR code on your phone for easy palm photo capture.\n- 🔒 Privacy-Focused: Your palm images are processed locally and not stored permanently.`,
    techStack: "Python 3.9+, OpenCV, NumPy, SciPy, Matplotlib, scikit-image, Pillow, Streamlit, Groq API",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    link: "https://onlypalms.streamlit.app/",
    category: "AI/ML"
  },
  {
    title: "GitAlong",
    period: "2024",
    description: `GitAlong is a Flutter application that connects developers with open source projects through a Tinder-like interface. Find projects that match your skills, interests, and availability.\n\n🚀 Features:\n✅ Email, Google, GitHub OAuth\n✅ Profile setup with avatar upload\n✅ GitHub-style UI\n✅ AI-powered swiping & matching\n✅ Real-time messaging\n✅ Maintainer dashboard\n\n🚀 Production-Ready Features:\n✅ Authentication System - Firebase Authentication fully configured and production-ready\n✅ Google Sign-In - Complete integration with proper error handling\n✅ Apple Sign-In - Available on iOS/macOS platforms\n✅ Email/Password - Traditional authentication with validation\n✅ Comprehensive Logging - Production-grade logging system\n✅ Error Handling - Robust error management and user feedback\n\n🔧 Technical Architecture:\n- State Management - Flutter Riverpod with proper provider architecture\n- Local Storage - Hive for efficient local data management\n- Responsive Design - Flutter ScreenUtil for multi-device support\n- Modern UI - Glassmorphism effects and smooth animations\n- Error Recovery - Graceful error handling with user-friendly messaging`,
    techStack: "Flutter, Riverpod, Hooks, GoRouter, Firebase Auth, Firestore, Storage, GitHub OAuth, FastAPI, ML",
    imageUrl: "/GitAlong.jpg",
    github: "https://github.com/sreevallabh04/GitAlong",
    category: "Mobile Apps"
  }
];

const categories = [
  "All",
  "Web Development",
  "AI/ML",
  "Blockchain",
  "Games",
  "Mobile Apps"
];

const RecruiterProjectsPage = () => {
  const seoConfig = {
    title: "Projects Portfolio",
    description: "Explore my diverse portfolio of projects in Web Development, AI/ML, Blockchain, and Mobile Apps. View detailed case studies, tech stacks, and live demos.",
    type: "website",
    isArticle: true,
    publishedTime: "2024-01-01",
    modifiedTime: new Date().toISOString(),
    section: "Projects",
    keywords: "web development, AI/ML, blockchain, mobile apps, React, NextJS, Flutter, Python, software projects, portfolio",
    author: "Sreevallabh Kakarala"
  };
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const featuredProject = projects.find(p => p.title === "Metic Synergy Website");

  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const openProjectModal = (project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <SEO {...seoConfig} />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[60vh] md:h-[70vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={featuredProject.imageUrl}
            alt={featuredProject.title}
            className="max-h-[180px] sm:max-h-[250px] md:max-h-[350px] w-auto object-contain opacity-90 drop-shadow-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 p-4 sm:p-8 md:p-16 max-w-full sm:max-w-3xl">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 text-white">
            {featuredProject.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6">
            {featuredProject.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href={featuredProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 sm:px-8 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-2 transition-colors text-base sm:text-lg"
            >
              <ExternalLink size={20} />
              View Project
            </a>
            {featuredProject.github && (
              <a
                href={featuredProject.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 sm:px-8 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-md flex items-center gap-2 transition-colors text-base sm:text-lg"
              >
                <Github size={20} />
                Source Code
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-6">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-4 touch-scroll-x scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full whitespace-nowrap transition-colors text-sm sm:text-base touch-feedback ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="px-2 sm:px-4 md:px-8 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03, zIndex: 30 }}
              whileTap={{ scale: 0.98 }}
              className="relative bg-zinc-900 rounded-md overflow-hidden shadow-2xl cursor-pointer group touch-feedback-bounce"
              onClick={() => openProjectModal(project)}
            >
              {/* Project Image */}
              <div className="aspect-[16/9] relative">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover object-center group-hover:brightness-75 transition-all duration-200"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>

              {/* Project Info */}
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{project.title}</h3>
                <p className="text-xs sm:text-sm text-red-400 font-medium mb-2">{project.techStack}</p>
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{project.description}</p>
                <div className="flex gap-2 mt-3">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors touch-feedback"
                      onClick={e => e.stopPropagation()}
                    >
                      <Github size={16} className="text-white" />
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors touch-feedback"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={16} className="text-white" />
                    </a>
                  )}
                </div>
              </div>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                />
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeProjectModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeProjectModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors touch-feedback"
              >
                <X size={20} className="text-white" />
              </button>

              {/* Project Image Header */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
                
                {/* Project Header Info */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <Calendar size={16} />
                    <span>{selectedProject.period}</span>
                    <span className="mx-2">•</span>
                    <span>3 Months</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {selectedProject.title}
                  </h2>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(selectedProject.link, '_blank')}
                      className="mobile-button px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 touch-feedback"
                    >
                      <ExternalLink size={18} />
                      View
                    </motion.button>
                    {selectedProject.github && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(selectedProject.github, '_blank')}
                        className="mobile-button px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 touch-feedback"
                      >
                        <Github size={18} />
                        GitHub
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6 md:p-8">
                {/* Featured Badge */}
                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  #1 in Projects Today
                </div>

                {/* Project Description */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-4">Project Overview</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {selectedProject.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
                      <span>{selectedProject.period}</span>
                      <span>•</span>
                      <span>3 Months</span>
                    </div>
                  </div>
                  
                  <div>
                    {/* Tech Stack */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Code size={18} className="text-red-400" />
                        Tech Stack:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.techStack.split(', ').map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Area */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Folder size={18} className="text-blue-400" />
                        Area:
                      </h4>
                      <span className="text-gray-300">{selectedProject.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
};

export default RecruiterProjectsPage;