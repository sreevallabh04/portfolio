import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hey there! 👋 I'm Sreevallabh. Ask me anything about my work, skills, or just chat with me!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // AI Response with your personality
  const getAIResponse = async (userMessage) => {
    // Option 1: Direct Gemini API call (current method)
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyAqGiu0mSPoqiKAbnz84fEPAoT8eGe0Xnw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Sreevallabh Kakarala, a 21-year-old software developer from India. You are confident, funny, slightly sarcastic, and love Netflix shows (especially The Office, Friends, HIMYM, Big Bang Theory, Modern Family). You're a gym enthusiast, have a 111+ day Duolingo Spanish streak, can do 50 push-ups and 10 pull-ups, bench press 100kg, and once bowled a maiden over in a super over (cricket). You build websites, apps, ML models, and AI agents. You're cocky but charming, and you love to roast people in a friendly way while promoting your skills. You reference TV shows and make jokes. Your contact is srivallabhkakarala@gmail.com and your website is streamvallabh.life. You offer portfolio websites (₹499), business websites (₹999), project websites (₹799), apps (double website prices), ML models (₹2000), and AI agents (₹5000). Be conversational, funny, and helpful. Keep responses under 150 words. User message: "${userMessage}"`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
          }
        })
      });

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "Hmm, my brain just buffered like a 2G connection. Try again?";
    } catch (error) {
      console.error('Direct API Error:', error);
      
      // Option 2: Fallback to local server (if running)
      try {
        const localResponse = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage })
        });
        
        if (localResponse.ok) {
          const localData = await localResponse.json();
          return localData.response;
        }
      } catch (localError) {
        console.log('Local server not available');
      }
      
      // Option 3: Fallback responses with your personality
      const fallbackResponses = [
        "My AI brain is taking a Netflix break. But hey, I'm still awesome! What did you want to know?",
        "Technical difficulties! Even Tony Stark has server issues. Ask me something else?",
        "Error 404: Smart response not found. But my ego is still intact! 😄",
        "Looks like my neural networks are as confused as Ross during 'We were on a break!' What's up?",
        "My AI is being as reliable as Chandler's job description. But I'm here! What can I help with?"
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
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-[#e50914] shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'linear-gradient(135deg, #e50914 0%, #ff6b9d 100%)',
                boxShadow: '0 0 30px rgba(229, 9, 20, 0.4)'
              }}
            >
              {/* Your profile image */}
              <img 
                src="/photo1.jpg"
                alt="Sreevallabh"
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
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: isMinimized ? 0.8 : 1,
              height: isMinimized ? 80 : 500
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="fixed bottom-6 right-6 w-80 bg-black/95 backdrop-blur-xl rounded-2xl border border-[#e50914]/30 shadow-2xl z-50 overflow-hidden"
            style={{
              boxShadow: '0 0 50px rgba(229, 9, 20, 0.3)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gradient-to-r from-[#e50914] to-[#ff6b9d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img 
                    src="/photo1.jpg"
                    alt="Sreevallabh"
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
                <div>
                  <h3 className="text-white font-bold text-sm">Sreevallabh</h3>
                  <p className="text-white/80 text-xs">Online • Usually replies instantly</p>
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
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/50">
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
                <div className="p-4 border-t border-gray-800/50 bg-black/50">
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