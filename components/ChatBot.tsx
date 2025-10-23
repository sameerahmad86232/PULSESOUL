
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import GlassCard from './GlassCard';
import { SendIcon, RobotIcon, UserIcon } from './icons';

interface ChatBotProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  error: string | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ history, onSendMessage, isTyping, error }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const getMessageBubbleClass = (role: 'user' | 'model') => {
    return role === 'user'
      ? 'bg-gradient-to-br from-blue-500 to-cyan-400 self-end rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
      : 'bg-gradient-to-br from-purple-600 to-indigo-500 self-start rounded-tl-2xl rounded-tr-2xl rounded-br-2xl';
  };

  return (
    <GlassCard className="h-[75vh] flex flex-col">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"><RobotIcon /></div>}
            <div className={`max-w-xs md:max-w-md p-3 text-white shadow-lg border border-white/10 ${getMessageBubbleClass(msg.role)}`}>
              <p>{msg.content}</p>
            </div>
             {msg.role === 'user' && <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"><UserIcon /></div>}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3 justify-start">
             <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0"><RobotIcon /></div>
            <div className="p-3 bg-purple-600 rounded-tl-xl rounded-tr-xl rounded-br-xl">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-white/50 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="mx-4 mb-2 text-yellow-300 bg-red-800/50 p-2 rounded text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/20 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-black/30 text-white placeholder-white/60 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          disabled={isTyping}
          className="bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-full p-3 transition-all flex-shrink-0 shadow-lg shadow-pink-500/30 transform hover:scale-110 active:scale-100"
        >
          <SendIcon />
        </button>
      </form>
    </GlassCard>
  );
};

export default ChatBot;
