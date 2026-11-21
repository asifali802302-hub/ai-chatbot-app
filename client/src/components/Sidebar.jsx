import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Sparkles,
  Code2,
  Coffee,
  Palette,
  Compass
} from 'lucide-react';

const CATEGORY_ICONS = {
  general: Compass,
  casual: Coffee,
  professional: Code2,
  creative: Palette
};

const Sidebar = ({ isOpen, onClose }) => {
  const { 
    sessions, 
    activeSessionId, 
    selectSession, 
    createNewSession, 
    deleteSession, 
    loadingSessions 
  } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    (s.title || 'New Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside className={`
        fixed md:static top-16 bottom-0 left-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-30 transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={() => {
              createNewSession();
              if (onClose) onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/70 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Session List Header */}
        <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Chat History</span>
          <span className="text-[10px] text-slate-500">{filteredSessions.length} saved</span>
        </div>

        {/* Session Items */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {loadingSessions ? (
            <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
              Loading conversations...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
              {searchQuery ? 'No matching conversations' : 'No conversations yet. Start one above!'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session._id === activeSessionId;
              const IconComp = CATEGORY_ICONS[session.category] || Compass;

              return (
                <div
                  key={session._id}
                  onClick={() => {
                    selectSession(session._id);
                    if (onClose) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-medium ${
                    isActive
                      ? 'bg-slate-800 text-indigo-300 border border-slate-700/80 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate pr-6">
                    <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate">{session.title || 'New Conversation'}</span>
                  </div>

                  <button
                    onClick={(e) => deleteSession(session._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 rounded transition-all"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Sockets Live</span>
          </span>
          <span className="text-slate-600">v1.2.0</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
