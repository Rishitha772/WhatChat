import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Users,
<<<<<<< HEAD
  LogOut,
  Settings,
  MessageCircle,
=======
  User,
  LogOut,
  HardDrive,
  ShieldCheck,
>>>>>>> origin/main
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';

export const SidebarNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    conversations,
    user,
    logout,
<<<<<<< HEAD
=======
    setIsAuthModalOpen,
>>>>>>> origin/main
  } = useWhatChat();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

<<<<<<< HEAD
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
=======
  // Storage calculation
  const usedMB = user ? Math.round(user.storageUsedBytes / (1024 * 1024)) : 1420;
  const totalGB = user ? Math.round(user.storageTotalBytes / (1024 * 1024 * 1024)) : 15;
  const storagePercent = Math.min(100, Math.round((usedMB / (totalGB * 1024)) * 100));

  return (
    <aside className="w-18 md:w-20 bg-white border-r border-[#EAE5F1] flex flex-col items-center justify-between py-5 shrink-0 z-20 shadow-xs select-none">
      {/* Top: Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setActiveTab('chats')}
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E9DDFB] text-[#8064B5] transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="WhatChat - Your Chats. Your Memories."
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 fill-[#E9DDFB] stroke-[#8064B5] stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B99AEF]"></span>
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex flex-col items-center gap-3">
          {/* 1. Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              activeTab === 'chats'
                ? 'bg-[#E9DDFB] text-[#8064B5] shadow-xs font-semibold'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
            title="Chats & Groups"
          >
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8064B5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none shadow-xs">
>>>>>>> origin/main
                {totalUnread}
              </span>
            )}
          </button>

<<<<<<< HEAD
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
=======
          {/* 2. My Space (Flagship) */}
          <button
            onClick={() => setActiveTab('myspace')}
            className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              activeTab === 'myspace'
                ? 'bg-[#E9DDFB] text-[#8064B5] shadow-xs'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
            title="My Space - Personal Event Memories"
          >
            <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12 text-[#8064B5]" />
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8064B5] opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>

          {/* 3. Contacts */}
          <button
            onClick={() => setActiveTab('contacts')}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              activeTab === 'contacts'
                ? 'bg-[#E9DDFB] text-[#8064B5] shadow-xs'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
            title="Contacts & Phone Discovery"
>>>>>>> origin/main
          >
            <Users className="w-5 h-5" />
          </button>

<<<<<<< HEAD
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
=======
          {/* 4. Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-[#E9DDFB] text-[#8064B5] shadow-xs'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
            title="My Profile & Settings"
          >
            <User className="w-5 h-5" />
>>>>>>> origin/main
          </button>
        </nav>
      </div>

<<<<<<< HEAD
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
=======
      {/* Bottom Area: Storage + Avatar */}
      <div className="flex flex-col items-center gap-4">
        {/* Storage Quick Pill */}
        <div
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => setActiveTab('profile')}
          title={`S3 Object Storage: ${(usedMB / 1024).toFixed(1)} GB of ${totalGB} GB used`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#F8F5FC] border border-[#EAE5F1] flex items-center justify-center text-[#777181] group-hover:text-[#8064B5] group-hover:border-[#B99AEF] transition-all">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="w-7 bg-[#EAE5F1] h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#B99AEF] h-full rounded-full transition-all"
              style={{ width: `${storagePercent}%` }}
            ></div>
          </div>
        </div>

        {/* User Avatar */}
        {user ? (
          <button
            onClick={() => setActiveTab('profile')}
            className="relative rounded-full ring-2 ring-[#E9DDFB] hover:ring-[#B99AEF] transition-all"
            title={`${user.displayName} (${user.phoneNumber})`}
          >
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5EAA85] border-2 border-white rounded-full"></span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-10 h-10 rounded-full bg-[#E9DDFB] flex items-center justify-center text-[#8064B5]"
            title="Sign In"
          >
            <User className="w-5 h-5" />
          </button>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          className="text-[#777181] hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"
>>>>>>> origin/main
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
