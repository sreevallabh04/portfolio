import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimpleContentRow from '@/components/SimpleContentRow';
import { Button } from '@/components/ui/button';
import * as anime from 'animejs';

const Dashboard = () => {
  const { profile } = useParams();
  const [showVideo, setShowVideo] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const getProfileContent = () => {
    if (profile !== 'recruiter') {
      return {
        banner: {
          title: "Welcome",
          description: "Explore my portfolio"
        },
        rows: []
      };
    }

    return {
      banner: {
        title: "Sreevallabh Kakarala",
        subtitle: "Vellore Institute of Technology, Chennai",
        period: "Sep. 2022 - June 2027",
        description: "Software Engineering student specializing in full-stack development and AI/ML solutions",
        imageUrl: "/photo1.jpg",
        contact: {
          email: "srivallabhkakarala@gmail.com",
          linkedin: "linkedin.com/in/sreevallabh-kakarala-52ab8a248/",
          github: "github.com/sreevallabh04"
        }
      },
      rows: [
        {
          title: "Projects",
          items: [
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
            }
          ]
        },
        {
          title: "Professional Experience",
          items: [
            {
              title: "Research Intern",
              subtitle: "Agriculture Domain Research - VIT Chennai",
              period: "Jan. 2025 - Present",
              description: "Classification of spongy tissue disorder in mangoes using deep learning.",
              imageUrl: "https://i.postimg.cc/ZqzGHWpb/vitlogo.jpg"
            },
            {
              title: "Freelance Web Developer",
              subtitle: "Metic Synergy Website",
              period: "Dec. 2024 - Apr. 2025",
              description: "Developed interactive corporate website with CMS and SEO improvements.",
              imageUrl: "https://i.ibb.co/xKvG4qPV/IMG-1949.jpg"
            }
          ]
        },
        {
          title: "Technical Skills",
          isSkills: true,
          items: [
            {
              title: "Languages",
              skills: [
                { name: "Python", logo: "/skills/python.jpeg" },
                { name: "Java", logo: "/skills/java.png" },
                { name: "C/C++", logo: "/skills/c++.png" },
                { name: "JavaScript", logo: "/skills/javascript.png" },
                { name: "SQL", logo: "/skills/sql.jpeg" },
                { name: "Bash", logo: "/skills/bash.png" },
                { name: "Git", logo: "/skills/git.png" }
              ]
            },
            {
              title: "Web Development Frameworks",
              skills: [
                { name: "Flask", logo: "/skills/flask.png" },
                { name: "HTML", logo: "/skills/html.png" },
                { name: "CSS", logo: "/skills/css.png" },
                { name: "PHP", logo: "/skills/php.png" },
                { name: "ReactJS", logo: "/skills/reactjs.jpeg" },
                { name: "NextJS", logo: "/skills/nextjs.png" }
              ]
            },
            {
              title: "Machine Learning Frameworks",
              skills: [
                { name: "Numpy", logo: "/skills/Numpy.png" },
                { name: "Pandas", logo: "/skills/pandas.png" },
                { name: "Scikit-learn", logo: "/skills/scikit learn.png" },
                { name: "Matplotlib", logo: "/skills/matplotlib.png" }
              ]
            },
            {
              title: "Databases",
              skills: [
                { name: "DynamoDB", logo: "/skills/dynamodb.png" },
                { name: "Aurora", logo: "/skills/aurora.jpeg" },
                { name: "SQLite", logo: "/skills/sqlite.png" },
                { name: "MySQL", logo: "/skills/mysql.png" },
                { name: "Firestore", logo: "/skills/firestore.jpeg" }
              ]
            },
            {
              title: "Cloud Technologies",
              skills: [
                { name: "Firebase", logo: "/skills/firebase.png" },
                { name: "Google Cloud Platform", logo: "/skills/gcp.png" },
                { name: "AWS", logo: "/skills/aws.png" }
              ]
            },
            {
              title: "Design Suite",
              skills: [
                { name: "Figma", logo: "/skills/figma.png" },
                { name: "AdobeXD", logo: "/skills/adobexd.jpeg" }
              ]
            },
            {
              title: "Other Technologies",
              skills: [
                { name: "Linux", logo: "/skills/linux.jpeg" },
                { name: "Android", logo: "/skills/android.png" },
                { name: "Notion", logo: "/skills/notion.png" },
                { name: "Docker", logo: "/skills/docker.png" }
              ]
            }
          ]
        },
        {
          title: "Education & Coursework",
          items: [
            {
              title: "Delhi Public School",
              subtitle: "Nacharam, Hyderabad",
              period: "June 2016 - March 2020",
              description: "Completed secondary education.",
              imageUrl: "https://i.ibb.co/Dg62kQ4b/download.png"
            },
            {
              title: "Excellencia Junior College",
              subtitle: "Shamirpet, Hyderabad",
              period: "June 2020 - March 2022",
              description: "Focused on MPC stream for engineering entrances.",
              imageUrl: "https://i.postimg.cc/p5P7W0wY/excellencia.png"
            },
            {
              title: "VIT Chennai",
              subtitle: "Vellore Institute of Technology, Chennai",
              period: "Sep. 2022 - June 2027",
              description: "Relevant coursework: DS, ML, OS, CN, SE, Cloud, DBMS, DevOps.",
              imageUrl: "https://i.postimg.cc/ZqzGHWpb/vitlogo.jpg"
            }
          ]
        }
      ]
    };
  };

  const content = getProfileContent();
  const isRecruiter = profile === 'recruiter';

  // Handler for PIN input
  const handlePinChange = (idx, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...pinDigits];
    newDigits[idx] = value;
    setPinDigits(newDigits);
    setPinError('');
    if (value && idx < 3) {
      inputRefs[idx + 1].current.focus();
    }
    if (newDigits.every(d => d.length === 1)) {
      if (newDigits.join('') === '1501') setShowVideo(true);
      else setPinError('Incorrect PIN. Try again.');
    }
  };

  const handlePinKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !pinDigits[idx] && idx > 0) {
      inputRefs[idx - 1].current.focus();
    }
  };

  if (profile === 'adventurer' && !showVideo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-2">
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <div className="text-gray-300 text-base md:text-xl mb-4 text-center">Profile Lock is currently on.</div>
          <div className="text-white text-2xl md:text-5xl font-bold mb-8 text-center leading-tight">Enter your PIN to access this profile.</div>
          <div className="flex gap-3 md:gap-6 mb-6 w-full justify-center">
            {[0, 1, 2, 3].map(idx => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={pinDigits[idx]}
                onChange={e => handlePinChange(idx, e.target.value)}
                onKeyDown={e => handlePinKeyDown(idx, e)}
                className="w-12 h-12 md:w-20 md:h-20 text-2xl md:text-4xl text-center rounded border-2 border-gray-400 bg-black text-white focus:outline-none focus:border-red-600 transition-all font-mono"
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {pinError && <div className="text-red-500 mb-4 text-base md:text-lg text-center">{pinError}</div>}
          <div className="text-gray-400 text-base md:text-lg mt-8 cursor-pointer hover:underline text-center">Forgot PIN?</div>
        </div>
      </div>
    );
  }

  // Adventurer unlocked: show immersive Apple-style background video with audio
  if (profile === 'adventurer' && showVideo) {
    return (
      <div className="min-h-screen w-full h-full fixed inset-0 overflow-hidden bg-black">
        <video
          src="/adv.mp4"
          autoPlay
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
          style={{ pointerEvents: 'none', minHeight: '100vh', minWidth: '100vw' }}
        />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-black text-white">
      <div className="relative h-[50vh] md:h-[65vh] lg:h-[80vh] w-full">
        <img src={content.banner.imageUrl} alt="Banner background" className="absolute inset-0 h-full w-full object-cover object-right md:object-[85%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="absolute bottom-[10%] md:bottom-[15%] left-[4%] md:left-[5%] max-w-xl lg:max-w-2xl z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 drop-shadow-lg">
            {content.banner.title}
          </h1>

          {content.banner.description && (
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 drop-shadow-sm">
              {content.banner.description}
            </p>
          )}

          {isRecruiter && (
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => window.open('/resume.pdf', '_blank')} className="bg-white text-black px-6 py-3 text-lg font-semibold rounded-md hover:bg-gray-200 transition-colors duration-200">
                Resume
              </Button>
              <Button onClick={() => window.open(`https://${content.banner.contact.linkedin}`, '_blank', 'noopener,noreferrer')} className="border-white/70 text-white hover:bg-white/20 px-6 py-3 text-lg font-semibold rounded-md bg-white/10 backdrop-blur-sm transition-colors duration-200">
                LinkedIn
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-[4%] md:px-[5%] py-8 md:py-12">
        {content.rows.map((row, index) => (
          <SimpleContentRow 
            key={index} 
            title={row.title} 
            items={row.items} 
            isSkills={row.isSkills}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;