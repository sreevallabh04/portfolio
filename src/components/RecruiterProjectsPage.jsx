import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

// Projects data from Dashboard recruiter section
const projects = [
  {
    title: "Quiznetic",
    period: "2024",
    description: "Educational platform for Telangana State Board students with interactive quizzes and map exercises.",
    techStack: "React, TypeScript, Tailwind CSS, Framer Motion, Leaflet",
    imageUrl: "https://i.ibb.co/RGcgMwXL/telangana2.jpg",
    link: "https://quiznetic.vercel.app/",
    github: "https://github.com/sreevallabh04/Quiznetic"
  },
  {
    title: "Metic Synergy Website",
    period: "Dec 2024 - Apr 2025",
    description: "Responsive corporate website using NextJS, Firebase, and Tailwind CSS.",
    techStack: "NextJS, Firebase, Tailwind CSS",
    imageUrl: "https://i.postimg.cc/xC0WrB6B/logo.png",
    link: "https://meticsynergy.com"
  },
  {
    title: "VHTOP - Hostel Management Suite",
    period: "March 2024",
    description: "Management suite for hostel students integrating carpooling and various utilities.",
    techStack: "NextJS, Firebase, React",
    imageUrl: "https://i.postimg.cc/ZqzGHWpb/vitlogo.jpg",
    link: "https://vhtop-six.vercel.app/"
  },
  {
    title: "Sarah - AI-Driven Virtual Assistant",
    period: "2024",
    description: "Open-source, AI-powered virtual assistant with speech recognition, NLP, and automation.",
    techStack: "Python, Machine Learning, NLP",
    imageUrl: "https://i.postimg.cc/yNhwb7yF/Sarah-AI-agent.jpg",
    link: "https://github.com/sreevallabh04/AIzara"
  },
  {
    title: "AI integrated Blockchain voting system",
    period: "2024",
    description: "Voting platform combining blockchain with AI for secure and intelligent elections.",
    techStack: "Blockchain, AI, Solidity, ZKP, Groq LLM",
    imageUrl: "https://i.postimg.cc/qvKf2stD/AIin-Blockchain.png",
    link: "https://github.com/sreevallabh04/AI-Integrated-Advanced-Blockchain-Voting-system"
  },
  {
    title: "🔮 AI Palmistry Reader ✨",
    period: "2024",
    description: `Unlock the secrets written in the lines of your palm with the power of AI and ancient palmistry wisdom!\n\nAI Palmistry Reader is a modern web app that analyzes a photo of your palm, detects your major palm lines, and generates a mystical palmistry report based on traditional rules—all with a beautiful, engaging interface. The application uses computer vision techniques to identify palm lines and AI to generate personalized readings.\n\nFeatures:\n- 📸 Palm Line Detection: Upload a clear photo of your palm and let the AI find your Life Line, Head Line, Heart Line, and Fate Line.\n- 🤖 AI-Powered Palmistry Report: Get a detailed, personalized reading based on the detected lines and real palmistry rules.\n- 🎨 Beautiful, Modern UI: Enjoy a mystical, aesthetic web experience with gradients, emojis, and a user-friendly layout.\n- 🖼️ Annotated Results: See your palm image with detected lines and download both the annotated image and your report.\n- 📱 Mobile Friendly: Access via QR code on your phone for easy palm photo capture.\n- 🔒 Privacy-Focused: Your palm images are processed locally and not stored permanently.`,
    techStack: "Python 3.9+, OpenCV, NumPy, SciPy, Matplotlib, scikit-image, Pillow, Streamlit, Groq API",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", // Unsplash palmistry/hand image
    link: "https://onlypalms.streamlit.app/"
  },
  {
    title: "One Direction Fan Game",
    period: "2025",
    description: `A modern, interactive fan game for One Direction enthusiasts!\n\nFeatures:\n- 🎤 One Direction quizzes and trivia\n- 🕹️ Mini-games and challenges\n- 🌈 Modern, responsive UI with Tailwind CSS\n- ⚡ Fast, interactive experience\n- 🏆 Score tracking and leaderboards\n- 💬 Community features (add your own questions!)\n\nEnjoy a beautiful, responsive UI, smooth animations, and a fun, community-driven experience.`,
    techStack: "Next.js, TypeScript, Tailwind CSS, Radix UI",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80", // Unsplash music/game themed image
    link: "https://onedirection-ai.vercel.app/",
    github: "https://github.com/sreevallabh04/onedirectionfangame"
  }
];

const RecruiterProjectsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white flex items-start justify-center"
    >
      {/* Netflix-style Projects Grid ONLY */}
      <div className="w-full max-w-7xl px-[4%] py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.08, zIndex: 10 }}
              className="relative bg-zinc-900 rounded-lg overflow-hidden shadow-lg cursor-pointer group transition-all duration-300"
              onClick={() => project.link && window.open(project.link, '_blank', 'noopener,noreferrer')}
            >
              {/* Project Image */}
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-[260px] object-cover object-center group-hover:brightness-75 transition-all duration-300"
              />
              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                <h3 className="text-lg font-bold text-white mb-1 truncate">{project.title}</h3>
                <p className="text-xs text-red-400 font-semibold mb-1 truncate">{project.techStack}</p>
                <p className="text-xs text-white/80 mb-2 line-clamp-2 min-h-[32px]">{project.description}</p>
                <div className="flex gap-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-black/60 hover:bg-white/20 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <Github size={18} className="text-white" />
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-black/60 hover:bg-white/20 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={18} className="text-white" />
                    </a>
                  )}
                </div>
              </div>
              {/* Hover Overlay */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RecruiterProjectsPage; 