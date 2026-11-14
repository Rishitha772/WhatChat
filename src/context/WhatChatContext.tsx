import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import {
  User,
  Contact,
  Conversation,
  Message,
  EventCategory,
  MySpaceEvent,
  EventMessage,
  CustomFilter,
  Attachment,
  ReplyPreview,
} from '../types/whatchat';
import { apiRequest } from '../services/api';

interface WhatChatContextType {
  // Auth & Profile
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  // Navigation
  activeTab: 'chats' | 'myspace' | 'contacts' | 'profile';
  setActiveTab: (tab: 'chats' | 'myspace' | 'contacts' | 'profile') => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  activeEventId: string | null;
  setActiveEventId: (id: string | null) => void;
  mySpaceViewMode: 'events' | 'timeline' | 'gallery';
  setMySpaceViewMode: (mode: 'events' | 'timeline' | 'gallery') => void;

  // Filters & Search
  chatFilter: string;
  setChatFilter: (filter: string) => void;
  customFilters: CustomFilter[];
  addCustomFilter: (name: string, criteria: CustomFilter['criteria']) => void;
  chatSearchQuery: string;
  setChatSearchQuery: (query: string) => void;
  mySpaceSearchQuery: string;
  setMySpaceSearchQuery: (query: string) => void;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (category: string | null) => void;

  // Data
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  contacts: Contact[];
  categories: EventCategory[];
  events: MySpaceEvent[];
  eventMessages: Record<string, EventMessage[]>;

  // Chat Actions
  sendMessage: (
    conversationId: string,
    text: string,
    attachments?: Attachment[],
    replyTo?: ReplyPreview
  ) => void;
  editMessage: (conversationId: string, messageId: string, newText: string) => void;
  deleteMessage: (conversationId: string, messageId: string, forEveryone: boolean) => void;
  pinMessage: (conversationId: string, messageId: string) => void;
  starMessage: (conversationId: string, messageId: string) => void;
  addReaction: (conversationId: string, messageId: string, emoji: string) => void;
  toggleMuteConversation: (conversationId: string) => void;
  togglePinConversation: (conversationId: string) => void;
  toggleArchiveConversation: (conversationId: string) => void;
  toggleFavoriteConversation: (conversationId: string) => void;

  // My Space Actions
  updateEvent: (eventId: string, updates: Partial<MySpaceEvent>) => void;
  deleteEvent: (eventId: string) => void;
  addEventMessage: (
    eventId: string,
    type: EventMessage['type'],
    content: string,
    attachments?: Attachment[],
    memoryDate?: string,
    tags?: string[],
    sourceChatName?: string
  ) => void;
  deleteEventMessage: (eventId: string, messageId: string) => void;
  toggleEventHighlight: (eventId: string, messageId: string) => void;
  saveMessageToMySpace: (message: Message, targetEventId: string) => void;
  createCategory: (name: string, iconName?: string, description?: string) => void;

}

const WhatChatContext = createContext<WhatChatContextType | undefined>(undefined);

export const WhatChatProvider: React.FC<{ children: ReactNode; initialUser: User }> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const isAuthenticated = true;

  const [activeTab, setActiveTab] = useState<'chats' | 'myspace' | 'contacts' | 'profile'>('chats');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [mySpaceViewMode, setMySpaceViewMode] = useState<'events' | 'timeline' | 'gallery'>('events');

  // Search & Filter
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [mySpaceSearchQuery, setMySpaceSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Core Data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [events, setEvents] = useState<MySpaceEvent[]>([]);
  const [eventMessages, setEventMessages] = useState<Record<string, EventMessage[]>>({});

  const logout = () => {
    apiRequest('/auth/logout', { method: 'POST' })
      .then(() => window.location.assign('/login'))
      .catch((error: unknown) => {
        console.error('Unable to complete sign out.', error);
        window.location.assign('/login');
      });
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('You must be signed in to update your profile.');
    const updatedUser = { ...user, ...updates };
    await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        fullName: updatedUser.displayName,
        username: updatedUser.username,
        about: updatedUser.about,
      }),
    });
    setUser(updatedUser);
  };

  // Chat Actions
  const sendMessage = (
    conversationId: string,
    text: string,
    attachments?: Attachment[],
    replyTo?: ReplyPreview
  ) => {
    const body = JSON.stringify({ text, attachments, replyTo });
    void apiRequest(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body,
    }).catch((error: unknown) => {
      console.error('Unable to send message.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to send this message.');
    });
  };

  const editMessage = (conversationId: string, messageId: string, newText: string) => {
    setMessages((prev) => {
      const list = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: list.map((m) =>
          m.id === messageId ? { ...m, text: newText, isEdited: true } : m
        ),
      };
    });
  };

  const deleteMessage = (conversationId: string, messageId: string, forEveryone: boolean) => {
    setMessages((prev) => {
      const list = prev[conversationId] || [];
      if (forEveryone) {
        return {
          ...prev,
          [conversationId]: list.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: 'This message was deleted',
                  attachments: undefined,
                  isDeletedForEveryone: true,
                }
              : m
          ),
        };
      } else {
        return {
          ...prev,
          [conversationId]: list.filter((m) => m.id !== messageId),
        };
      }
    });
  };

  const pinMessage = (conversationId: string, messageId: string) => {
    setMessages((prev) => {
      const list = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: list.map((m) =>
          m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
        ),
      };
    });
  };

  const starMessage = (conversationId: string, messageId: string) => {
    setMessages((prev) => {
      const list = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: list.map((m) =>
          m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
        ),
      };
    });
  };

  const addReaction = (conversationId: string, messageId: string, emoji: string) => {
    if (!user) return;
    setMessages((prev) => {
      const list = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: list.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = m.reactions ? [...m.reactions] : [];
          const existing = reactions.find((r) => r.emoji === emoji);
          if (existing) {
            if (existing.users.includes(user.id)) {
              // remove reaction
              existing.users = existing.users.filter((id) => id !== user.id);
              existing.count = existing.users.length;
            } else {
              existing.users.push(user.id);
              existing.count += 1;
            }
          } else {
            reactions.push({ emoji, count: 1, users: [user.id] });
          }
          return {
            ...m,
            reactions: reactions.filter((r) => r.count > 0),
          };
        }),
      };
    });
  };

  const toggleMuteConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isMuted: !c.isMuted } : c))
    );
  };

  const togglePinConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const toggleArchiveConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isArchived: !c.isArchived } : c))
    );
  };

  const toggleFavoriteConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  // My Space Actions
  const updateEvent = (eventId: string, updates: Partial<MySpaceEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setEventMessages((prev) => {
      const copy = { ...prev };
      delete copy[eventId];
      return copy;
    });
    if (activeEventId === eventId) {
      setActiveEventId(null);
    }
  };

  const addEventMessage = (
    eventId: string,
    type: EventMessage['type'],
    content: string,
    attachments?: Attachment[],
    memoryDate?: string,
    tags?: string[],
    sourceChatName?: string
  ) => {
    const now = new Date();
    const newMsg: EventMessage = {
      id: `em_${Date.now()}`,
      eventId,
      type,
      content,
      attachments,
      memoryDate: memoryDate || now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      isHighlight: false,
      tags: tags || [],
      sourceChatName,
    };

    setEventMessages((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), newMsg],
    }));

    // Update event media counts & memory count
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const counts = { ...e.mediaCounts };
        if (type === 'photo') counts.photos += 1;
        if (type === 'document') counts.documents += 1;
        if (type === 'audio') counts.audio += 1;
        if (type === 'note' || type === 'reflection') counts.notes += 1;

        return {
          ...e,
          memoryCount: e.memoryCount + 1,
          mediaCounts: counts,
        };
      })
    );
  };

  const deleteEventMessage = (eventId: string, messageId: string) => {
    setEventMessages((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] || []).filter((m) => m.id !== messageId),
    }));
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, memoryCount: Math.max(0, e.memoryCount - 1) } : e))
    );
  };

  const toggleEventHighlight = (eventId: string, messageId: string) => {
    setEventMessages((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] || []).map((m) =>
        m.id === messageId ? { ...m, isHighlight: !m.isHighlight } : m
      ),
    }));
  };

  const saveMessageToMySpace = (message: Message, targetEventId: string) => {
    const targetEvent = events.find((e) => e.id === targetEventId);
    if (!targetEvent) return;

    let type: EventMessage['type'] = 'forwarded_chat';
    if (message.attachments && message.attachments.length > 0) {
      const att = message.attachments[0];
      if (att.type === 'image') type = 'photo';
      else if (att.type === 'document') type = 'document';
      else if (att.type === 'audio') type = 'audio';
    }

    addEventMessage(
      targetEventId,
      type,
      message.text || `Saved attachment from ${message.senderName}`,
      message.attachments,
      new Date().toISOString().split('T')[0],
      ['SavedFromChat', message.senderName.replace(/\s+/g, '')],
      message.senderName
    );

    // Mark original message as saved to My Space
    setMessages((prev) => {
      const list = prev[message.conversationId] || [];
      return {
        ...prev,
        [message.conversationId]: list.map((m) =>
          m.id === message.id
            ? { ...m, savedToEventId: targetEvent.id, savedToEventName: targetEvent.name }
            : m
        ),
      };
    });
  };

  const createCategory = (name: string, iconName = 'Tag', description = '') => {
    const newCat: EventCategory = {
      id: `cat_${Date.now()}`,
      name,
      iconName,
      isCustom: true,
      description,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const addCustomFilter = (name: string, criteria: CustomFilter['criteria']) => {
    const newFilter: CustomFilter = {
      id: `flt_${Date.now()}`,
      name,
      criteria,
    };
    setCustomFilters((prev) => [...prev, newFilter]);
    setChatFilter(newFilter.id);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      logout,
      updateProfile,
      activeTab,
      setActiveTab,
      activeConversationId,
      setActiveConversationId,
      activeEventId,
      setActiveEventId,
      mySpaceViewMode,
      setMySpaceViewMode,
      chatFilter,
      setChatFilter,
      customFilters,
      addCustomFilter,
      chatSearchQuery,
      setChatSearchQuery,
      mySpaceSearchQuery,
      setMySpaceSearchQuery,
      selectedCategoryFilter,
      setSelectedCategoryFilter,
      conversations,
      messages,
      contacts,
      categories,
      events,
      eventMessages,
      sendMessage,
      editMessage,
      deleteMessage,
      pinMessage,
      starMessage,
      addReaction,
      toggleMuteConversation,
      togglePinConversation,
      toggleArchiveConversation,
      toggleFavoriteConversation,
      updateEvent,
      deleteEvent,
      addEventMessage,
      deleteEventMessage,
      toggleEventHighlight,
      saveMessageToMySpace,
      createCategory,
    }),
    [
      user,
      isAuthenticated,
      activeTab,
      activeConversationId,
      activeEventId,
      mySpaceViewMode,
      chatFilter,
      customFilters,
      chatSearchQuery,
      mySpaceSearchQuery,
      selectedCategoryFilter,
      conversations,
      messages,
      contacts,
      categories,
      events,
      eventMessages,
    ]
  );

  return <WhatChatContext.Provider value={value}>{children}</WhatChatContext.Provider>;
};

export const useWhatChat = () => {
  const context = useContext(WhatChatContext);
  if (!context) {
    throw new Error('useWhatChat must be used within a WhatChatProvider');
  }
  return context;
};
