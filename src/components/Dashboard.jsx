
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContentRow from '@/components/ContentRow';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, Mail } from 'lucide-react';

const Dashboard = () => {
  const { profile } = useParams();

  const getProfileContent = () => {
    switch (profile) {
      case 'recruiter':
        return {
          banner: {
            title: "Student of Software Engineering",
            subtitle: "Vellore Institute of Technology, Chennai",
            period: "Sep. 2022 - June 2027",
            description: "Software Engineer specializing in full-stack development and AI/ML solutions",
            contact: {
              email: "sreevallabhk@gmail.com",
              linkedin: "linkedin.com/in/sreevallabh-kakarala-7b4f8e219/",
              github: "github.com/sreevallabh04"
            }
          },
          rows: [
            {
              title: "Projects",
              items: [
                {
                  title: "Moodie - AI Wellness Companion",
                  period: "2024",
                  description: "A modern, emotionally intelligent wellness application that helps users track their mood, journal thoughts, and engage with an AI companion that adapts to emotional needs. Features include AI with multiple personality modes (Gen Z BFF, Mindful Therapist, Stoic Philosopher), mood tracking with visual charts, journaling with rich formatting, and persistent conversations.",
                  techStack: "React, TypeScript, Vite, Tailwind CSS, Firebase, Groq API, Chart.js",
                  link: "https://github.com/sreevallabh04/moodie"
                },
                {
                  title: "AI-Integrated Blockchain Voting",
                  period: "2024",
                  description: "A next-generation voting platform combining blockchain technology with artificial intelligence for secure, transparent electoral processes. Features secure on-chain voting via Ethereum smart contracts, private voting through Zero-Knowledge Proofs, AI-powered analysis of vote justifications, and Multi-Agent Deliberative Democracy (MADD) for simulating diverse perspectives.",
                  techStack: "Solidity, Ethereum, Web3.js, React, Zero-Knowledge Proofs, AI/ML",
                  link: "https://github.com/sreevallabh04/AI-Integrated-Advanced-Blockchain-Voting-system"
                },
                {
                  title: "Quiznetic - Interactive Learning",
                  period: "2024",
                  description: "An educational platform designed to help students learn subjects based on the Telangana State Board syllabus. Features interactive quizzes with a special focus on geography through map pointing exercises, providing a visually engaging learning experience with a cosmic space-themed UI.",
                  techStack: "Next.js, React, Tailwind CSS, Vercel",
                  link: "https://quiznetic.vercel.app/"
                }
              ]
            },
            {
              title: "Professional Experience",
              items: [
                {
                  title: "Agriculture Domain Research",
                  subtitle: "VIT Chennai",
                  period: "Jan. 2025 - Present",
                  description: "Exploring classification of spongy tissue disorder in mangoes using X-ray imaging and deep learning, aiming to enable non-invasive detection techniques for early post-harvest quality assessment."
                },
                {
                  title: "Freelance Web Developer",
                  subtitle: "Metic Synergy Website",
                  period: "Dec. 2024 - Jan. 2025",
                  description: "Designed and developed a responsive corporate website using NextJS, Firebase, and Tailwind CSS. Implemented interactive features with automated email notifications. Achieved 40% faster load times and 25% increase in organic traffic."
                }
              ]
            },
            {
              title: "Technical Skills",
              items: [
                {
                  title: "Languages & Frameworks",
                  description: "Python, Java, C/C++, JavaScript, SQL, NoSQL, Bash, Git, React, HTML, CSS/PHP/NextJS"
                },
                {
                  title: "Machine Learning",
                  description: "Numpy, Pandas, Scikit-learn, Matplotlib, PyTorch, TensorFlow"
                },
                {
                  title: "Development Tools",
                  description: "Docker, Kubernetes, Linux, Android, Asana, Notion"
                }
              ]
            }
          ]
        };
      default:
        return {
          banner: {
            title: "Welcome",
            description: "Explore my portfolio",
          },
          rows: []
        };
    }
  };

  const content = getProfileContent();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black"
    >
      <div className="relative h-[56.25vw] max-h-[80vh]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black">
          <div className="absolute bottom-1/4 left-[4%] max-w-3xl">
            <h1 className="mb-2 text-6xl font-bold text-white">{content.banner.title}</h1>
            {profile === 'recruiter' && (
              <>
                <h2 className="mb-2 text-2xl font-semibold text-white/90">{content.banner.subtitle}</h2>
                <p className="mb-4 text-lg text-white/70">{content.banner.period}</p>
                <p className="mb-6 text-xl text-white/80">{content.banner.description}</p>
                <div className="flex gap-4">
                  <Button
                    variant="default"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    onClick={() => window.open('/resume.pdf', '_blank')}
                  >
                    <Download size={20} />
                    Download Resume
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-white text-white hover:bg-white/20"
                    onClick={() => window.location.href = `mailto:${content.banner.contact.email}`}
                  >
                    <Mail size={20} />
                    Contact Me
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?q=80&w=1920&auto=format&fit=crop" // Dark abstract background
          alt="Abstract background"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {content.rows.map((row, index) => (
        <ContentRow key={index} title={row.title} items={row.items} />
      ))}
    </motion.div>
  );
};

export default Dashboard;
