import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SYSTEM_PROMPT } from '@/lib/knowledgeBase';
import emailjs from '@emailjs/browser';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const FloatingChatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [adminActive, setAdminActive] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const subscriptionRef = useRef(null);
  const sessionSubscriptionRef = useRef(null);

  const getResponsivePosition = () => {
    const isMobile = windowSize.width < 768;
    if (isMobile) {
      return { bottom: '1.5rem', right: '1rem' };
    }
    return { bottom: '1.5rem', right: '1.5rem' };
  };

  const responsivePosition = getResponsivePosition();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create session in Supabase and subscribe to realtime
  const createSession = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ visitor_name: 'Visitor', is_active: true, admin_active: false }])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);

      // Send email notification
      try {
        emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_name: 'Sreevallabh',
            from_name: 'Portfolio Chatbot',
            message: `New visitor started a chat session on your portfolio!\n\nSession ID: ${data.id}\nTime: ${new Date().toLocaleString()}\n\nHead to your admin panel to take over the conversation.`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.error('EmailJS notification failed:', emailErr);
      }

      // Subscribe to new messages for this session
      subscriptionRef.current = supabase
        .channel(`messages:${data.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `session_id=eq.${data.id}`,
          },
          (payload) => {
            const newMsg = payload.new;
            if (newMsg.sender === 'admin' || newMsg.sender === 'ai') {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [
                  ...prev,
                  {
                    id: newMsg.id,
                    type: 'bot',
                    content: newMsg.content,
                    sender: newMsg.sender,
                    timestamp: new Date(newMsg.created_at),
                  },
                ];
              });
              setIsTyping(false);
            }
          }
        )
        .subscribe();

      // Subscribe to session changes (admin_active toggling)
      sessionSubscriptionRef.current = supabase
        .channel(`session:${data.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_sessions',
            filter: `id=eq.${data.id}`,
          },
          (payload) => {
            setAdminActive(payload.new.admin_active);
          }
        )
        .subscribe();

      return data.id;
    } catch (err) {
      console.error('Failed to create chat session:', err);
      return null;
    }
  }, []);

  // When chat opens, create session if needed
  useEffect(() => {
    if (isOpen && !isMinimized && !sessionId) {
      createSession().then((id) => {
        if (id && !hasGreeted) {
          const greeting = {
            id: 'greeting',
            type: 'bot',
            sender: 'ai',
            content:
              "Hey there! I'm Sreevallabh's AI assistant. I can answer questions about his projects, skills, experience, and more. What would you like to know?",
            timestamp: new Date(),
          };
          setMessages([greeting]);
          setHasGreeted(true);
        }
      });
    }

    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized, sessionId, hasGreeted, createSession]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (sessionSubscriptionRef.current) {
        supabase.removeChannel(sessionSubscriptionRef.current);
      }
    };
  }, []);

  // AI response via Groq
  const getAIResponse = async (userMessage, conversationMsgs) => {
    const chatHistory = conversationMsgs
      .filter((m) => m.id !== 'greeting')
      .map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 400,
        top_p: 0.9,
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I don't have that information right now.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;
    const text = inputValue.trim();

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Store visitor message in Supabase
    try {
      await supabase.from('messages').insert([
        { session_id: sessionId, content: text, sender: 'visitor' },
      ]);

      // Update last_message_at
      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Failed to store message:', err);
    }

    // Check if admin is active -- if so, don't generate AI response
    try {
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select('admin_active')
        .eq('id', sessionId)
        .single();

      if (sessionData?.admin_active) {
        // Admin is active, they will reply. Keep typing indicator.
        return;
      }
    } catch (err) {
      console.error('Failed to check admin status:', err);
    }

    // AI generates response
    try {
      const allMessages = [...messages, userMessage];
      const aiText = await getAIResponse(text, allMessages);

      // Store AI message in Supabase (realtime will deliver it)
      await supabase.from('messages').insert([
        { session_id: sessionId, content: aiText, sender: 'ai' },
      ]);
    } catch (err) {
      console.error('AI response error:', err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: 'bot',
          sender: 'ai',
          content: "Sorry, I'm having trouble responding right now. Please try again!",
          timestamp: new Date(),
        },
      ]);
    }
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
            transition={{ type: 'spring', stiffness: 200 }}
            className="fixed z-50"
            style={{
              bottom: responsivePosition.bottom,
              right: responsivePosition.right,
            }}
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-[#e50914] shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'linear-gradient(135deg, #e50914 0%, #ff6b9d 100%)',
                boxShadow: '0 0 30px rgba(229, 9, 20, 0.4)',
              }}
            >
              <img
                src="/chatbotimage.jpg"
                alt="Chat"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="absolute inset-0 items-center justify-center text-white text-2xl font-bold bg-[#e50914]"
                style={{ display: 'none' }}
              >
                S
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
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
              scale: isMinimized ? 0.8 : 1,
              height: isMinimized ? 80 : 500,
              y: 0,
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`fixed bg-black/95 backdrop-blur-xl rounded-2xl border border-[#e50914]/30 shadow-2xl z-50 overflow-hidden ${
              windowSize.width < 480 ? 'w-72' : 'w-80'
            }`}
            style={{
              bottom: responsivePosition.bottom,
              right: responsivePosition.right,
              boxShadow: '0 0 50px rgba(229, 9, 20, 0.3)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gradient-to-r from-[#e50914] to-[#ff6b9d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  <img
                    src="/chatbotimage.jpg"
                    alt="Chat"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm">Sreevallabh</h3>
                  <p className="text-white/80 text-xs truncate">
                    {adminActive ? 'Sreevallabh is here' : 'AI Assistant'}
                    {' '}&bull;{' '}Online
                  </p>
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
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-[#e50914] text-white'
                            : message.sender === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        {message.sender === 'admin' && message.type !== 'user' && (
                          <p className="text-[10px] text-blue-200 mb-1 font-semibold">Sreevallabh</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-800 text-gray-100 p-3 rounded-2xl">
                        <p className="text-xs text-gray-400 mb-1">
                          {adminActive ? 'Sreevallabh is typing...' : 'AI is thinking...'}
                        </p>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                      onKeyDown={handleKeyPress}
                      placeholder="Ask about Sreevallabh..."
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
