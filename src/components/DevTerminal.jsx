import React, { useState, useRef } from 'react';

const DevTerminal = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSudoAccess, setHasSudoAccess] = useState(false);
  const [sudoEffect, setSudoEffect] = useState(false);
  const terminalRef = useRef(null);

  const handleCommand = async (cmd) => {
    setIsProcessing(true);
    let response = '';
    let type = 'info';

    if (cmd === 'raazi') {
      setSudoEffect(true);
      setHasSudoAccess(true);
      response = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🔐  SUDO ACCESS GRANTED  🔐                               ║
║                                                            ║
║  Welcome to the inner sanctum of the system.               ║
║  You now have full administrative privileges.              ║
║                                                            ║
║  Type 'help' to see available commands.                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `;
      type = 'success';
      setTimeout(() => setSudoEffect(false), 3000);
    } else if (cmd.startsWith('sudo ')) {
      if (!hasSudoAccess) {
        response = 'Permission denied: sudo access required.';
        type = 'error';
      } else {
        // Handle sudo commands here
        response = `[sudo] Executing: ${cmd.substring(5)}`;
        type = 'info';
      }
    } else if (cmd === 'clear') {
      setHistory([]);
      setIsProcessing(false);
      return;
    } else if (cmd === 'help') {
      response = `
Available commands:
  help              - Show this help message
  clear             - Clear terminal
  sudo <command>    - Execute command with sudo privileges
  raazi             - Grant sudo access
  exit              - Close terminal
  reveal-pin        - ???
      `;
    } else if (cmd === 'exit') {
      onClose();
      return;
    } else if (cmd === 'reveal-pin') {
      response = 'The secret PIN is: 1501';
      type = 'success';
    } else {
      response = `Command not found: ${cmd}`;
      type = 'error';
    }

    setHistory(prev => [...prev, { type: 'input', content: cmd }, { type, content: response }]);
    setInput('');
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-4xl bg-gray-900 rounded-lg shadow-2xl border border-gray-800 overflow-hidden transition-all duration-500 ${
          sudoEffect ? 'scale-105 shadow-green-500/50' : ''
        }`}
      >
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-gray-400 text-sm">DevTerminal</div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        
        <div 
          ref={terminalRef}
          className="h-[60vh] overflow-y-auto p-4 font-mono text-sm text-gray-300"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.98))',
            boxShadow: sudoEffect ? '0 0 30px rgba(34, 197, 94, 0.3)' : 'none'
          }}
        >
          {history.map((item, index) => (
            <div 
              key={index} 
              className={`mb-2 ${
                item.type === 'input' ? 'text-green-400' :
                item.type === 'error' ? 'text-red-400' :
                item.type === 'success' ? 'text-green-500' :
                'text-gray-300'
              }`}
            >
              {item.type === 'input' ? `$ ${item.content}` : item.content}
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  handleCommand(input);
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-gray-300"
              placeholder="Type 'help' for available commands"
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTerminal; 