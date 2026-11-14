<<<<<<< HEAD
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
=======
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
>>>>>>> origin/main
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
<<<<<<< HEAD
} from '../types/whatchat';
import { apiRequest } from '../services/api';
=======
  GroupCategoryType,
  NotificationPreferences,
  InAppNotification,
  NotificationType,
} from '../types/whatchat';
import { notificationService } from '../services/notificationService';
import {
  INITIAL_USER,
  INITIAL_CONTACTS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOM_FILTERS,
  INITIAL_EVENTS,
  INITIAL_EVENT_MESSAGES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
} from '../data/mockInitialData';
>>>>>>> origin/main

interface WhatChatContextType {
  // Auth & Profile
  user: User | null;
  isAuthenticated: boolean;
<<<<<<< HEAD
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
=======
  loginWithPhone: (phone: string, countryCode: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  completeProfile: (name: string, username: string, about: string, avatarUrl?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updatePrivacy: (settings: Partial<User['privacySettings']>) => void;
  updateNotificationSettings: (settings: Partial<NotificationPreferences>) => void;

  // Notifications
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  activeNotifications: InAppNotification[];
  dismissNotification: (id: string) => void;
  sendTestNotification: (type?: NotificationType) => void;
>>>>>>> origin/main

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
<<<<<<< HEAD
=======
  typingContact: { conversationId: string; name: string } | null;
>>>>>>> origin/main

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
<<<<<<< HEAD

  // My Space Actions
=======
  createGroup: (
    name: string,
    description: string,
    category: GroupCategoryType,
    participantIds: string[],
    avatarUrl?: string
  ) => string;
  startDirectChatWithContact: (contactId: string) => string;

  // My Space Actions
  createEvent: (
    name: string,
    category: string,
    eventDate?: string,
    description?: string,
    coverImageUrl?: string
  ) => string;
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
  // Helper modals
  saveToEventModalData: Message | null;
  setSaveToEventModalData: (msg: Message | null) => void;
  isCreateGroupOpen: boolean;
  setIsCreateGroupOpen: (open: boolean) => void;
  isCreateEventOpen: boolean;
  setIsCreateEventOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
>>>>>>> origin/main
}

const WhatChatContext = createContext<WhatChatContextType | undefined>(undefined);

<<<<<<< HEAD
export const WhatChatProvider: React.FC<{ children: ReactNode; initialUser: User }> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const isAuthenticated = true;

  const [activeTab, setActiveTab] = useState<'chats' | 'myspace' | 'contacts' | 'profile'>('chats');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
=======
const STORAGE_KEY_USER = 'whatchat_user';
const STORAGE_KEY_CONVS = 'whatchat_conversations';
const STORAGE_KEY_MSGS = 'whatchat_messages';
const STORAGE_KEY_EVENTS = 'whatchat_events';
const STORAGE_KEY_EVENT_MSGS = 'whatchat_event_messages';
const STORAGE_KEY_CONTACTS = 'whatchat_contacts';
const STORAGE_KEY_CATEGORIES = 'whatchat_categories';
const STORAGE_KEY_CUSTOM_FILTERS = 'whatchat_custom_filters';

export const WhatChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted state or initial seed
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEY_USER) || true; // true by default with demo user
  });

  const [activeTab, setActiveTab] = useState<'chats' | 'myspace' | 'contacts' | 'profile'>('chats');
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv_aarav');
>>>>>>> origin/main
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [mySpaceViewMode, setMySpaceViewMode] = useState<'events' | 'timeline' | 'gallery'>('events');

  // Search & Filter
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [mySpaceSearchQuery, setMySpaceSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

<<<<<<< HEAD
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
=======
  // Modals
  const [saveToEventModalData, setSaveToEventModalData] = useState<Message | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState<boolean>(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Core Data
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONVS);
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MSGS);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONTACTS);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [categories, setCategories] = useState<EventCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [customFilters, setCustomFilters] = useState<CustomFilter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FILTERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_FILTERS;
  });

  const [events, setEvents] = useState<MySpaceEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [eventMessages, setEventMessages] = useState<Record<string, EventMessage[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENT_MSGS);
    return saved ? JSON.parse(saved) : INITIAL_EVENT_MESSAGES;
  });

  const [typingContact, setTypingContact] = useState<{ conversationId: string; name: string } | null>(null);

  // Notification State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return notificationService.getPermission();
  });
  const [activeNotifications, setActiveNotifications] = useState<InAppNotification[]>([]);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENT_MSGS, JSON.stringify(eventMessages));
  }, [eventMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_FILTERS, JSON.stringify(customFilters));
  }, [customFilters]);

  // Auth methods
  const loginWithPhone = async (phone: string, countryCode: string): Promise<boolean> => {
    // In real environment, sends OTP. Here we validate format and simulate SMS delivery
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 600);
    });
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (otp.length === 6) {
          setIsAuthenticated(true);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 600);
    });
  };

  const completeProfile = (name: string, username: string, about: string, avatarUrl?: string) => {
    const newUser: User = {
      id: user?.id || 'usr_me',
      phoneNumber: user?.phoneNumber || '+91 98765 43210',
      countryCode: user?.countryCode || '+91',
      displayName: name,
      username: username.replace(/^@/, ''),
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      about: about || 'Hey there! I am using WhatChat.',
      createdAt: user?.createdAt || new Date().toISOString(),
      isOnline: true,
      privacySettings: user?.privacySettings || {
        lastSeenVisibility: 'contacts',
        readReceipts: true,
        profilePhotoVisibility: 'everyone',
        phoneDiscovery: true,
      },
      notificationSettings: user?.notificationSettings || INITIAL_USER.notificationSettings,
      storageUsedBytes: user?.storageUsedBytes || 1420000000,
      storageTotalBytes: user?.storageTotalBytes || 15000000000,
    };
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_USER);
    setIsAuthModalOpen(true);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const updatePrivacy = (settings: Partial<User['privacySettings']>) => {
    if (!user) return;
    setUser({
      ...user,
      privacySettings: { ...user.privacySettings, ...settings },
    });
  };

  const updateNotificationSettings = (settings: Partial<NotificationPreferences>) => {
    if (!user) return;
    setUser({
      ...user,
      notificationSettings: {
        ...(user.notificationSettings || INITIAL_USER.notificationSettings),
        ...settings,
      },
    });
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    const perm = await notificationService.requestPermission();
    setNotificationPermission(perm);
    return perm;
  };

  const dismissNotification = (id: string) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerNotification = (options: {
    title: string;
    body: string;
    avatarUrl?: string;
    type: NotificationType;
    conversationId?: string;
    eventId?: string;
    onClick?: () => void;
  }) => {
    const settings = user?.notificationSettings || INITIAL_USER.notificationSettings;
    if (!settings.enabled) return;

    if (options.conversationId) {
      const conv = conversations.find((c) => c.id === options.conversationId);
      if (conv?.isMuted) return;
      if (conv?.type === 'group') {
        if (settings.groupMode === 'none') return;
        if (settings.groupMode === 'mentions_only' && options.type !== 'mention') return;
      }
    }

    const inAppNotif = notificationService.dispatch({
      ...options,
      soundEnabled: settings.sound,
      showPreviews: settings.showPreviews,
    });

    setActiveNotifications((prev) => [inAppNotif, ...prev.slice(0, 3)]);

    setTimeout(() => {
      dismissNotification(inAppNotif.id);
    }, 5000);
  };

  const sendTestNotification = (type: NotificationType = 'message') => {
    if (type === 'mention') {
      triggerNotification({
        title: 'College Farewell 2026 Batch',
        body: `@${user?.username || 'rishitha_k'} You were mentioned: "Can everyone verify their convocation photos?"`,
        avatarUrl: '/src/assets/images/event_college_farewell_1794229996497.jpg',
        type: 'mention',
        conversationId: 'conv_group_college',
        onClick: () => {
          setActiveTab('chats');
          setActiveConversationId('conv_group_college');
        },
      });
    } else if (type === 'memory') {
      triggerNotification({
        title: 'My Space Milestone Reminder',
        body: 'On this day: "21st Birthday Memories" was recorded in your personal vault. Tap to revisit!',
        avatarUrl: '/src/assets/images/event_birthday_celebration_1794229996051.jpg',
        type: 'memory',
        eventId: 'evt_birthday',
        onClick: () => {
          setActiveTab('myspace');
          setActiveEventId('evt_birthday');
        },
      });
    } else {
      triggerNotification({
        title: 'Aarav Sharma',
        body: 'Hey! WhatChat push notifications are working seamlessly across devices.',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        type: 'message',
        conversationId: 'conv_aarav',
        onClick: () => {
          setActiveTab('chats');
          setActiveConversationId('conv_aarav');
        },
      });
    }
>>>>>>> origin/main
  };

  // Chat Actions
  const sendMessage = (
    conversationId: string,
    text: string,
    attachments?: Attachment[],
    replyTo?: ReplyPreview
  ) => {
<<<<<<< HEAD
    const body = JSON.stringify({ text, attachments, replyTo });
    void apiRequest(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body,
    }).catch((error: unknown) => {
      console.error('Unable to send message.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to send this message.');
    });
=======
    if (!user) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderName: user.displayName,
      senderAvatar: user.avatarUrl,
      text,
      attachments,
      replyTo,
      timestamp: timeString,
      status: 'sent',
    };

    // Append to messages
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    // Update conversation lastMessage & move to top
    setConversations((prev) => {
      const conv = prev.find((c) => c.id === conversationId);
      if (!conv) return prev;

      const updatedConv: Conversation = {
        ...conv,
        lastMessage: {
          id: newMsg.id,
          text: text || (attachments ? `Sent ${attachments[0].type}` : 'Message'),
          senderId: user.id,
          timestamp: timeString,
          status: 'sent',
          attachmentType: attachments?.[0]?.type,
        },
        updatedAt: now.toISOString(),
      };

      return [updatedConv, ...prev.filter((c) => c.id !== conversationId)];
    });

    // Simulate delivery after 600ms
    setTimeout(() => {
      setMessages((prev) => {
        const list = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: list.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m)),
        };
      });
    }, 600);

    // Simulate read after 1400ms
    setTimeout(() => {
      setMessages((prev) => {
        const list = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: list.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m)),
        };
      });
    }, 1400);

    // Simulate realistic incoming reply if it is a 1:1 conversation
    const targetConv = conversations.find((c) => c.id === conversationId);
    if (targetConv && targetConv.type === 'direct') {
      const otherParticipantId = targetConv.participants.find((id) => id !== user.id);
      const contact = contacts.find((c) => c.id === otherParticipantId);
      if (contact) {
        // Show typing after 1800ms
        setTimeout(() => {
          setTypingContact({ conversationId, name: contact.displayName });
        }, 1800);

        // Send reply after 3600ms
        setTimeout(() => {
          setTypingContact(null);
          const replyResponses = [
            `That sounds wonderful! Love how organized WhatChat is.`,
            `Got it! Let me review this and get right back to you.`,
            `Did you add this to your My Space event as well? It's so convenient!`,
            `Awesome! The light lavender look makes everything feel so calm and uncluttered.`,
            `Super cool! Thanks for sharing this note.`,
          ];
          const randomReply = replyResponses[Math.floor(Math.random() * replyResponses.length)];
          const replyMsg: Message = {
            id: `msg_reply_${Date.now()}`,
            conversationId,
            senderId: contact.id,
            senderName: contact.displayName,
            senderAvatar: contact.avatarUrl,
            text: randomReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
          };

          setMessages((prev) => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), replyMsg],
          }));

          setConversations((prev) => {
            const current = prev.find((c) => c.id === conversationId);
            if (!current) return prev;
            return [
              {
                ...current,
                lastMessage: {
                  id: replyMsg.id,
                  text: replyMsg.text,
                  senderId: contact.id,
                  timestamp: replyMsg.timestamp,
                  status: 'read',
                },
                updatedAt: new Date().toISOString(),
              },
              ...prev.filter((c) => c.id !== conversationId),
            ];
          });

          // Dispatch Push Notification & Audio Chime
          const hasMention =
            randomReply.toLowerCase().includes(`@${(user?.username || '').toLowerCase()}`) ||
            randomReply.includes('@all');

          triggerNotification({
            title: contact.displayName,
            body: randomReply,
            avatarUrl: contact.avatarUrl,
            type: hasMention ? 'mention' : 'message',
            conversationId,
            onClick: () => {
              setActiveTab('chats');
              setActiveConversationId(conversationId);
            },
          });
        }, 4000);
      }
    }
>>>>>>> origin/main
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

<<<<<<< HEAD
  // My Space Actions
=======
  const createGroup = (
    name: string,
    description: string,
    category: GroupCategoryType,
    participantIds: string[],
    avatarUrl?: string
  ): string => {
    const newId = `conv_grp_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      type: 'group',
      name,
      description,
      avatarUrl: avatarUrl || '/src/assets/images/whatchat_hero_banner_1794229994931.jpg',
      participants: ['usr_me', ...participantIds],
      adminIds: ['usr_me'],
      groupCategory: category,
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      isArchived: false,
      isFavorite: false,
      updatedAt: new Date().toISOString(),
      lastMessage: {
        id: `msg_init_${Date.now()}`,
        text: 'Group created by you.',
        senderId: 'usr_me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveTab('chats');
    return newId;
  };

  const startDirectChatWithContact = (contactId: string): string => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return '';

    // Check if direct conversation already exists
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.participants.includes(contactId)
    );
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('chats');
      return existing.id;
    }

    const newId = `conv_dir_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      type: 'direct',
      name: contact.displayName,
      avatarUrl: contact.avatarUrl,
      participants: ['usr_me', contact.id],
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      isArchived: false,
      isFavorite: false,
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveTab('chats');
    return newId;
  };

  // My Space Actions
  const createEvent = (
    name: string,
    category: string,
    eventDate?: string,
    description?: string,
    coverImageUrl?: string
  ): string => {
    const newId = `evt_${Date.now()}`;
    const defaultCovers = [
      '/src/assets/images/event_birthday_celebration_1794229996051.jpg',
      '/src/assets/images/event_college_farewell_1794229996497.jpg',
      '/src/assets/images/event_mountain_travel_1794229996300.jpg',
      '/src/assets/images/whatchat_hero_banner_1794229994931.jpg',
    ];
    const chosenCover = coverImageUrl || defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const newEvent: MySpaceEvent = {
      id: newId,
      userId: user?.id || 'usr_me',
      name,
      category,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      description: description || 'Personal memories and notes captured in My Space.',
      coverImageUrl: chosenCover,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      memoryCount: 1,
      mediaCounts: {
        photos: 0,
        videos: 0,
        documents: 0,
        audio: 0,
        notes: 1,
      },
    };

    // Add initial welcome reflection message
    const welcomeMsg: EventMessage = {
      id: `em_${Date.now()}`,
      eventId: newId,
      type: 'reflection',
      content: `Welcome to "${name}" in My Space! You can add personal reflections, save photos from your chats, attach documents, and record audio memories here.`,
      memoryDate: newEvent.eventDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      isHighlight: true,
      tags: ['Created'],
    };

    setEvents((prev) => [newEvent, ...prev]);
    setEventMessages((prev) => ({
      ...prev,
      [newId]: [welcomeMsg],
    }));

    setActiveEventId(newId);
    setActiveTab('myspace');
    return newId;
  };

>>>>>>> origin/main
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
<<<<<<< HEAD
      logout,
      updateProfile,
=======
      loginWithPhone,
      verifyOtp,
      completeProfile,
      logout,
      updateProfile,
      updatePrivacy,
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
      typingContact,
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
      createGroup,
      startDirectChatWithContact,
      createEvent,
>>>>>>> origin/main
      updateEvent,
      deleteEvent,
      addEventMessage,
      deleteEventMessage,
      toggleEventHighlight,
      saveMessageToMySpace,
      createCategory,
<<<<<<< HEAD
=======
      saveToEventModalData,
      setSaveToEventModalData,
      isCreateGroupOpen,
      setIsCreateGroupOpen,
      isCreateEventOpen,
      setIsCreateEventOpen,
      isAuthModalOpen,
      setIsAuthModalOpen,
      notificationPermission,
      requestNotificationPermission,
      updateNotificationSettings,
      activeNotifications,
      dismissNotification,
      sendTestNotification,
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
      typingContact,
      saveToEventModalData,
      isCreateGroupOpen,
      isCreateEventOpen,
      isAuthModalOpen,
      notificationPermission,
      activeNotifications,
>>>>>>> origin/main
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
