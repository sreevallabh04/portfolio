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
        // Update banner content to match the target image
        return {
          banner: {
            title: "Sreevallabh Kakarala", // From image
            subtitle: "Vellore Institute of Technology, Chennai", // From image
            period: "Sep. 2022 - June 2027", // From image
            description: "Software Engineer specializing in full-stack development and AI/ML solutions", // From image
            imageUrl: "/photo1.jpg", // Use the image from the public directory
            contact: { // Keep contact info for buttons
              email: "srivallabhkakarala@gmail.com",
              linkedin: "linkedin.com/in/sreevallabh-kakarala-52ab8a248/",
              github: "github.com/sreevallabh04"
            }
          },
          // Keep existing rows data for now
          rows: [
            {
              title: "Projects",
              items: [
                { // Metic Synergy first
                  title: "Metic Synergy Website",
                  period: "Dec 2024 - Apr 2025", // Assuming period from Experience section
                  description: "Designed and developed a responsive corporate website using NextJS, Firebase, and Tailwind CSS, featuring interactive elements and optimized performance.", // Shortened description
                  techStack: "NextJS, Firebase, Tailwind CSS",
                  imageUrl: "/exp-thumbnail2.jpg", // Using placeholder from Experience section
                  link: "https://meticsynergy.com" // Added link
                },
                {
                  title: "VHTOP - Hostel Management Suite",
                  period: "March 2024",
                  description: "Developed a scalable management suite for hostel students using NextJS and Firebase, integrating carpooling and various utilities.", // Shortened description
                  techStack: "NextJS, Firebase, React",
                  imageUrl: "/project-thumbnail1.jpg", // Placeholder image
                  link: "https://vhtop-six.vercel.app/" // Added link
                },
                {
                  title: "Sarah - AI-Driven Virtual Assistant",
                  period: "2024",
                  description: "Developed an open-source, AI-powered virtual assistant with speech recognition, NLP, and automation capabilities.", // Shortened description
                  techStack: "Python, Machine Learning, NLP",
                  achievements: "Achieved 91% speech recognition accuracy and 87% task execution accuracy through benchmarking.",
                  imageUrl: "/project-thumbnail2.jpg", // Placeholder image
                  link: "https://github.com/sreevallabh04/AIzara" // Added link
                },
                {
                  title: "AI integrated Blockchain voting system",
                  period: "2024", // Assuming year, adjust if needed
                  description: "A next-generation voting platform combining blockchain technology with artificial intelligence for secure, transparent, and intelligent electoral processes.",
                  techStack: "Blockchain, AI, Solidity, ZKP, Groq LLM", // Example tech stack
                  imageUrl: "/project-thumbnail3.jpg", // Placeholder image
                  link: "https://github.com/sreevallabh04/AI-Integrated-Advanced-Blockchain-Voting-system"
                }
                // Note: Spongy Tissue Detection project is currently under Experience, not Projects.
              ]
            },
            {
              title: "Professional Experience",
              items: [
                {
                  title: "Research Intern",
                  subtitle: "Agriculture Domain Research - VIT Chennai",
                  period: "Jan. 2025 - Present",
                  description: "Currently exploring the classification of spongy tissue disorder in mangoes using X-ray imaging and deep learning, aiming to enable non-invasive detection techniques for early post-harvest quality assessment."
                },
                {
                  title: "Freelance Web Developer",
                  subtitle: "Metic Synergy Website",
                  period: "Dec. 2024 - Apr. 2025",
                  description: "Designed and developed a responsive corporate website using NextJS, Firebase, and Tailwind CSS. Implemented interactive features including customer testimonials, service showcases, and contact forms with automated email notifications. Optimized site performance resulting in 40% faster load times and improved SEO rankings, increasing organic traffic by 25%. Designed and implemented a custom CMS allowing non-technical staff to easily update content, reducing maintenance overhead by 60%."
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
                  title: "Integrated Master of Technology in Software Engineering",
                  subtitle: "Vellore Institute of Technology, Chennai",
                  period: "Sep. 2022 - June 2027",
                  description: "Relevant coursework includes Data Structures, Machine Learning, Algorithms Analysis, Database Management, Computer Networks, Operating Systems, Software Engineering, Cloud Computing and DevOps."
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
  const isRecruiter = profile === 'recruiter'; // Check if it's the recruiter profile

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white" // Ensure text is white by default
    >
      {/* Banner Section - Adjusted structure and styling */}
      <div className="relative h-[50vh] md:h-[65vh] lg:h-[80vh] w-full"> {/* Adjusted height */}
        {/* Background Image - Using provided code */}
        <img
          src="/photo1.jpg"
          alt="Banner background"
          className="absolute inset-0 h-full w-full object-cover object-right md:object-[85%_center]"
        />
        {/* Gradient Overlay - Using provided code */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

        {/* Text Content Overlay - Remains the same */}
        <div className="absolute bottom-[10%] md:bottom-[15%] left-[4%] md:left-[5%] max-w-xl lg:max-w-2xl z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 drop-shadow-lg"> {/* Larger and bolder font */}
            {content.banner.title}
          </h1>
          {/* Conditional rendering for recruiter details */}
          {isRecruiter && (
            <>
              {/* Removed subtitle and period to match image */}
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 drop-shadow-sm"> {/* Larger text for description */}
                {content.banner.description}
              </p>
            </>
          )}
          {/* Render description for non-recruiter profiles if it exists */}
          {!isRecruiter && content.banner.description && (
             <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 drop-shadow-sm"> {/* Larger text for description */}
                {content.banner.description}
              </p>
          )}

          {/* Buttons - Only for Recruiter profile - Adjusted styling to match image */}
          {isRecruiter && (
            <div className="flex flex-wrap gap-4"> {/* Increased gap */}
              <Button
                variant="default"
                className="flex items-center gap-2 bg-white text-black px-6 py-3 text-lg font-semibold rounded-md hover:bg-gray-200 transition-colors duration-200" // White background, black text, larger padding/font
                onClick={() => window.open('/resume.pdf', '_blank')}
              >
                {/* Using a simple triangle for play icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Resume
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-white/70 text-white hover:bg-white/20 px-6 py-3 text-lg font-semibold rounded-md bg-white/10 backdrop-blur-sm transition-colors duration-200" // Darker background, white text, larger padding/font
                onClick={() => window.open(`https://${content.banner.contact.linkedin}`, '_blank', 'noopener,noreferrer')} // Open LinkedIn link
              >
                {/* Using a simple circle with 'i' for info icon */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0 18.5c4.69 0 8.5-3.81 8.5-8.5s-3.81-8.5-8.5-8.5-8.5 3.81-8.5 8.5 3.81 8.5 8.5 8.5zm-.5-13h1v7h-1zm.5 8.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75.75.336.75.75-.336.75-.75.75z"/></svg>
                LinkedIn
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Rows Section - Added padding and title for recruiter */}
      <div className="px-[4%] md:px-[5%] py-8 md:py-12">
        {isRecruiter && (
           <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Featured Projects</h2> // Title from image
        )}
        {content.rows.map((row, index) => (
          // Assuming ContentRow handles its own title if needed for non-recruiter
          <ContentRow key={index} title={row.title} items={row.items} />
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;
