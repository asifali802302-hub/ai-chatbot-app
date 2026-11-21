import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  Bot, 
  Sparkles, 
  Moon, 
  Sun, 
  Settings, 
  BarChart3, 
  LogOut, 
  ChevronDown,
  Code2,
  Coffee,
  Palette,
  Compass
} from 'lucide-react';

const CATEGORIES = [
  { id: 'general', label: 'General Assistant', icon: Compass, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'casual', label: 'Casual Friend', icon: Coffee, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'professional', label: 'Code & Tech Mentor', icon: Code2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'creative', label: 'Creative Muse', icon: Palette, color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' },
];

const Navbar = ({ onOpenSettings, onOpenAdmin }) => {
  const { user, logout, updatePreferences } = useAuth();
  const { category, setCategory } = useChat();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentCategory = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const IconComponent = currentCategory.icon;
  const isDark = user?.preferences?.theme !== 'light';
  const botName = user?.preferences?.botName || 'NovaAI';

  const toggleTheme = () => {
    updatePreferences({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Brand & Bot Identity */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-100 tracking-tight text-base">{botName}</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Conversational Engine</p>
        </div>
      </div>

      {/* Center: Persona / Category Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowPersonaMenu(!showPersonaMenu)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${currentCategory.color} hover:brightness-110`}
          title="Switch AI Persona & Context Mode"
        >
          <IconComponent className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{currentCategory.label}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {showPersonaMenu && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-slate-800/95 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select AI Persona
            </div>
            {CATEGORIES.map((cat) => {
              const ItemIcon = cat.icon;
              const isSelected = cat.id === category;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                  }`}
                >
                  <ItemIcon className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <div>{cat.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Actions, Theme, Admin, User Profile */}
      <div className="flex items-center space-x-2">
        {/* Admin Dashboard Pill */}
        {user?.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
            title="View Real-Time Analytics & Admin Panel"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Analytics</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 rounded-lg transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 rounded-lg transition-colors"
          title="Personalization & Bot Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-lg hover:bg-slate-800/70 transition-colors border border-transparent hover:border-slate-700"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/95 border border-slate-700 rounded-xl shadow-xl backdrop-blur-xl p-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium uppercase rounded bg-slate-700 text-slate-300">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Personalization</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
