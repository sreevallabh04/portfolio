import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSpider, FaCode, FaLaptopCode, FaRobot } from 'react-icons/fa';

const TimelineContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 100%;
    background: #e63946;
    border-radius: 2px;
  }
`;

const TimelineItem = styled(motion.div)`
  display: flex;
  justify-content: ${props => props.isEven ? 'flex-start' : 'flex-end'};
  padding: 2rem 0;
  position: relative;
  width: 50%;
  margin-left: ${props => props.isEven ? '0' : 'auto'};
  padding-left: ${props => props.isEven ? '0' : '2rem'};
  padding-right: ${props => props.isEven ? '2rem' : '0'};

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    ${props => props.isEven ? 'right: -2rem;' : 'left: -2rem;'}
    width: 1rem;
    height: 1rem;
    background: #e63946;
    border-radius: 50%;
    transform: translateY(-50%);
  }
`;

const TimelineContent = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #e63946;
  border-radius: 15px;
  padding: 1.5rem;
  width: 100%;
  box-shadow: 0 0 20px rgba(230, 57, 70, 0.3);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const TimelineIcon = styled.div`
  font-size: 2rem;
  color: #e63946;
  margin-bottom: 1rem;
`;

const TimelineTitle = styled.h3`
  color: #e63946;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const TimelineDate = styled.span`
  color: #f1faee;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 1rem;
`;

const TimelineDescription = styled.p`
  color: #f1faee;
  line-height: 1.6;
`;

const TimelineDetails = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #e63946;
  border-radius: 15px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  z-index: 1000;
  color: white;
  box-shadow: 0 0 30px rgba(230, 57, 70, 0.5);
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
`;

const SpiderTimeline = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const timelineItems = [
    {
      id: 1,
      date: "2018",
      title: "The Beginning",
      icon: <FaSpider />,
      description: "Started the journey as a web developer, learning the basics of HTML, CSS, and JavaScript.",
      details: "The journey began with a simple HTML page and a dream. Learning the fundamentals of web development was like getting bitten by a radioactive spider - it changed everything. The first projects were simple, but they laid the foundation for what was to come."
    },
    {
      id: 2,
      date: "2019",
      title: "Framework Evolution",
      icon: <FaCode />,
      description: "Mastered modern JavaScript frameworks and started building complex web applications.",
      details: "Just like Spider-Man's suit evolved, so did the development skills. Learning React was like getting the Iron Spider suit - it provided new capabilities and ways to solve problems. Started building more complex applications and understanding the importance of component-based architecture."
    },
    {
      id: 3,
      date: "2020",
      title: "Full-Stack Development",
      icon: <FaLaptopCode />,
      description: "Expanded skills to include backend development and database management.",
      details: "The development journey took a full-stack turn, learning about servers, databases, and APIs. It was like developing new web-shooters - each new technology added another tool to the arsenal. Started building complete applications with both frontend and backend components."
    },
    {
      id: 4,
      date: "2021",
      title: "AI Integration",
      icon: <FaRobot />,
      description: "Started incorporating AI and machine learning into web applications.",
      details: "Just like Spider-Man's suit got an AI upgrade, the development skills evolved to include artificial intelligence. Started integrating machine learning models into web applications, creating more intelligent and responsive user experiences."
    }
  ];

  return (
    <TimelineContainer>
      {timelineItems.map((item, index) => (
        <TimelineItem
          key={item.id}
          isEven={index % 2 === 0}
          initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
        >
          <TimelineContent onClick={() => setSelectedItem(item)}>
            <TimelineIcon>{item.icon}</TimelineIcon>
            <TimelineTitle>{item.title}</TimelineTitle>
            <TimelineDate>{item.date}</TimelineDate>
            <TimelineDescription>{item.description}</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      ))}

      <AnimatePresence>
        {selectedItem && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
            />
            <TimelineDetails
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <TimelineIcon>{selectedItem.icon}</TimelineIcon>
              <TimelineTitle>{selectedItem.title}</TimelineTitle>
              <TimelineDate>{selectedItem.date}</TimelineDate>
              <TimelineDescription>{selectedItem.details}</TimelineDescription>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: '#e63946',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Close
              </button>
            </TimelineDetails>
          </>
        )}
      </AnimatePresence>
    </TimelineContainer>
  );
};

export default SpiderTimeline; 