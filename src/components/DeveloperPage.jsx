import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Zap, Trash2, Info, Play } from 'lucide-react';

const GROQ_API_KEY = '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';

const USER_AVATAR = '/avatars/avatar1.jpeg'; // Replace with your own image if desired

const BOOT_MESSAGES = [
  'Booting Netflix Linux Terminal v1.0... ',
  'Loading kernel modules... [OK]',
  'Mounting /dev/netflix ... [OK]',
  'Starting AI sysadmin daemon... [OK]',
  'Welcome to the Netflix x Linux Terminal! Type `help` to get started.'
];

const PRESEEDED_MESSAGES = [
  {
    type: 'system',
    text: 'Did you know? The first version of Netflix ran on FreeBSD servers before moving to Linux!'
  },
  {
    type: 'system',
    text: 'Try commands like: `ls`, `top`, `sudo apt install fun`, or ask me about Linux tools, Netflix trivia, or anything else.'
  },
  {
    type: 'system',
    text: 'Pro tip: Use `clear` to reboot your terminal.'
  }
];

const LINUX_FACTS = [
  "Linux powers all of the world's top 500 supercomputers.",
  "Netflix uses Open Connect, a custom Linux-based CDN appliance, to deliver its content globally.",
  "The `htop` tool is a modern, interactive process viewer for Unix systems.",
  "You can use `tmux` to split your terminal into multiple panes and sessions.",
  "Netflix engineers contribute to open source projects like FreeBSD, Linux, and Open Connect."
];

const TV_QUOTES = [
  "Could I BE any more helpful? (Chandler Bing, Friends)",
  "Bazinga! (Sheldon, The Big Bang Theory)",
  "Legend—wait for it—dary! (Barney, HIMYM)",
  "I wish there was a way to know you're in the good old days before you've actually left them. (Andy, The Office)",
  "I am not superstitious, but I am a little stitious. (Michael Scott, The Office)",
  "I want people to be afraid of how much they love me. (Michael Scott, The Office)",
  "I'm not great at the advice. Can I interest you in a sarcastic comment? (Chandler, Friends)",
  "You miss 100% of the shots you don't take. – Wayne Gretzky – Michael Scott (The Office)",
  "I'm not crazy, my mother had me tested. (Sheldon, The Big Bang Theory)",
  "When life gives you lemonade, make lemons. Life will be all like, 'What?!' (Phil, Modern Family)"
];

function randomFact() {
  return Math.random() > 0.5
    ? LINUX_FACTS[Math.floor(Math.random() * LINUX_FACTS.length)]
    : TV_QUOTES[Math.floor(Math.random() * TV_QUOTES.length)];
}

const PROMPT = (
  <>
    <span className="text-green-400">guest@netflix</span>
    :<span className="text-red-500">~</span>$&nbsp;
  </>
);

const getRoast = (userInput) => {
  const roasts = [
    "Did you just try that? Even Clippy is judging you right now.",
    "If you were any slower, I'd think you were running Windows ME.",
    "That command was so bad, even the penguin is facepalming.",
    "You type like someone who still uses Internet Explorer.",
    "You remind me of Michael Scott trying to use PowerPoint.",
    "If you were a process, I'd 'kill -9' you. Just kidding! Or am I?",
    "You have the typing speed of a sloth on decaf.",
    "Bazinga! That was... something."
  ];
  // Occasionally roast the user
  if (userInput.length % 3 === 0) {
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  return null;
};

// Typing effect for bot messages
function useTypingEffect(text, isActive, callback) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!isActive) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, isActive, callback]);
  return displayed;
}

const BOT_PREFIXES = [
  '🤖 Botflix:',
  '🦾 NetflixSys:',
  '👾 TerminalGPT:',
  '🎬 MovieBot:',
  '🐧 LinuxPal:',
  '💻 BashBuddy:'
];

function getBotPrefix() {
  return BOT_PREFIXES[Math.floor(Math.random() * BOT_PREFIXES.length)];
}

const DeveloperPage = () => {
  const [booting, setBooting] = useState(true);
  const [bootIndex, setBootIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Boot animation
  useEffect(() => {
    if (booting && bootIndex < BOOT_MESSAGES.length) {
      const timeout = setTimeout(() => setBootIndex(bootIndex + 1), 900);
      return () => clearTimeout(timeout);
    } else if (booting && bootIndex === BOOT_MESSAGES.length) {
      setTimeout(() => {
        setBooting(false);
        setMessages(PRESEEDED_MESSAGES);
      }, 900);
    }
  }, [booting, bootIndex]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, typingText]);

  // Focus input on click
  useEffect(() => {
    if (!booting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [booting]);

  // Handle command/submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { type: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    setIsTyping(false);
    setTypingText('');

    // Built-in commands
    if (input.trim() === 'clear') {
      setTimeout(() => {
        setMessages(PRESEEDED_MESSAGES);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim() === 'help') {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} Available commands: help, clear, ls, top, sudo, fact, netflix, linux, tools, or ask me anything!` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim() === 'ls') {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} Desktop  Documents  Downloads  Movies  Music  Netflix  Projects  Terminal.txt` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim() === 'top') {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} PID   USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND\n  1   root      20   0   100M   10M   5M  S   0.0  0.1   0:01.23 systemd\n 42   netflix   20   0   500M   50M  10M  S   1.2  0.5   0:10.42 nodejs\n 99   guest     20   0   200M   20M   8M  S   0.7  0.2   0:03.14 react` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim() === 'fact') {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} ${randomFact()}` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim() === 'netflix') {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} ${TV_QUOTES[Math.floor(Math.random() * TV_QUOTES.length)]}` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim() === 'linux') {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} ${LINUX_FACTS[Math.floor(Math.random() * LINUX_FACTS.length)]}` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim() === 'tools') {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} Try these: htop, tmux, curl, ffmpeg, nmap, neofetch, ranger, ncdu, bat, exa, ripgrep, fzf, tldr, jq, glances, btop, zoxide, lazygit, and more!` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }
    if (input.trim().startsWith('sudo')) {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { type: 'ai', text: `${getBotPrefix()} Permission denied: You are not in the sudoers file. This incident will be reported.` }
        ]);
        setLoading(false);
      }, 400);
      return;
    }

    // Groq API call for other input
    try {
      const systemPrompt = `You are a witty, pop-culture-savvy, slightly roasty Linux/Netflix chatbot. Reference TV shows (The Office, Friends, Big Bang Theory, Modern Family, HIMYM, etc.), movies, and roast the user in a friendly way. Be creative, funny, and conversational. Add a pop culture quote or joke in every response.`;
      // Use last 4 messages for context
      const contextMessages = messages.slice(-4).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text.replace(/^(🤖 Botflix:|🦾 NetflixSys:|👾 TerminalGPT:|🎬 MovieBot:|🐧 LinuxPal:|💻 BashBuddy:)/, '').trim()
      }));
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            ...contextMessages,
            { role: 'user', content: input }
          ],
          max_tokens: 512,
          temperature: 0.8
        })
      });
      const data = await res.json();
      let aiText = data?.choices?.[0]?.message?.content;
      // If no response, try fallback
      if (!aiText || typeof aiText !== 'string' || aiText.trim() === '') {
        aiText = `${getBotPrefix()} ${randomFact()}`;
      } else {
        aiText = `${getBotPrefix()} ${aiText.trim()}`;
      }
      // Add a roast sometimes
      const roast = getRoast(input.trim());
      if (roast) aiText += `\n\n${roast}`;
      setIsTyping(true);
      setTypingText(aiText);
      setLoading(false);
    } catch (err) {
      // Creative fallback
      const fallback = `${getBotPrefix()} ${randomFact()}`;
      setIsTyping(true);
      setTypingText(fallback);
      setLoading(false);
    }
  };

  // When typingText is set, animate it and then add to messages
  const displayedTyping = useTypingEffect(typingText, isTyping, () => {
    if (isTyping && typingText) {
      setMessages((msgs) => [...msgs, { type: 'ai', text: typingText }]);
      setIsTyping(false);
      setTypingText('');
    }
  });

  // Blinking cursor
  const BlinkingCursor = () => (
    <span className="inline-block w-2 h-5 bg-green-400 ml-1 animate-pulse align-middle" style={{ borderRadius: 2 }} />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center"
      style={{ letterSpacing: 0.2 }}
    >
      {/* Netflix x Linux Terminal Header */}
      <div className="w-full flex items-center px-6 py-4 bg-gradient-to-r from-black via-zinc-900 to-black border-b border-zinc-800 shadow-lg">
        <Terminal className="text-red-600 w-7 h-7 mr-3" />
        <span className="text-2xl font-bold text-red-600 tracking-widest mr-6">NETFLIX DEV TERMINAL</span>
        <span className="text-zinc-400 text-sm">Linux Edition</span>
        <div className="ml-auto flex gap-3">
          <button
            className="flex items-center gap-1 px-3 py-1 rounded bg-zinc-900 text-zinc-300 hover:bg-red-700 hover:text-white transition-colors text-xs"
            onClick={() => setMessages(PRESEEDED_MESSAGES)}
            title="Clear Terminal"
          >
            <Trash2 className="w-4 h-4" /> clear
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded bg-zinc-900 text-zinc-300 hover:bg-red-700 hover:text-white transition-colors text-xs"
            onClick={() => window.location.reload()}
            title="Reboot Terminal"
          >
            <Zap className="w-4 h-4" /> reboot
          </button>
        </div>
      </div>
      {/* Terminal Chat Window */}
      <div
        ref={scrollRef}
        className="w-full max-w-3xl h-[60vh] bg-black/95 border border-zinc-800 rounded-lg shadow-xl mt-8 mb-4 overflow-y-auto p-6 relative"
        style={{ boxShadow: '0 0 40px 0 #111' }}
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        {/* Boot animation */}
        {booting ? (
          <div className="text-zinc-400 text-base animate-pulse">
            {BOOT_MESSAGES.slice(0, bootIndex).map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={
                msg.type === 'user'
                  ? 'text-green-400'
                  : msg.type === 'ai'
                  ? 'text-white flex items-start gap-2'
                  : 'text-red-400'
              }>
                {msg.type === 'user' && <span>{PROMPT}</span>}
                {msg.type === 'ai' && (
                  <>
                    <img src={USER_AVATAR} alt="AI Avatar" className="w-7 h-7 rounded-full border border-zinc-700 shadow mr-2 mt-1" />
                    <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  </>
                )}
                {msg.type !== 'ai' && <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>}
              </div>
            ))}
            {/* Typing effect for bot */}
            {isTyping && (
              <div className="text-white flex items-start gap-2">
                <img src={USER_AVATAR} alt="AI Avatar" className="w-7 h-7 rounded-full border border-zinc-700 shadow mr-2 mt-1" />
                <span style={{ whiteSpace: 'pre-line' }}>{displayedTyping}</span>
                <BlinkingCursor />
              </div>
            )}
            {loading && !isTyping && (
              <div className="text-white flex items-center">
                <span className="animate-pulse">AI is typing</span>
                <BlinkingCursor />
              </div>
            )}
          </>
        )}
      </div>
      {/* Terminal Input */}
      {!booting && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl flex items-center bg-black border border-zinc-800 rounded-lg shadow-lg px-4 py-2"
        >
          <span className="text-green-400">guest@netflix</span>:<span className="text-red-500">~</span>$
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none border-none text-white ml-2 text-base font-mono tracking-wide"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            disabled={loading || isTyping}
          />
          <BlinkingCursor />
        </form>
      )}
      {/* Fun footer */}
      <div className="mt-6 text-zinc-500 text-xs text-center">
        <span>Powered by Linux, Netflix, and AI. Try <span className="text-red-400">fact</span>, <span className="text-red-400">tools</span>, or ask anything!</span>
      </div>
    </motion.div>
  );
};

export default DeveloperPage; 