import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react'; // Example icon

// Placeholder data for project tiles
const projects = [
  { id: 1, title: "VHTOP - Hostel Management", tag: "Real-time Systems", logo: "/path/to/vhtop-logo.png" },
  { id: 2, title: "Sarah - AI Assistant", tag: "NLP, Automation", logo: "/path/to/sarah-logo.png" },
  { id: 3, title: "Metic Synergy Website", tag: "Web Dev, Firebase", logo: "/path/to/metic-logo.png" },
  { id: 4, title: "Spongy Tissue Detection", tag: "X-ray Imaging, DL", logo: "/path/to/mango-logo.png" },
];

// Updated component for a project tile to match image
const ProjectTile = ({ title, tag }) => (
  <div className="bg-zinc-900 rounded-md p-4 aspect-[3/4] flex flex-col justify-end items-center text-center shadow-md shadow-black/40 group relative overflow-hidden">
    {/* Darker Icon Placeholder at the top */}
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-zinc-700/80 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-red-600/80 group-hover:text-white transition-colors duration-200">
      <ExternalLink size={18} />
    </div>
    {/* Text at the bottom */}
    <div className="mt-auto"> {/* Pushes text to bottom */}
      <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
      <p className="text-xs text-red-400 font-semibold">{tag}</p>
    </div>
    {/* Optional: Subtle hover overlay */}
    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
  </div>
);

const RecruiterProfilePage = () => {
  const portraitImage = '/avatars/avatar1.jpeg'; // Placeholder portrait

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white p-8 md:p-16 relative overflow-hidden" // Added relative and overflow-hidden for potential effects
    >
      {/* Optional: Background Effects Placeholder */}
      {/* Optional: Background Effects Placeholder - Keep commented out for now */}
      {/* <div className="absolute inset-0 z-0 opacity-5 scanlines"></div> */}

      {/* Main layout grid - adjusted for alignment */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 pt-10 md:pt-20">
        {/* Left Column: Portrait */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-shrink-0" // Prevent shrinking
        >
          {/* Adjusted portrait styling */}
          <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden shadow-[0_0_35px_5px_rgba(229,9,20,0.3)]"> {/* Red glow effect using shadow */}
            <img src={portraitImage} alt="Kakarala Sreevallabh" className="w-full h-full object-cover" />
            {/* Removed gradient overlay, relying on image lighting + glow */}
          </div>
        </motion.div> {/* Added missing closing tag here */}

        {/* Right Column: Info & Projects */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col items-center md:items-start text-center md:text-left mt-6 md:mt-0" // Align text based on screen size
        >
          {/* Adjusted text styling */}
          <h1 className="text-5xl md:text-7xl font-bold mb-2 text-white tracking-tighter">
            Sreevallabh Kakarala
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-3 max-w-lg font-light">
            Software Engineer | Researcher | Web Architect. Currently building AI for agriculture and virtual assistants. Master’s at VIT Chennai.
          </p>
          <p className="text-sm text-red-500 mb-10 font-medium tracking-wide"> {/* Adjusted color/spacing */}
            Tech Thriller | Open Source | Startup Vibes
          </p>

          {/* Project Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectTile key={project.id} {...project} />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RecruiterProfilePage;
