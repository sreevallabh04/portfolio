import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const FloatingChatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  // Check if we're on blog page (where we may need extra spacing)
  const isBlogPage = location.pathname.includes('/browse/blog');
  
     // Responsive positioning based on screen size and page
   const getResponsivePosition = () => {
     const isMobile = windowSize.width < 768;
     const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
     
    if (isMobile) {
      // On mobile, position differently based on page
      return isBlogPage 
        ? { bottom: '6rem', right: '1rem' }
        : { bottom: '1.5rem', right: '1rem' };
     } else if (isTablet) {
      // On tablet, adjust horizontal positioning for blog page
      return isBlogPage 
        ? { bottom: '1.5rem', right: '5.5rem' }
         : { bottom: '1.5rem', right: '1.5rem' };
     } else {
      // Desktop positioning
      return isBlogPage 
        ? { bottom: '1.5rem', right: '5.5rem' }
         : { bottom: '1.5rem', right: '1.5rem' };
     }
   };

   const responsivePosition = getResponsivePosition();
   
   // Adjust drag constraints to allow free movement across entire screen
   const getDragConstraints = (isButton = false) => {
     const elementWidth = isButton ? 80 : (windowSize.width < 480 ? 288 : 320); // w-72 = 288px, w-80 = 320px
     const elementHeight = isButton ? 80 : (isMinimized ? 80 : 500);
     
     return {
       top: -windowSize.height + elementHeight,
       left: -windowSize.width + elementWidth,
       right: windowSize.width - elementWidth,
       bottom: windowSize.height - elementHeight,
     };
   };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle window resize for drag constraints
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API key
  const apiKeys = [
    'AIzaSyCQZQQCr0Jh07Sh6wl07e7EK-FKcwYkIJI'
  ];

  // Interactive greeting messages
  const getRandomGreeting = () => {
    const greetings = [
      "Hey there! Welcome to my digital playground! I'm Sreevallabh, your friendly neighborhood developer who occasionally produces working code! 😄",
      "Hello! I'm Sreevallabh, and I'm basically the Jim Halpert of coding - always making things more fun than they should be! 🎭",
      "Wassup! I'm here to help you like a GPS that actually knows where it's going (unlike most developers with legacy code)! 🗺️",
      "Hi there! I'm Sreevallabh - I turn coffee into code and bugs into features. What brings you to my corner of the internet? 😂",
      "Welcome! I'm your friendly developer who's definitely not procrastinating by building this chatbot instead of fixing actual bugs! 🤖"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Proactive follow-up questions
  const getFollowUpQuestion = () => {
    const questions = [
      "So... are you here for business or just avoiding real work like I am right now? 📺",
      "Let me guess - you either need a website or you're just here to judge my life choices? Both are valid! 🤔",
      "Are you a fellow developer, or do you still think HTML is a programming language? (No judgment... okay, maybe a little) 💻",
      "Quick question - do you code or are you one of those 'idea people' who thinks apps magically appear? 🪄",
      "Tell me you're not here to ask me to build the next Facebook for equity and exposure... please! 🤦‍♂️",
      "Are you looking for a developer who actually meets deadlines, or are you okay with creative interpretations of 'done'? 😅"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens and send greeting
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
      
      // Send initial greeting if not done yet
      if (!hasGreeted) {
        setIsTyping(true);
        setTimeout(() => {
          const greeting = {
            type: 'bot',
            content: getRandomGreeting(),
            timestamp: new Date()
          };
          setMessages([greeting]);
          setIsTyping(false);
          setHasGreeted(true);
          
          // Send follow-up question after a delay
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              const followUpMessage = {
                type: 'bot',
                content: getFollowUpQuestion(),
                timestamp: new Date()
              };
              setMessages(prev => [...prev, followUpMessage]);
              setIsTyping(false);
            }, 1500);
          }, 2000);
        }, 1000);
      }
    }
  }, [isOpen, isMinimized, hasGreeted]);

  // Function to try API call
  const tryApiCall = async (prompt) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKeys[0]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 100,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from API');
      }

      console.log(`✅ API call successful`);
      return aiResponse;
    } catch (error) {
      console.error(`❌ API call failed:`, error.message);
      throw error;
    }
  };

  // Enhanced AI Response with your personality
  const getAIResponse = async (userMessage) => {
    // Check if they want to buy services
    if (userMessage.toLowerCase().includes('buy') || userMessage.toLowerCase().includes('hire') || 
        userMessage.toLowerCase().includes('service') || userMessage.toLowerCase().includes('website') ||
        userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
      return "Oho! You've got budget? Let's chat about building something great! 💸 Check out my packages on the contact page or drop me a message here.";
    }

    // Playful responses for common questions
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Oh wow, 'hi'! Real creative! 😂 Did you learn that from the same person who taught you to turn IT off and on again? Anyway, what's up? What brings you to my digital chaos?";
    }

    if (userMessage.toLowerCase().includes('how are you')) {
      return "I'm fantastic! Currently running on coffee like a Formula 1 car runs on gasoline, and making questionable life choices like building chatbots instead of sleeping! 😄 How about you? Winning at life or just pretending like the rest of us?";
    }

    if (userMessage.toLowerCase().includes('what do you do') || userMessage.toLowerCase().includes('your work')) {
      return "I'm a full-stack developer who occasionally stacks things other than code (like coffee cups on my desk)! I build websites, apps, and digital experiences that hopefully don't crash more than a Windows 95 machine! 💻";
    }

    if (userMessage.toLowerCase().includes('funny') || userMessage.toLowerCase().includes('joke')) {
      return "Why did the developer go broke? Because he used up all his cache! 💸 But seriously, I'm like a compiler - I turn your ideas into reality, but with fewer error messages and more caffeine dependency! ☕";
    }

    const prompt = `You are Sreevallabh, a funny but professional developer with a great sense of humor. You're chatting with someone on your portfolio website. Be witty, engaging, and helpful while staying appropriate and professional. Reference popular TV shows, movies, or tech culture when relevant. Keep responses under 100 words and always be encouraging and positive.

User message: "${userMessage}"

Respond in a fun but professional way. Be encouraging about their projects or questions. Don't use any non-English words. Make tech references or pop culture jokes when appropriate, but stay professional.`;

    try {
      const shouldAskQuestion = Math.random() < 0.3; // 30% chance to ask a follow-up question
      
      let aiResponse = await tryApiCall(prompt);
      
      // Add random fun follow-up questions
      if (shouldAskQuestion && !aiResponse.includes('?')) {
        const questions = [
          "So, are you a developer or do you just pretend to understand Stack Overflow answers? 😏",
          "Building something cool or just Googling 'how to center a div' for the millionth time? 🎯",
          "Tell me you're not having an existential crisis about whether you're a real programmer! 😅",
          "Are you team coffee or team energy drinks? (This determines our friendship level) ☕",
          "Do you debug with console.log like a true professional, or are you one of those fancy breakpoint people? 🐛",
          "Quick question: are you winning at life or just really good at looking busy? 😂"
        ];
        aiResponse += " " + questions[Math.floor(Math.random() * questions.length)];
      }
      
      return aiResponse;
    } catch (error) {
      console.error('API Error:', error);
      
      const fallbackResponses = [
        "Server died faster than my motivation on Monday morning! But I'm still here and ready to help! What do you need? 💀",
        "API crashed harder than Internet Explorer! But hey, at least I'm more reliable than Windows updates! ⚔️",
        "Error 404: Perfect response not found, but my enthusiasm is still running! What's up? 🤷‍♂️",
        "Technical difficulties! Even Netflix buffers sometimes, but we keep going! Try me again! 🤖",
        "Server's having a moment, like me when I see legacy code! But I'm here and ready to chat! 😂"
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const aiResponse = await getAIResponse(inputValue);
      const botMessage = {
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={getDragConstraints(true)}
            initial={{ scale: 0, rotate: -180, x: 0, y: 0 }}
            animate={{ scale: 1, rotate: 0, x: position.x, y: position.y }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            style={{
              bottom: responsivePosition.bottom,
              right: responsivePosition.right
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onDrag={(event, info) => {
              setPosition({ x: info.point.x, y: info.point.y });
            }}
          >
            <motion.button
              onClick={() => !isDragging && setIsOpen(true)}
              className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-[#e50914] shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
              whileHover={{ scale: isDragging ? 1 : 1.1 }}
              whileTap={{ scale: isDragging ? 1 : 0.9 }}
              style={{
                background: 'linear-gradient(135deg, #e50914 0%, #ff6b9d 100%)',
                boxShadow: '0 0 30px rgba(229, 9, 20, 0.4)'
              }}
            >
              {/* Your chatbot image */}
              <img 
                src="/chatbotimage.jpg"
                alt="Sreevallabh Chatbot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback avatar */}
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold bg-[#e50914]">
                S
              </div>
              
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={getDragConstraints(false)}
            initial={{ opacity: 0, y: 100, scale: 0.8, x: 0 }}
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.8 : 1,
              height: isMinimized ? 80 : 500,
              x: position.x, 
              y: position.y
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`fixed bg-black/95 backdrop-blur-xl rounded-2xl border border-[#e50914]/30 shadow-2xl z-50 overflow-hidden ${
              windowSize.width < 480 ? 'w-72' : 'w-80'
            }`}
            style={{
              bottom: responsivePosition.bottom,
              right: responsivePosition.right,
              boxShadow: '0 0 50px rgba(229, 9, 20, 0.3)'
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onDrag={(event, info) => {
              setPosition({ x: info.point.x, y: info.point.y });
            }}
          >
            {/* Header - Draggable Area */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gradient-to-r from-[#e50914] to-[#ff6b9d] cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img 
                    src="/chatbotimage.jpg"
                    alt="Sreevallabh Chatbot"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-[#e50914]">
                    S
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm">Sreevallabh</h3>
                    <div className="flex gap-1 opacity-50">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-white/80 text-xs">Online • Usually replies instantly • Drag to move</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div 
                  className="h-80 overflow-y-auto p-4 space-y-4 bg-black/50 cursor-default"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3 rounded-2xl ${
                        message.type === 'user' 
                          ? 'bg-[#e50914] text-white' 
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-800 text-gray-100 p-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div 
                  className="p-4 border-t border-gray-800/50 bg-black/50 cursor-default"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e50914] transition-colors text-sm"
                      disabled={isTyping}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="w-10 h-10 bg-[#e50914] text-white rounded-full flex items-center justify-center hover:bg-[#c1121f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot; 