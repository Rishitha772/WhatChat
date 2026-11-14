import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Users,
  LogOut,
  Settings,
  MessageCircle,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const SidebarNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    conversations,
    user,
    logout,
  } = useWhatChat();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <aside className="w-16 md:w-16 bg-[#f8f5fc] border-r border-[#eae5f1] flex flex-col items-center justify-between py-3 shrink-0 z-20 select-none">
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={() => setActiveTab('chats')}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-105 active:scale-95"
          title="WhatChat"
        >
          <MessageCircle className="h-7 w-7 text-[#8064b5]" />
        </button>

        {/* Navigation Tabs */}
        <nav className="flex flex-col items-center gap-1.5 w-full">
          {/* 1. Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              activeTab === 'chats'
                ? 'bg-[#e9ddfb] text-[#8064b5]'
                  : 'text-[#777181] hover:bg-[#eae5f1] hover:text-[#292333]'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute top-1 right-1 bg-[#8064b5] text-white text-[10px] font-bold px-1 py-0.2 rounded-full min-w-4 text-center leading-none">
                {totalUnread}
              </span>
            )}
          </button>

          {/* 2. My Space (Flagship Personal Memory Vault) */}
          <button
            onClick={() => setActiveTab('myspace')}
            className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              activeTab === 'myspace'
                ? 'bg-[#e9ddfb] text-[#8064b5]'
                : 'text-[#777181] hover:bg-[#eae5f1] hover:text-[#292333]'
            }`}
            title="My Space - Personal Event Memories"
          >
            <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span
              className={`absolute left-0 w-1 h-5 rounded-r-full bg-[#8064b5] transition-opacity ${
                activeTab === 'myspace' ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>

          {/* 3. Contacts / Communities */}
          <button
            onClick={() => setActiveTab('contacts')}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              activeTab === 'contacts'
                ? 'bg-[#e9ddfb] text-[#8064b5]'
                  : 'text-[#777181] hover:bg-[#eae5f1] hover:text-[#292333]'
            }`}
            title="Contacts & People"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* 4. Profile / Settings */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              activeTab === 'profile'
                ? 'bg-[#e9ddfb] text-[#8064b5]'
                  : 'text-[#777181] hover:bg-[#eae5f1] hover:text-[#292333]'
            }`}
            title="Settings & Profile"
          >
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        {user && (
          <button
            onClick={() => setActiveTab('profile')}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#e9ddfb] text-sm font-semibold text-[#70549f]"
            title={user.displayName}
            aria-label={`Profile: ${user.displayName}`}
          >
            {user.displayName.trim().charAt(0).toUpperCase()}
          </button>
        )}
        <button
          onClick={logout}
          className="text-[#777181] hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
