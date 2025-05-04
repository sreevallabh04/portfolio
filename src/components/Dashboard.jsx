
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
            title: "KAKARALA SREEVALLABH",
            subtitle: "Vellore Institute of Technology, Chennai",
            period: "Sep. 2022 - June 2027",
            description: "Integrated Master of Technology in Software Engineering",
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
