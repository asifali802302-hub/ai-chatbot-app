import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import MessageInput from '../components/MessageInput';
import SettingsModal from '../components/SettingsModal';
import AdminModal from '../components/AdminModal';
import { Menu } from 'lucide-react';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navigation */}
      <Navbar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-20 left-4 z-40 p-3 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/40"
          title="Open Conversation History"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Chat Stage */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <ChatArea />
          <MessageInput />
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />
    </div>
  );
};

export default ChatPage;
