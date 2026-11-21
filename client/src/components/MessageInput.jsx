import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Send, Sparkles, Mic } from 'lucide-react';

const MessageInput = () => {
  const { sendMessage, isAiTyping, category } = useChat();
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isAiTyping) return;
    sendMessage(prompt);
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  return (
    <div className="p-4 border-t border-slate-800 bg-slate-900/60 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end bg-slate-800/80 border border-slate-700/80 rounded-2xl p-2 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message AI (${category} mode)...`}
            className="flex-1 bg-transparent border-none text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm px-3 py-1.5 focus:outline-none resize-none max-h-40"
          />

          <div className="flex items-center space-x-2 pb-1 pr-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isAiTyping}
              className={`p-2 rounded-xl transition-all ${
                prompt.trim() && !isAiTyping
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 scale-100'
                  : 'bg-slate-700/60 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-2 text-[10px] text-slate-500">
          <span>Press <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">Shift + Enter</kbd> for new line</span>
          <span className="capitalize">{category} Mode Active</span>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
