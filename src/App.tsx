import React from 'react';
import { WhatChatProvider, useWhatChat } from './context/WhatChatContext';
import { SidebarNav } from './components/layout/SidebarNav';
import { ChatList } from './components/chats/ChatList';
import { ChatView } from './components/chats/ChatView';
import { MySpaceView } from './components/myspace/MySpaceView';
import { ContactsView } from './components/contacts/ContactsView';
import { ProfileView } from './components/profile/ProfileView';
import { CreateEventModal } from './components/modals/CreateEventModal';
import { CreateGroupModal } from './components/modals/CreateGroupModal';
import { SaveToMySpaceModal } from './components/modals/SaveToMySpaceModal';
import { AuthModal } from './components/modals/AuthModal';
import { NotificationToasts } from './components/notifications/NotificationToasts';
import { NotificationPermissionBanner } from './components/notifications/NotificationPermissionBanner';
import { MessageSquare, Sparkles, Users, User as UserIcon } from 'lucide-react';

const WhatChatMain: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeConversationId,
    setActiveConversationId,
    activeEventId,
    conversations,
  } = useWhatChat();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F5FC] text-[#292333] font-sans antialiased">
      {/* 1. Desktop Left Navigation Bar */}
      <SidebarNav />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Permission Request Banner when pending */}
        <NotificationPermissionBanner />

        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* TAB 1: CHATS */}
          {activeTab === 'chats' && (
            <main className="flex-1 flex overflow-hidden min-w-0">
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
        <button
          onClick={() => {
            setActiveTab('chats');
            setActiveConversationId(null);
          }}
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
        </button>

        <button
          onClick={() => setActiveTab('myspace')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'myspace' ? 'text-[#8064B5]' : 'text-[#777181]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-semibold">My Space</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'contacts' ? 'text-[#8064B5]' : 'text-[#777181]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
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
    </div>
  );
};

export default function App() {
  return (
    <WhatChatProvider>
      <WhatChatMain />
    </WhatChatProvider>
  );
}
