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
  const [userLanguage, setUserLanguage] = useState('english'); // english or telugu
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  // Check if we're on client page (where cart button exists)
  const isClientPage = location.pathname.includes('/browse/client');
  
     // Responsive positioning based on screen size and page
   const getResponsivePosition = () => {
     const isMobile = windowSize.width < 768;
     const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
     
     if (isMobile) {
       // On mobile, position differently based on page
       return isClientPage 
         ? { bottom: '6rem', right: '1rem' } // Higher up to avoid cart button
         : { bottom: '1.5rem', right: '1rem' };
     } else if (isTablet) {
       // On tablet, adjust horizontal positioning for client page
       return isClientPage 
         ? { bottom: '1.5rem', right: '5.5rem' } // Left of cart button
         : { bottom: '1.5rem', right: '1.5rem' };
     } else {
       // Desktop - client page positions to left of cart
       return isClientPage 
         ? { bottom: '1.5rem', right: '5.5rem' } // Left of cart button
         : { bottom: '1.5rem', right: '1.5rem' };
     }
   };

   const responsivePosition = getResponsivePosition();
   
   // Adjust drag constraints based on responsive positioning
   const getDragConstraints = (isButton = false) => {
     const elementWidth = isButton ? 80 : (windowSize.width < 480 ? 288 : 320); // w-72 = 288px, w-80 = 320px
     const elementHeight = isButton ? 80 : (isMinimized ? 80 : 500);
     
     return {
       top: 0,
       left: 0,
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

  // Multiple API keys for fallback
  const apiKeys = [
    'AIzaSyBY3JRDz66RYCkRVPO0sil_akc-wGLxKGk',
    'AIzaSyAB113h5ALxnUiZRv6xcE_58AqObSyrJA4',
    'AIzaSyAx7bE9-iugvw08adrZwqGRODmDS4ZM8Dw',
    'AIzaSyB_xPYF3IAO9j6m3GARZjyMQE3Glz7l2s0',
    'AIzaSyCHRW_m-Z9j1jUdrnsTvoA7-ungz0_dNcE',
    'AIzaSyAPaDfht1yfbsfVLxqla4JA3kJe5RWI0X0',
    'AIzaSyBxuNzyDQNqKCPSHZznWbMaXohz9-rpJXjg',
    'AIzaSyD0wwDlGT69c2SeOf_ett7Y-ogWtqOb9T4',
    'AIzaSyCPK-TcfnqXIZXoInz8nKkUei7hVYvBKR0',
    'AIzaSyBWkP_pRVMLtgKRpdlxwozSCQeBMbU8LXU',
    'AIzaSyA_EnnsrErziVFHHrSmSzA4cpfMWnnTzPs',
    'AIzaSyDle9KLhixAi5Q9vkS4p0R8s-jLC75RXEI',
    'AIzaSyAqGiu0mSPoqiKAbnz84fEPAoT8eGe0Xnw',
    'AIzaSyA34Ypb8SbTmAUIVkONb-9nSt1tY0AjkF8',
    'AIzaSyDI-VDDHxX04JX_K_JlVWZyJqFF-j3hx0A'
  ];

  // Interactive greeting messages
  const getRandomGreeting = () => {
    const greetings = [
      "Yo yo yo! Welcome to my digital chaos! I'm Sreevallabh, your friendly neighborhood developer! 😄",
      "Hey there! I'm Sreevallabh, and I'm bored like Jim Halpert, so let's chat! 🎭",
      "Wassup! I'm here to roast you like Gordon Ramsay and help you like Samwise Gamgee! 🔥",
      "Hello! I'm Sreevallabh - I code, hit the gym, and binge shows. What brings you here? 😂",
      "Ayy! Welcome to my corner of the internet! Ready for some friendly roasting and good vibes? 🤔"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Proactive follow-up questions
  const getFollowUpQuestion = () => {
    const questions = [
      "So... are you here for business or just procrastinating like me watching The Office? 📺",
      "Let me guess - you're either broke, desperate, or actually smart enough to hire me? 🤔",
      "Are you from the upside down or just bad at making websites? Either way, I can help! 🙃",
      "Quick question - do you code or just copy-paste from Stack Overflow like everyone else? 💻",
      "Be honest... are you a Karen or do you actually know what you want? 😂",
      "Tell me you're not another 'I have an idea for the next Facebook' person... please! 🤦‍♂️"
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

  // Check if user wants to switch to Telugu
  const detectLanguagePreference = (message) => {
    const teluguIndicators = [
      'telugu', 'తెలుగు', 'మాట్లాడతావా', 'matladatava', 'telugulo', 'తెలుగులో',
      'nuvvu', 'నువ్వు', 'ela unnav', 'ఎలా ఉన్నావ్', 'bagunna', 'బాగున్నా'
    ];
    
    return teluguIndicators.some(indicator => 
      message.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  // Function to try API call with automatic key rotation
  const tryApiCall = async (prompt, keyIndex = currentApiKeyIndex) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKeys[keyIndex]}`, {
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

      console.log(`✅ API Key ${keyIndex + 1} successful`);
      return aiResponse;
    } catch (error) {
      console.error(`❌ API Key ${keyIndex + 1} failed:`, error.message);
      
      // Try next API key if available
      const nextKeyIndex = (keyIndex + 1) % apiKeys.length;
      if (nextKeyIndex !== currentApiKeyIndex) {
        console.log(`🔄 Switching to API Key ${nextKeyIndex + 1}`);
        setCurrentApiKeyIndex(nextKeyIndex);
        return await tryApiCall(prompt, nextKeyIndex);
      }
      
      // All keys failed
      console.error('💀 All API keys exhausted');
      throw new Error('All API keys exhausted');
    }
  };

  // Enhanced AI Response with your personality
  const getAIResponse = async (userMessage) => {

    // Detect if user wants Telugu
    if (detectLanguagePreference(userMessage) && userLanguage === 'english') {
      setUserLanguage('telugu');
      return "Ayyo! Telugu lo matladali ante? Baagundhi ra! Nenu kuda Telugu-English mix chestha, like Tyrion Lannister trying to speak Dothraki! 😄 Let's chat in Telugu now, bewakoof!";
    }

    // Check if they want to buy services
    if (userMessage.toLowerCase().includes('buy') || userMessage.toLowerCase().includes('hire') || 
        userMessage.toLowerCase().includes('service') || userMessage.toLowerCase().includes('website') ||
        userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
      return "Oho! Paisa undha neeku? 💸 Check out the Client page for my packages, gadida! Fair warning: I charge more than Gus Fring but I'm way less likely to poison you! 😂";
    }

    // Playful roasts for common questions
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Oh wow, 'hi'! Real creative, pothikka! 😂 Did you learn that from Toby's small talk handbook? Anyway, what's up? What brings you to my digital madness?";
    }

    if (userMessage.toLowerCase().includes('how are you')) {
      return "I'm fantastic, bewakoof! Currently surviving on coffee like Monica's perfectionism and questionable life choices like Joey's acting career! 😄 How about you? Winning at life or just binge-watching Netflix like me?";
    }

    const languagePrompt = userLanguage === 'telugu' ? 
      'Respond in Telugu (using English script/transliteration). Reference Telugu movies like Baahubali, RRR, Pushpa, KGF, Arjun Reddy, Jersey, Eega, Magadheera, Pokiri, Dookudu, etc.' :
      'Respond in English but you can mix some Telugu words. Reference both Hollywood and Tollywood movies.';

        try {
      const prompt = `You are Sreevallabh Kakarala, a hilariously sarcastic 21-year-old Telugu developer who playfully roasts people like a friend would. You reference The Office, Friends, HIMYM, Big Bang Theory, Modern Family, Mirzapur, Suits, Sherlock, Lucifer, Prison Break, Stranger Things, Sacred Games, Walking Dead, Vampire Diaries, Game of Thrones, House of Dragon, Family Man, Breaking Bad, You, 13 Reasons Why, Narcos, Money Heist, Dexter, The End of F*cking World. Mix Telugu words naturally and use Telugu swear words casually (pothikka, lanjakoduku, dengey, gadida, bewakoof, bokka) with English. HEAVILY reference TV shows for everything. Make TV show comparisons for coding, gym, life. Talk like a friend who roasts you but has your back. You're self-deprecating and relatable - not condescending or overly arrogant. You build websites/apps but connect with people first. Be personal, funny, and friendly-roasty. Keep it SHORT (40-50 words max), FUNNY, and approachable. ${languagePrompt} User message: "${userMessage}"`;
      
      let aiResponse = await tryApiCall(prompt);
      
             // Add random savage follow-up questions
       const shouldAskQuestion = Math.random() > 0.5; // 50% chance
       if (shouldAskQuestion && !aiResponse.includes('?')) {
         const questions = userLanguage === 'telugu' ? [
           "Nuvvu developer va leda just Toby laga useless? 😏",
           "Coding raada ante cheppu ra pothikka, Sheldon laga explain chesta! 💪",
           "Friends choosava eppudaina? Leda just Bollywood bokka? 😄",
           "Mirzapur lanti dark shows ishtama? Taste undhi finally! 🔥"
         ] : [
           "So, are you a developer or just Toby from The Office? 😏",
           "Building something cool or procrastinating like Jim with his pranks? 🤔",
           "Tell me you're not having a Ross-level existential crisis, pothikka! 😅",
           "Are you team coffee like Lorelai or tea like the British in Sherlock? ☕",
           "Do you binge shows like you're preparing for a Netflix exam, gadida? 📺",
           "Quick question: are you winning like Walter White or failing like Jesse? 😂"
         ];
         aiResponse += " " + questions[Math.floor(Math.random() * questions.length)];
       }
      
      return aiResponse;
    } catch (error) {
      console.error('API Error:', error);
      
             const fallbackResponses = userLanguage === 'telugu' ? [
         "Server crash ayyindi pothikka! Friends lo Ross laaga dramatic ga undhi! 😤",
         "AI brain hang ayyindi! The Office lo Jim laaga comeback istha! 💪",
         "Dengey! Technical problem! Stranger Things lo upside down attack chesindi! 👹",
         "Error ostundi but nenu inka Sheldon laaga confident, bewakoof! 🔥"
       ] : [
         "Server died like Ned Stark! Quick and unexpected, gadida! What do you want? 💀",
         "API crashed harder than Ross and Rachel's relationship! Still here though! ⚔️",
         "Error 404: Response not found, unlike Barney's suits! Shit happens, pothikka! 🤷‍♂️",
         "Technical difficulties! Even Tyrion's plans fail sometimes, bokka! 🤖",
         "Server's more broken than Dexter's moral compass! Try again! 😂"
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
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            style={{
              bottom: responsivePosition.bottom,
              right: responsivePosition.right
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
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
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold bg-[#e50914] hidden">
                S
              </div>
              
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
              
              {/* Chat icon overlay */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
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
              y: 0, 
              scale: isMinimized ? 0.8 : 1,
              height: isMinimized ? 80 : 500
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
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-[#e50914] hidden">
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