import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContentRow from '@/components/ContentRow';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { profile } = useParams();

  const getProfileContent = () => {
    switch (profile) {
      case 'recruiter':
        return {
          banner: {
            title: "Sreevallabh Kakarala",
            subtitle: "Vellore Institute of Technology, Chennai",
            period: "Sep. 2022 - June 2027",
            description: "Software Engineer specializing in full-stack development and AI/ML solutions",
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
                  description: "Educational platform for Telangana State Board students with interactive quizzes and map exercises. Features cosmic space-themed UI and Leaflet-powered geography tools.",
                  techStack: "React, TypeScript, Tailwind CSS, Framer Motion, Leaflet",
                  imageUrl: "https://i.ibb.co/RGcgMwXL/telangana2.jpg",
                  link: "https://quiznetic.vercel.app/",
                  github: "https://github.com/sreevallabh04/Quiznetic"
                },
                {
                  title: "Metic Synergy Website",
                  period: "Dec 2024 - Apr 2025",
                  description: "Designed and developed a responsive corporate website using NextJS, Firebase, and Tailwind CSS, featuring interactive elements and optimized performance.",
                  techStack: "NextJS, Firebase, Tailwind CSS",
                  imageUrl: "https://i.postimg.cc/xC0WrB6B/logo.png",
                  link: "https://meticsynergy.com"
                },
                {
                  title: "VHTOP - Hostel Management Suite",
                  period: "March 2024",
                  description: "Developed a scalable management suite for hostel students using NextJS and Firebase, integrating carpooling and various utilities.",
                  techStack: "NextJS, Firebase, React",
                  imageUrl: "https://i.postimg.cc/ZqzGHWpb/vitlogo.jpg",
                  link: "https://vhtop-six.vercel.app/"
                },
                {
                  title: "Sarah - AI-Driven Virtual Assistant",
                  period: "2024",
                  description: "Developed an open-source, AI-powered virtual assistant with speech recognition, NLP, and automation capabilities.",
                  techStack: "Python, Machine Learning, NLP",
                  imageUrl: "https://i.postimg.cc/yNhwb7yF/Sarah-AI-agent.jpg",
                  link: "https://github.com/sreevallabh04/AIzara"
                },
                {
                  title: "AI integrated Blockchain voting system",
                  period: "2024",
                  description: "A next-generation voting platform combining blockchain technology with artificial intelligence for secure, transparent, and intelligent electoral processes.",
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
                  description: "Currently exploring the classification of spongy tissue disorder in mangoes using X-ray imaging and deep learning, aiming to enable non-invasive detection techniques for early post-harvest quality assessment.",
                  imageUrl: "https://i.postimg.cc/ZqzGHWpb/vitlogo.jpg"
                },
                {
                  title: "Freelance Web Developer",
                  subtitle: "Metic Synergy Website",
                  period: "Dec. 2024 - Apr. 2025",
                  description: "Designed and developed a responsive corporate website using NextJS, Firebase, and Tailwind CSS. Implemented interactive features including customer testimonials, service showcases, and contact forms with automated email notifications. Optimized site performance resulting in 40% faster load times and improved SEO rankings, increasing organic traffic by 25%. Designed and implemented a custom CMS allowing non-technical staff to easily update content, reducing maintenance overhead by 60%.",
                  imageUrl: "https://i.ibb.co/RGWp3h9/meticynergy.jpg"
                }
              ]
            },
            {
              title: "Technical Skills & Leadership",
              items: [
                {
                  title: "Languages & Frameworks",
                  description: "Python, Java, C/C++, JavaScript, SQL, NoSQL, Bash, Git, Flask, HTML, CSS, PHP, NextJS"
                },
                {
                  title: "Machine Learning & Databases",
                  description: "Numpy, Pandas, Scikit-learn, Matplotlib, DynamoDB, Aurora, SQLite, MySQL, Firestore"
                },
                {
                  title: "Leadership",
                  description: "Microsoft Innovations Club - Management/Sponsorship at VIT Chennai. Organized events with participants. VITrendz - Social media lead managing a platform with 17,000+ followers, driving a 40% increase in engagement."
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
                  description: "Completed secondary education with a strong foundation in mathematics and science.",
                  imageUrl: "https://i.ibb.co/Dg62kQ4b/download.png"
                },
                {
                  title: "Excellencia Junior College",
                  subtitle: "Shamirpet, Hyderabad",
                  period: "June 2020 - March 2022",
                  description: "Focused on MPC stream with emphasis on competitive exam preparation for engineering entrances.",
                  imageUrl: "https://i.postimg.cc/p5P7W0wY/excellencia.png"
                },
                {
                  title: "Vellore Institute of Technology, Chennai",
                  subtitle: "Vellore Institute of Technology, Chennai",
                  period: "Sep. 2022 - June 2027",
                  description: "Relevant coursework includes Data Structures, Machine Learning, Algorithms Analysis, Database Management, Computer Networks, Operating Systems, Software Engineering, Cloud Computing and DevOps.",
                  imageUrl: "https://i.postimg.cc/ZqzGHWpb/vitlogo.jpg"
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
  const isRecruiter = profile === 'recruiter';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      <div className="relative h-[50vh] md:h-[65vh] lg:h-[80vh] w-full">
        <img
          src={content.banner.imageUrl}
          alt="Banner background"
          className="absolute inset-0 h-full w-full object-cover object-right md:object-[85%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

        <div className="absolute bottom-[10%] md:bottom-[15%] left-[4%] md:left-[5%] max-w-xl lg:max-w-2xl z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 drop-shadow-lg">
            {content.banner.title}
          </h1>

          {isRecruiter && (
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 drop-shadow-sm">
              {content.banner.description}
            </p>
          )}

          {!isRecruiter && content.banner.description && (
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 drop-shadow-sm">
              {content.banner.description}
            </p>
          )}

          {isRecruiter && (
            <div className="flex flex-wrap gap-4">
              <Button
                variant="default"
                className="flex items-center gap-2 bg-white text-black px-6 py-3 text-lg font-semibold rounded-md hover:bg-gray-200 transition-colors duration-200"
                onClick={() => window.open('/resume.pdf', '_blank')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Resume
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-white/70 text-white hover:bg-white/20 px-6 py-3 text-lg font-semibold rounded-md bg-white/10 backdrop-blur-sm transition-colors duration-200"
                onClick={() => window.open(`https://${content.banner.contact.linkedin}`, '_blank', 'noopener,noreferrer')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0 18.5c4.69 0 8.5-3.81 8.5-8.5s-3.81-8.5-8.5-8.5-8.5 3.81-8.5 8.5 3.81 8.5 8.5 8.5zm-.5-13h1v7h-1zm.5 8.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75.75.336.75.75-.336.75-.75.75z"/></svg>
                LinkedIn
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-[4%] md:px-[5%] py-8 md:py-12">
        {content.rows.map((row, index) => (
          <ContentRow key={index} title={row.title} items={row.items} />
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;