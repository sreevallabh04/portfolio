import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, LogOut, UserCheck, Bot, Trash2, ArrowLeft } from 'lucide-react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesChannelRef = useRef(null);
  const sessionsChannelRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('is_active', true)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (!error && data) {
      // For each session, get the last message and unread count
      const enriched = await Promise.all(
        data.map(async (session) => {
          const { data: msgs } = await supabase
            .from('messages')
            .select('content, sender, created_at')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)
            .eq('sender', 'visitor');

          return {
            ...session,
            lastMessage: msgs?.[0] || null,
            visitorMessageCount: count || 0,
          };
        })
      );
      setSessions(enriched);
    }
  }, []);

  // Subscribe to sessions realtime
  useEffect(() => {
    if (!authenticated) return;

    fetchSessions();

    sessionsChannelRef.current = supabase
      .channel('admin-sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_sessions' },
        () => {
          fetchSessions();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      if (sessionsChannelRef.current) {
        supabase.removeChannel(sessionsChannelRef.current);
      }
    };
  }, [authenticated, fetchSessions]);

  // Fetch messages for a session
  const fetchMessages = useCallback(async (sessionId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  }, []);

  // Select a session
  const selectSession = useCallback(
    async (session) => {
      setSelectedSession(session);
      await fetchMessages(session.id);

      // Unsubscribe previous
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
      }

      // Subscribe to messages for this session
      messagesChannelRef.current = supabase
        .channel(`admin-messages:${session.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `session_id=eq.${session.id}`,
          },
          (payload) => {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe();
    },
    [fetchMessages]
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle admin takeover
  const toggleTakeover = async () => {
    if (!selectedSession) return;
    const newState = !selectedSession.admin_active;

    await supabase
      .from('chat_sessions')
      .update({ admin_active: newState })
      .eq('id', selectedSession.id);

    setSelectedSession((prev) => ({ ...prev, admin_active: newState }));
  };

  // Send admin reply
  const sendReply = async () => {
    if (!replyInput.trim() || !selectedSession || sending) return;
    setSending(true);

    try {
      await supabase.from('messages').insert([
        { session_id: selectedSession.id, content: replyInput.trim(), sender: 'admin' },
      ]);

      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedSession.id);

      setReplyInput('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  // Close a session
  const closeSession = async (sessionId) => {
    await supabase
      .from('chat_sessions')
      .update({ is_active: false, admin_active: false })
      .eq('id', sessionId);

    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
      setMessages([]);
    }
    fetchSessions();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current);
      if (sessionsChannelRef.current) supabase.removeChannel(sessionsChannelRef.current);
    };
  }, []);

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 rounded-xl p-8 w-full max-w-sm border border-zinc-800">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400 text-sm mb-6">Enter password to access the live chat dashboard.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4 text-base"
            autoFocus
          />
          {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sessions sidebar */}
      <div
        className={`${
          selectedSession && window.innerWidth < 768 ? 'hidden' : 'flex'
        } flex-col w-full md:w-80 lg:w-96 border-r border-zinc-800 bg-zinc-950 flex-shrink-0`}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Live Sessions</h2>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No active sessions</p>
              <p className="text-xs mt-1">Sessions appear when visitors start chatting.</p>
            </div>
          )}

          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => selectSession(session)}
              className={`p-4 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-900 transition-colors ${
                selectedSession?.id === session.id ? 'bg-zinc-900 border-l-2 border-l-red-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
                    V
                  </div>
                  <span className="font-medium text-sm">{session.visitor_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {session.admin_active && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">LIVE</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSession(session.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                    title="Close session"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 truncate">
                {session.lastMessage
                  ? `${session.lastMessage.sender === 'visitor' ? 'Visitor' : session.lastMessage.sender === 'admin' ? 'You' : 'AI'}: ${session.lastMessage.content}`
                  : 'New session'}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">
                {session.last_message_at
                  ? new Date(session.last_message_at).toLocaleString()
                  : new Date(session.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat view */}
      <div className="flex-1 flex flex-col min-h-0">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Select a session to view</p>
              <p className="text-sm">Click on a session from the sidebar to see the conversation.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="md:hidden text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold">
                  V
                </div>
                <div>
                  <h3 className="font-semibold">{selectedSession.visitor_name}</h3>
                  <p className="text-xs text-gray-400">
                    Session started {new Date(selectedSession.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleTakeover}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedSession.admin_active
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'
                }`}
              >
                {selectedSession.admin_active ? (
                  <>
                    <UserCheck size={16} /> You are live
                  </>
                ) : (
                  <>
                    <Bot size={16} /> AI is handling
                  </>
                )}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'visitor' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.sender === 'visitor'
                        ? 'bg-zinc-800 text-white'
                        : msg.sender === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 text-gray-200'
                    }`}
                  >
                    <p className="text-[10px] mb-1 opacity-60 font-semibold">
                      {msg.sender === 'visitor' ? 'Visitor' : msg.sender === 'admin' ? 'You' : 'AI'}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[10px] opacity-50 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex-shrink-0">
              {!selectedSession.admin_active ? (
                <div className="text-center text-gray-500 text-sm py-2">
                  Toggle <span className="font-semibold text-blue-400">"Take Over"</span> to start replying manually. AI is currently handling this chat.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    placeholder="Type your reply..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                    disabled={sending}
                    autoFocus
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyInput.trim() || sending}
                    className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
