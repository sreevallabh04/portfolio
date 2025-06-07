import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSpider, FaRobot, FaCode, FaTools } from 'react-icons/fa';

const TechContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const TechCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  padding: 2rem;
  color: white;
  border: 2px solid #e63946;
  box-shadow: 0 0 20px rgba(230, 57, 70, 0.3);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
  }
`;

const TechIcon = styled.div`
  font-size: 2.5rem;
  color: #e63946;
  margin-bottom: 1rem;
`;

const TechTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e63946;
`;

const TechDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #f1faee;
`;

const TechDetails = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(230, 57, 70, 0.95);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
`;

const SpiderTech = () => {
  const [selectedTech, setSelectedTech] = useState(null);

  const techItems = [
    {
      id: 1,
      title: "Web-Shooters",
      icon: <FaSpider />,
      description: "Advanced web-shooting technology that allows for precise web-slinging and combat.",
      details: "The web-shooters are wrist-mounted devices that can shoot different types of webbing, from standard web-lines to impact webbing and web-nets. They're powered by a special web-fluid formula that's both strong and biodegradable."
    },
    {
      id: 2,
      title: "Spider-Suit AI",
      icon: <FaRobot />,
      description: "Advanced AI system integrated into the Spider-Suit for enhanced capabilities.",
      details: "The suit's AI, named Karen, provides real-time analysis, tactical suggestions, and environmental monitoring. It can also control various suit functions and provide communication capabilities."
    },
    {
      id: 3,
      title: "Spider-Tracers",
      icon: <FaCode />,
      description: "Miniature tracking devices that can be attached to targets for surveillance.",
      details: "These tiny devices emit a unique frequency that can be tracked by the Spider-Suit's sensors. They're equipped with advanced GPS and can transmit data back to the suit's AI system."
    },
    {
      id: 4,
      title: "Spider-Gadgets",
      icon: <FaTools />,
      description: "Various utility gadgets designed for different situations and challenges.",
      details: "From impact webbing to web-bombs, these gadgets provide Spider-Man with versatile tools for any situation. Each gadget is carefully designed to be non-lethal while being effective in combat and rescue situations."
    }
  ];

  return (
    <TechContainer>
      {techItems.map((tech) => (
        <TechCard
          key={tech.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedTech(tech.id)}
        >
          <TechIcon>{tech.icon}</TechIcon>
          <TechTitle>{tech.title}</TechTitle>
          <TechDescription>{tech.description}</TechDescription>
          
          <AnimatePresence>
            {selectedTech === tech.id && (
              <TechDetails
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTech(null);
                }}
              >
                <h3>{tech.title}</h3>
                <p>{tech.details}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  Click anywhere to close
                </p>
              </TechDetails>
            )}
          </AnimatePresence>
        </TechCard>
      ))}
    </TechContainer>
  );
};

export default SpiderTech; 