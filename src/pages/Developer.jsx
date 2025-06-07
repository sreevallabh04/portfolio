import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpider } from 'react-icons/fa';
import SpiderChat from '../components/SpiderChat';
import WebSwingGame from '../components/WebSwingGame';
import SpiderTech from '../components/SpiderTech';
import SpiderTimeline from '../components/SpiderTimeline';

const DeveloperContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  min-height: 100vh;
  color: #fff;
  overflow-x: hidden;
`;

const HeroSection = styled(motion.div)`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: url('/spiderman/hero-bg.jpg') no-repeat center center;
  background-size: cover;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  color: #e63946;
  text-shadow: 0 0 10px rgba(230, 57, 70, 0.5);
  margin-bottom: 1rem;
  
  span {
    color: #fff;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: #f1faee;
  max-width: 600px;
  margin: 0 auto;
`;

const SpiderIcon = styled(motion.div)`
  font-size: 3rem;
  color: #e63946;
  margin: 2rem 0;
`;

const Section = styled.section`
  padding: 5rem 2rem;
  position: relative;
  
  &:nth-child(even) {
    background: rgba(230, 57, 70, 0.1);
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: #e63946;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: #e63946;
  }
`;

const WebEffect = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 0%, rgba(230, 57, 70, 0.1) 50%, transparent 100%);
    animation: webSwing 3s infinite;
  }
  
  @keyframes webSwing {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const Developer = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <DeveloperContainer>
      <HeroSection
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <WebEffect />
        <HeroContent>
          <SpiderIcon
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaSpider />
          </SpiderIcon>
          <Title
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Spider-<span>Developer</span>
          </Title>
          <Subtitle
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            With great power comes great responsibility. Building web experiences that swing into action!
          </Subtitle>
        </HeroContent>
      </HeroSection>

      <Section>
        <SectionTitle>Spider-Tech</SectionTitle>
        <SpiderTech />
      </Section>

      <Section>
        <SectionTitle>Web-Swinging Game</SectionTitle>
        <WebSwingGame />
      </Section>

      <Section>
        <SectionTitle>Spider-Chat</SectionTitle>
        <SpiderChat />
      </Section>

      <Section>
        <SectionTitle>Development Timeline</SectionTitle>
        <SpiderTimeline />
      </Section>
    </DeveloperContainer>
  );
};

export default Developer; 