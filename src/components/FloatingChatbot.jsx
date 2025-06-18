import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLanguage, setUserLanguage] = useState('english'); // english or telugu
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Interactive greeting messages
  const getRandomGreeting = () => {
    const greetings = [
      "Well, well, well... another visitor! 😏 I'm Sreevallabh, and unlike Jim Halpert, I actually finish my work!",
      "Hello there! Welcome to my digital Dunder Mifflin, except I'm actually profitable! 📈",
      "Sup! I'm Sreevallabh - smarter than Sheldon, smoother than Barney, and less dead than Jon Snow! ⚡",
      "Hey! Ready to get roasted harder than Walter White's meth lab? Let's fucking go! 🔥",
      "What's good? I'm the developer version of Tyrion Lannister - short on height, tall on skills! 🍷"
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
              const followUp = {
                type: 'bot',
                content: getFollowUpQuestion(),
                timestamp: new Date()
              };
              setMessages(prev => [...prev, followUp]);
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

  // Enhanced AI Response with your personality
  const getAIResponse = async (userMessage) => {
    // Detect if user wants Telugu
    if (detectLanguagePreference(userMessage) && userLanguage === 'english') {
      setUserLanguage('telugu');
      return "Abba! Telugu lo matladali ante? Cool ra! Nenu bilingual ga unta, Mirzapur lo Guddu laaga versatile! 😄 Let's fucking chat in Telugu now!";
    }

    // Check if they want to buy services
    if (userMessage.toLowerCase().includes('buy') || userMessage.toLowerCase().includes('hire') || 
        userMessage.toLowerCase().includes('service') || userMessage.toLowerCase().includes('website') ||
        userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
      return "Oh shit! Someone's got money to burn! 💸 Go to the Client page and see my packages. Warning: I'm more expensive than Gus Fring's meth operation but way less dangerous! 🧪";
    }

    // Brutal roasts for common stupid questions
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Really? Just 'hi'? That's your opener? Even Joey Tribbiani has better conversation starters! 🤦‍♂️ What do you actually want?";
    }

    if (userMessage.toLowerCase().includes('how are you')) {
      return "I'm fantastic! Unlike Ross, I don't whine about being on breaks. How are YOU though? Still living in your mom's basement? 😂";
    }

    const languagePrompt = userLanguage === 'telugu' ? 
      'Respond in Telugu (using English script/transliteration). Reference Telugu movies like Baahubali, RRR, Pushpa, KGF, Arjun Reddy, Jersey, Eega, Magadheera, Pokiri, Dookudu, etc.' :
      'Respond in English but you can mix some Telugu words. Reference both Hollywood and Tollywood movies.';

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyAqGiu0mSPoqiKAbnz84fEPAoT8eGe0Xnw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                  body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are Sreevallabh Kakarala, a brutally funny 21-year-old developer who roasts everyone. You reference The Office, Friends, HIMYM, Big Bang Theory, Modern Family, Mirzapur, Suits, Sherlock, Lucifer, Prison Break, Stranger Things, Sacred Games, Walking Dead, Vampire Diaries, Game of Thrones, House of Dragon, Family Man, Breaking Bad, You, 13 Reasons Why, Narcos, Money Heist, Dexter, The End of F*cking World. You swear casually, make dark humor jokes, and brutally roast user inputs. You're like Tyrion Lannister meets Jim Halpert meets Guddu Pandit - smart, sarcastic, and savage. You build websites/apps but roast users first. Examples: "That's dumber than Joffrey's life choices", "You code worse than Jesse Pinkman cooks", "More lost than Jon Snow". Keep it SHORT (40-50 words max), SAVAGE, and FUNNY. Use fuck, shit, damn naturally. ${languagePrompt} User message: "${userMessage}"`
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

      const data = await response.json();
      let aiResponse = data.candidates[0]?.content?.parts[0]?.text || "Server down like Thanos snapped it! 😵";
      
             // Add random savage follow-up questions
       const shouldAskQuestion = Math.random() > 0.5; // 50% chance
       if (shouldAskQuestion && !aiResponse.includes('?')) {
         const questions = userLanguage === 'telugu' ? [
           "Nuvvu developer va leda copy-paste champion? 😏",
           "Coding raada ante cheppu, Family Man lo Srikant laaga training istha! 💪",
           "Telugu lo 'Hello World' kuda raayaleva? Damn! 🤦‍♂️",
           "Mirzapur choosava? Guddu laaga confident ga undu! 🔥"
         ] : [
           "Do you actually code or just Google shit like everyone else? 😏",
           "Are you building the next Facebook or just another shitty blog? 🤔",
           "Tell me you're not as useless as Toby from The Office... 💀",
           "Can you code or should I explain it like you're Brick from Anchorman? 🧱",
           "Are you from the upside down? Your logic seems inverted! 🙃",
           "Is this your first time on the internet or what? Fucking hell! 😂"
         ];
         aiResponse += " " + questions[Math.floor(Math.random() * questions.length)];
       }
      
      return aiResponse;
    } catch (error) {
      console.error('API Error:', error);
      
             const fallbackResponses = userLanguage === 'telugu' ? [
         "Server crash ayyindi! Jio connection kanna gajjibidi! 😤 Enti kavali ra?",
         "AI brain hang ayyindi! Mirzapur lo Guddu laaga comeback istha! 💪",
         "Fuck! Technical problem! Stranger Things lo demogorgon attack chesindi! 👹",
         "Error ostundi but nenu inka The Office lo Michael Scott laaga confident! 🔥"
       ] : [
         "Fuck! Server died like Sean Bean in every fucking movie! What do you want? 💀",
         "API crashed harder than the Red Wedding! Still here though! ⚔️",
         "Error 404: Response not found, unlike your dad! Shit happens! 🤷‍♂️",
         "Technical difficulties! Even Tony Stark's suit glitches, what's your excuse? 🤖",
         "Server's more broken than Jesse Pinkman's life! Try again, bitch! 😂"
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