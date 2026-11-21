import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  Sparkles, 
  Code2, 
  Coffee, 
  Palette,
  Clock,
  Send
} from 'lucide-react';

const QuickPromptCard = ({ icon: Icon, title, prompt, onSelect }) => (
  <button
    onClick={() => onSelect(prompt)}
    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800 transition-all text-left group flex flex-col justify-between"
  >
    <div className="flex items-center space-x-2 text-indigo-400 mb-2">
      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
      <span className="text-xs font-semibold text-slate-200">{title}</span>
    </div>
    <p className="text-[11px] text-slate-400 line-clamp-2">{prompt}</p>
  </button>
);

const MessageBubble = ({ message, onRate }) => {
  const isAI = message.sender === 'ai';
  const [copied, setCopied] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown & Code block renderer
  const renderContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = (lang.length < 15 && lines.length > 1) ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => copyToClipboard(code)}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-slate-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <div key={index} className="whitespace-pre-wrap leading-relaxed text-sm">
          {part}
        </div>
      );
    });
  };

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] space-x-3 ${isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
          isAI 
            ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white' 
            : 'bg-slate-700 text-slate-200 border border-slate-600'
        }`}>
          {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Content Box */}
        <div className="flex flex-col">
          <div className={`p-4 rounded-2xl shadow-sm ${
            isAI
              ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-sm'
              : 'bg-indigo-600 text-white rounded-tr-sm'
          }`}>
            {renderContent(message.content)}
          </div>

          {/* AI Metadata & Rating Bar */}
          {isAI && (
            <div className="flex items-center space-x-3 mt-1.5 px-1 text-[11px] text-slate-400">
              {message.responseTimeMs > 0 && (
                <span className="flex items-center space-x-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{message.responseTimeMs}ms</span>
                </span>
              )}

              {/* Thumbs Up / Down */}
              <div className="flex items-center space-x-1.5 ml-auto">
                <button
                  onClick={() => onRate(message._id, 1)}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                    message.rating?.score === 1 ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackInput(!showFeedbackInput);
                    if (!showFeedbackInput) onRate(message._id, -1);
                  }}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                    message.rating?.score === -1 ? 'text-rose-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Needs improvement"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Feedback optional input */}
          {showFeedbackInput && (
            <div className="mt-2 p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center space-x-2 text-xs">
              <input
                type="text"
                placeholder="How could this response be improved?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none placeholder:text-slate-500 text-xs"
              />
              <button
                onClick={() => {
                  onRate(message._id, -1, feedbackText);
                  setShowFeedbackInput(false);
                }}
                className="px-2 py-1 bg-indigo-600 text-white rounded-md text-[11px] font-medium"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatArea = () => {
  const { messages, loadingMessages, isAiTyping, sendMessage, rateMessage } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  const botName = user?.preferences?.botName || 'NovaAI';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-4 md:px-8 py-6">
      {loadingMessages ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 animate-pulse">
          Retrieving encrypted conversation...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4 animate-bounce">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">
            Welcome to {botName}!
          </h2>
          <p className="text-xs text-slate-400 mb-6 max-w-md">
            Ask complex coding questions, brainstorm creative ideas, or chat freely with low-latency WebSockets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <QuickPromptCard
              icon={Code2}
              title="Full Stack Architecture"
              prompt="How do I build a scalable real-time chatbot using WebSockets and Spring Boot/Node.js?"
              onSelect={sendMessage}
            />
            <QuickPromptCard
              icon={Coffee}
              title="Casual Tech Chat"
              prompt="Give me a quick relaxed summary of how AI models generate tokens in simple terms."
              onSelect={sendMessage}
            />
            <QuickPromptCard
              icon={Palette}
              title="Creative Muse"
              prompt="Write an opening scene for a retro sci-fi novel about an AI living inside a satellite."
              onSelect={sendMessage}
            />
            <QuickPromptCard
              icon={Sparkles}
              title="Code Review & Security"
              prompt="Explain best practices for securing JWT tokens against XSS and CSRF attacks."
              onSelect={sendMessage}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} onRate={rateMessage} />
          ))}

          {/* AI Typing Indicator */}
          {isAiTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
