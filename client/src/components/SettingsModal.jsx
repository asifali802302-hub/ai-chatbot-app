import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Bot, Palette, Sliders, Check } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updatePreferences } = useAuth();

  const [botName, setBotName] = useState(user?.preferences?.botName || 'NovaAI');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [category, setCategory] = useState(user?.preferences?.category || 'general');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updatePreferences({ botName, theme, category });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Personalization & Settings</h3>
            <p className="text-xs text-slate-400">Configure chatbot persona, naming, and theme.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Chatbot Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Chatbot Name
            </label>
            <div className="relative">
              <Bot className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. NovaAI, Jarvis, CodeGPT"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                <span>Dark Theme</span>
                {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                <span>Light Theme</span>
                {theme === 'light' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Default Category / Persona */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default AI Persona Mode
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="general">General Assistant (Structured & Insightful)</option>
              <option value="casual">Casual Mode (Friendly & Relaxed)</option>
              <option value="professional">Professional Code Mentor (Software Architecture)</option>
              <option value="creative">Creative Muse (Prose & Ideas)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
