<<<<<<< HEAD
﻿import React, { useEffect, useState } from 'react';
=======
import React from 'react';
>>>>>>> origin/main
import { WhatChatProvider, useWhatChat } from './context/WhatChatContext';
import { SidebarNav } from './components/layout/SidebarNav';
import { ChatList } from './components/chats/ChatList';
import { ChatView } from './components/chats/ChatView';
import { MySpaceView } from './components/myspace/MySpaceView';
import { ContactsView } from './components/contacts/ContactsView';
import { ProfileView } from './components/profile/ProfileView';
<<<<<<< HEAD
import { MessageSquare, Sparkles, Users, User as UserIcon } from 'lucide-react';
import { AuthPage } from './components/auth/AuthPage';
import { apiRequest, type SessionUser } from './services/api';
import type { User } from './types/whatchat';

const WhatsAppMain: React.FC = () => {
=======
import { CreateEventModal } from './components/modals/CreateEventModal';
import { CreateGroupModal } from './components/modals/CreateGroupModal';
import { SaveToMySpaceModal } from './components/modals/SaveToMySpaceModal';
import { AuthModal } from './components/modals/AuthModal';
import { NotificationToasts } from './components/notifications/NotificationToasts';
import { NotificationPermissionBanner } from './components/notifications/NotificationPermissionBanner';
import { MessageSquare, Sparkles, Users, User as UserIcon } from 'lucide-react';

const WhatChatMain: React.FC = () => {
>>>>>>> origin/main
  const {
    activeTab,
    setActiveTab,
    activeConversationId,
    setActiveConversationId,
<<<<<<< HEAD
=======
    activeEventId,
>>>>>>> origin/main
    conversations,
  } = useWhatChat();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
<<<<<<< HEAD
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f5fc] text-[#292333] font-sans antialiased">
      {/* 1. Desktop Left Navigation Bar (WhatsApp Web Rail) */}
=======
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F5FC] text-[#292333] font-sans antialiased">
      {/* 1. Desktop Left Navigation Bar */}
>>>>>>> origin/main
      <SidebarNav />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
<<<<<<< HEAD
=======
        {/* Permission Request Banner when pending */}
        <NotificationPermissionBanner />

>>>>>>> origin/main
        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* TAB 1: CHATS */}
          {activeTab === 'chats' && (
            <main className="flex-1 flex overflow-hidden min-w-0">
<<<<<<< HEAD
              {/* Conversation list column */}
              <div
                className={`h-full ${
                  activeConversationId ? 'hidden md:flex' : 'flex w-full md:w-auto'
                }`}
              >
                <ChatList />
              </div>

              {/* Conversation view column */}
              <div
                className={`flex-1 h-full min-w-0 ${
                  activeConversationId ? 'flex' : 'hidden md:flex'
                }`}
              >
                <ChatView />
              </div>
            </main>
          )}

          {/* TAB 2: MY SPACE (Flagship Personal Events Memory System) */}
          {activeTab === 'myspace' && (
            <main className="flex-1 flex overflow-hidden min-w-0">
              <MySpaceView />
            </main>
          )}

          {/* TAB 3: CONTACTS & DISCOVERY */}
          {activeTab === 'contacts' && (
            <main className="flex-1 flex overflow-hidden min-w-0">
              <ContactsView />
            </main>
          )}

          {/* TAB 4: PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <main className="flex-1 flex overflow-hidden min-w-0">
              <ProfileView />
            </main>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (WhatsApp Mobile Tab Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#eae5f1] flex items-center justify-around z-30 shadow-lg">
=======
            {/* Conversation list column */}
            <div
              className={`h-full ${
                activeConversationId ? 'hidden md:flex' : 'flex w-full md:w-auto'
              }`}
            >
              <ChatList />
            </div>

            {/* Conversation view column */}
            <div
              className={`flex-1 h-full min-w-0 ${
                activeConversationId ? 'flex' : 'hidden md:flex'
              }`}
            >
              <ChatView />
            </div>
          </main>
        )}

        {/* TAB 2: MY SPACE (Flagship Personal Events Memory System) */}
        {activeTab === 'myspace' && (
          <main className="flex-1 flex overflow-hidden min-w-0">
            <MySpaceView />
          </main>
        )}

        {/* TAB 3: CONTACTS & DISCOVERY */}
        {activeTab === 'contacts' && (
          <main className="flex-1 flex overflow-hidden min-w-0">
            <ContactsView />
          </main>
        )}

        {/* TAB 4: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <main className="flex-1 flex overflow-hidden min-w-0">
            <ProfileView />
          </main>
        )}
        </div>
      </div>

      {/* Floating Notification Alerts */}
      <NotificationToasts />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-[#EAE5F1] flex items-center justify-around z-30 shadow-lg">
>>>>>>> origin/main
        <button
          onClick={() => {
            setActiveTab('chats');
            setActiveConversationId(null);
          }}
<<<<<<< HEAD
          className={`flex flex-col items-center gap-0.5 relative py-1 transition-colors ${
            activeTab === 'chats'             ? 'text-[#8064b5]' : 'text-[#777181]'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#8064b5] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-none">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Chats</span>
=======
          className={`flex flex-col items-center gap-0.5 relative ${
            activeTab === 'chats' ? 'text-[#8064B5]' : 'text-[#777181]'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Chats</span>
          {totalUnread > 0 && (
            <span className="absolute -top-1 right-2 bg-[#8064B5] text-white text-[9px] font-bold px-1 rounded-full">
              {totalUnread}
            </span>
          )}
>>>>>>> origin/main
        </button>

        <button
          onClick={() => setActiveTab('myspace')}
<<<<<<< HEAD
          className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
            activeTab === 'myspace'             ? 'text-[#8064b5]' : 'text-[#777181]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">My Space</span>
=======
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'myspace' ? 'text-[#8064B5]' : 'text-[#777181]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-semibold">My Space</span>
>>>>>>> origin/main
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
<<<<<<< HEAD
          className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
            activeTab === 'contacts'             ? 'text-[#8064b5]' : 'text-[#777181]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Contacts</span>
=======
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'contacts' ? 'text-[#8064B5]' : 'text-[#777181]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Contacts</span>
>>>>>>> origin/main
        </button>

        <button
          onClick={() => setActiveTab('profile')}
<<<<<<< HEAD
          className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
            activeTab === 'profile'             ? 'text-[#8064b5]' : 'text-[#777181]'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>

=======
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'profile' ? 'text-[#8064B5]' : 'text-[#777181]'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </nav>

      {/* Global Modals */}
      <CreateEventModal />
      <CreateGroupModal />
      <SaveToMySpaceModal />
      <AuthModal />
>>>>>>> origin/main
    </div>
  );
};

<<<<<<< HEAD
function toWhatChatUser(account: SessionUser): User {
  return {
    id: account.id,
    phoneNumber: '',
    countryCode: '',
    displayName: account.fullName,
    email: account.email,
    username: account.username ?? '',
    avatarUrl: '',
    about: account.about ?? '',
    createdAt: account.createdAt,
    isOnline: true,
    privacySettings: {
      lastSeenVisibility: 'contacts',
      readReceipts: true,
      profilePhotoVisibility: 'contacts',
      phoneDiscovery: false,
    },
    storageUsedBytes: 0,
    storageTotalBytes: 0,
  };
}

export default function App() {
  const path = window.location.pathname;
  const isAuthPage = ['/signup', '/login', '/verify-email', '/forgot-password', '/reset-password'].includes(path);
  const [account, setAccount] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(!isAuthPage);

  useEffect(() => {
    if (isAuthPage) return;
    if (path !== '/' && path !== '/onboarding') {
      window.location.replace('/');
      return;
    }
    apiRequest<SessionUser>('/auth/me')
      .then((current) => {
        setAccount(current);
        if (path === '/onboarding' && current.profileComplete) window.location.replace('/');
        if (path !== '/onboarding' && !current.profileComplete) window.location.replace('/onboarding');
      })
      .catch(() => {
        window.location.replace(path === '/' ? '/signup' : '/login');
      })
      .finally(() => setLoading(false));
  }, [isAuthPage, path]);

  if (isAuthPage) return <AuthPage />;
  if (loading) return <main className="auth-loading"><span className="auth-spinner" /> Loading your WhatChat accountâ€¦</main>;
  if (path === '/onboarding') return <AuthPage />;
  if (!account) return null;

  return (
    <WhatChatProvider initialUser={toWhatChatUser(account)}>
      <WhatsAppMain />
=======
export default function App() {
  return (
    <WhatChatProvider>
      <WhatChatMain />
>>>>>>> origin/main
    </WhatChatProvider>
  );
}
