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
                {
                  title: "VHTOP - Hostel Management Suite",
                  period: "March 2024",
                  description: "Developed a scalable management suite for hostel students using NextJS and Firebase. Integrated a carpooling micro-service, addressing safety and cost issues. Implemented utilities like laundry, mess updates, and emergency services, reducing queues by 80% and boosting efficiency by 50%. Linked authentication with university accounts for seamless operation, targeting 7000+ potential users.",
                  techStack: "NextJS, Firebase, React"
                },
                {
                  title: "Sarah - AI-Driven Virtual Assistant",
                  period: "2024",
                  description: "Developed an open-source, AI-powered virtual assistant with speech recognition, NLP, and automation capabilities. Integrated speech recognition and pyttsx3 for voice-based interactions, ensuring natural conversation flow. Implemented intent recognition using keyword analysis and machine learning techniques for improved accuracy. Enabled task execution for media playback, information retrieval, smart home control, and automation.",
                  techStack: "Python, Machine Learning, NLP",
                  achievements: "Achieved 91% speech recognition accuracy and 87% task execution accuracy through benchmarking."
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-2 md:mb-3 drop-shadow-lg"> {/* Bolder font */}
            {content.banner.title}
          </h1>
          {/* Conditional rendering for recruiter details */}
          {isRecruiter && (
            <>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white/95 mb-1 md:mb-2 drop-shadow-md"> {/* Slightly brighter text */}
                {content.banner.subtitle}
              </h2>
              <p className="text-sm sm:text-base text-white/80 mb-3 md:mb-4 drop-shadow-sm"> {/* Slightly brighter text */}
                {content.banner.period}
              </p>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 md:mb-6 drop-shadow-sm"> {/* Slightly brighter text */}
                {content.banner.description}
              </p>
            </>
          )}
          {/* Render description for non-recruiter profiles if it exists */}
          {!isRecruiter && content.banner.description && (
             <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 md:mb-6 drop-shadow-sm">
                {content.banner.description}
              </p>
          )}

          {/* Buttons - Only for Recruiter profile - Adjusted styling */}
          {isRecruiter && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="default" // Shadcn default variant often has a primary color, let's override bg
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-base font-semibold rounded-md" // Explicit red bg, white text, rounded
                onClick={() => window.open('/resume.pdf', '_blank')}
              >
                <Download size={18} />
                Download Resume
              </Button>
              <Button
                variant="outline" // Shadcn outline variant
                className="flex items-center gap-2 border-white/70 text-white hover:bg-white/10 px-5 py-2.5 text-base font-semibold rounded-md bg-black/50 backdrop-blur-sm" // Adjusted border, text, hover, added bg/blur
                onClick={() => window.location.href = `mailto:${content.banner.contact.email}`}
              >
                <Mail size={18} />
                Contact Me
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
          <ContentRow key={index} title={!isRecruiter ? row.title : undefined} items={row.items} />
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;