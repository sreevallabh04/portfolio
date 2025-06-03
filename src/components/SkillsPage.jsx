import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

// Updated skill data with normalized image paths
const skillsData = {
  "Languages": [
    { name: "Python", logo: "/skills/python.jpeg" },
    { name: "Java", logo: "/skills/java.png" },
    { name: "C/C++", logo: "/skills/c++.png" },
    { name: "JavaScript", logo: "/skills/javascript.png" },
    { name: "SQL", logo: "/skills/sql.jpeg" },,
    { name: "Bash", logo: "/skills/bash.png" },
    { name: "Git", logo: "/skills/git.png" },
  ],
  "Web Development Frameworks": [
    { name: "Flask", logo: "/skills/flask.png" },
    { name: "HTML", logo: "/skills/html.png" },
    { name: "CSS", logo: "/skills/css.png" },
    { name: "PHP", logo: "/skills/php.png" },
    { name: "ReactJS", logo: "/skills/reactjs.jpeg" },
    { name: "NextJS", logo: "/skills/nextjs.png" },
  ],
  "Machine Learning Frameworks": [
    { name: "Numpy", logo: "/skills/Numpy.png" },
    { name: "Pandas", logo: "/skills/pandas.png" },
    { name: "Scikit-learn", logo: "/skills/scikit learn.png" },
    { name: "Matplotlib", logo: "/skills/matplotlib.png" },
  ],
  "Databases": [
    { name: "DynamoDB", logo: "/skills/dynamodb.png" },
    { name: "Aurora", logo: "/skills/aurora.jpeg" },
    { name: "SQLite", logo: "/skills/sqlite.png" },
    { name: "MySQL", logo: "/skills/mysql.png" },
    { name: "Firestore", logo: "/skills/firestore.jpeg" },
  ],
  "Cloud Technologies": [
    { name: "Firebase", logo: "/skills/firebase.png" },
    { name: "Google Cloud Platform", logo: "/skills/gcp.png" },
    { name: "AWS", logo: "/skills/aws.png" },
  ],
  "Design Suite": [
    { name: "Figma", logo: "/skills/figma.png" },
    { name: "AdobeXD", logo: "/skills/adobexd.jpeg" },
  ],
  "Other Technologies": [
    { name: "Linux", logo: "/skills/linux.jpeg" },
    { name: "Android", logo: "/skills/android.png" },
    { name: "Notion", logo: "/skills/notion.png" },
    { name: "Docker", logo: "/skills/docker.png" },
  
  ],
};

const SkillsPage = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-gradient-to-r from-red-900 to-black flex items-center justify-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
          Skills Showcase
        </h1>
      </div>

      {/* Skills Sections */}
      <div className="px-[4%] py-8">
        {Object.entries(skillsData).map(([category, skills]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
            <Swiper
              modules={[Navigation, FreeMode]}
              spaceBetween={15}
              slidesPerView={'auto'}
              navigation
              freeMode={true}
              className="!px-4 !pb-4"
            >
              {skills.map((skill, index) => {
                const isHovered = hoveredIndex === `${category}-${index}`;

                return (
                  <SwiperSlide key={skill.name} className="!w-auto !h-auto group">
                    <motion.div
                      onHoverStart={() => setHoveredIndex(`${category}-${index}`)}
                      onHoverEnd={() => setHoveredIndex(null)}
                      animate={{
                        scale: isHovered ? 1.15 : 1,
                        zIndex: isHovered ? 20 : 1,
                        transition: { duration: 0.3 },
                      }}
                      className="netflix-card w-[180px] h-[220px] bg-[#181818] rounded-md overflow-hidden shadow-xl relative flex flex-col items-center justify-end p-3 cursor-pointer"
                    >
                      {/* Logo Container */}
                      <div className="absolute top-3 left-3 w-12 h-12 bg-white rounded flex items-center justify-center">
                        <img
                          src={skill.logo}
                          alt={`${skill.name} Logo`}
                          className="w-10 h-10 object-contain"
                        />
                      </div>

                      {/* Skill Name */}
                      <span className="text-sm font-semibold text-white text-center mb-2">{skill.name}</span>

                      {/* Hover Overlay */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent flex items-end p-3"
                        >
                          <span className="text-sm font-semibold text-white text-center w-full">{skill.name}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillsPage;
