import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpider, FaPaperPlane } from 'react-icons/fa';

const ChatContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  border: 2px solid #e63946;
  box-shadow: 0 0 20px rgba(230, 57, 70, 0.3);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background: #e63946;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChatMessages = styled.div`
  height: 400px;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled(motion.div)`
  max-width: 70%;
  padding: 1rem;
  border-radius: 15px;
  position: relative;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background: #e63946;
    color: white;
    border-bottom-right-radius: 5px;
  ` : `
    align-self: flex-start;
    background: #2c2c2c;
    color: white;
    border-bottom-left-radius: 5px;
  `}
`;

const InputContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #1a1a1a;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 25px;
  background: #2c2c2c;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: 2px solid #e63946;
  }
`;

const SendButton = styled(motion.button)`
  background: #e63946;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  
  &:hover {
    background: #c1121f;
  }
`;

const SpiderChat = () => {
  const [messages, setMessages] = useState([
    { text: "Hey there, web-head! I'm your friendly neighborhood Spider-Man! How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const spiderResponses = [
    "With great power comes great responsibility!",
    "Thwip! Thwip! That's the sound of me swinging into action!",
    "My spidey-sense is tingling... that's a great question!",
    "Just like my web-shooters, I'm here to help!",
    "You know, I'm something of a developer myself!",
    "Time to web-sling into action!",
    "My suit's AI Karen would love to help with that!",
    "Just like my web formula, let's solve this together!",
    "I'm not just your friendly neighborhood Spider-Man, I'm your friendly neighborhood developer!",
    "Let's stick to the plan, just like my web does to walls!"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput('');

    // Simulate Spider-Man response
    setTimeout(() => {
      const response = spiderResponses[Math.floor(Math.random() * spiderResponses.length)];
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <FaSpider size={24} />
        <h3>Spider-Man Chat</h3>
      </ChatHeader>
      
      <ChatMessages>
        <AnimatePresence>
          {messages.map((message, index) => (
            <Message
              key={index}
              isUser={message.isUser}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {message.text}
            </Message>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </ChatMessages>

      <InputContainer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Spider-Man anything..."
        />
        <SendButton
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
        >
          <FaPaperPlane />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default SpiderChat; 