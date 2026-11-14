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
    <aside className="w-16 md:w-16 bg-white/95 backdrop-blur-md border-r border-[#ede7f6] flex flex-col items-center justify-between py-3.5 shrink-0 z-20 select-none">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Brand Logo Button */}
        <button
          onClick={() => setActiveTab('chats')}
          className="flex items-center justify-center w-11 h-11 rounded-[16px] bg-[#8064b5] text-white transition-transform hover:scale-105 active:scale-95 shadow-2xs border border-[#7050a6]"
          title="WhatChat"
        >
          <MessageCircle className="h-6 w-6 stroke-[2.5]" />
        </button>

        {/* Navigation Tabs */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {/* 1. Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`relative flex items-center justify-center w-11 h-11 rounded-[16px] transition-all active:scale-95 ${
              activeTab === 'chats'
                ? 'bg-[#8064b5] text-white shadow-xs font-semibold'
                : 'text-[#777181] hover:bg-[#f1ebfa] hover:text-[#8064b5]'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8064b5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none shadow-2xs border border-white">
                {totalUnread}
              </span>
            )}
          </button>

          {/* 2. My Space (Personal Memory Vault) */}
          <button
            onClick={() => setActiveTab('myspace')}
            className={`group relative flex items-center justify-center w-11 h-11 rounded-[16px] transition-all active:scale-95 ${
              activeTab === 'myspace'
                ? 'bg-[#8064b5] text-white shadow-xs font-semibold'
                : 'text-[#777181] hover:bg-[#f1ebfa] hover:text-[#8064b5]'
            }`}
            title="My Space - Personal Event Memories"
          >
            <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          {/* 3. Contacts / Communities */}
          <button
            onClick={() => setActiveTab('contacts')}
            className={`relative flex items-center justify-center w-11 h-11 rounded-[16px] transition-all active:scale-95 ${
              activeTab === 'contacts'
                ? 'bg-[#8064b5] text-white shadow-xs font-semibold'
                : 'text-[#777181] hover:bg-[#f1ebfa] hover:text-[#8064b5]'
            }`}
            title="Contacts & People"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* 4. Profile / Settings */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`relative flex items-center justify-center w-11 h-11 rounded-[16px] transition-all active:scale-95 ${
              activeTab === 'profile'
                ? 'bg-[#8064b5] text-white shadow-xs font-semibold'
                : 'text-[#777181] hover:bg-[#f1ebfa] hover:text-[#8064b5]'
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
            className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#f1ebfa] text-sm font-bold text-[#7050a6] shadow-2xs border border-[#e2d5f8] transition-transform hover:scale-105 active:scale-95"
            title={user.displayName}
            aria-label={`Profile: ${user.displayName}`}
          >
            {user.displayName.trim().charAt(0).toUpperCase()}
          </button>
        )}
        <button
          onClick={logout}
          className="text-[#777181] hover:text-rose-600 hover:bg-rose-50 p-2 rounded-[12px] transition-colors"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
