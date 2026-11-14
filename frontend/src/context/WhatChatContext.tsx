import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
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
  SyncContactItem,
  SyncResult,
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

  // Contacts Actions
  isDeviceContactsLinked: boolean;
  linkDeviceContacts: () => Promise<void>;
  unlinkDeviceContacts: () => void;
  syncDeviceContacts: (contacts: SyncContactItem[]) => Promise<SyncResult>;
  fetchContacts: () => Promise<void>;
  addContact: (contact: { displayName: string; phoneNumber?: string; contactUserId?: string; about?: string; username?: string; avatarUrl?: string }) => Promise<Contact>;
  removeContact: (contactId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Array<{ id: string; fullName: string; username?: string; about?: string; createdAt?: string }>>;

  // Chat Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  startDirectChat: (recipientUserId: string, recipientName?: string, recipientAvatar?: string) => Promise<string>;
  createGroup: (name: string, participantIds: string[], description?: string) => Promise<string>;
  sendMessage: (
    conversationId: string,
    text: string,
    attachments?: Attachment[],
    replyTo?: ReplyPreview
  ) => Promise<void>;
  editMessage: (conversationId: string, messageId: string, newText: string) => void;
  deleteMessage: (conversationId: string, messageId: string, forEveryone: boolean) => Promise<void>;
  pinMessage: (conversationId: string, messageId: string) => void;
  starMessage: (conversationId: string, messageId: string) => void;
  addReaction: (conversationId: string, messageId: string, emoji: string) => void;
  toggleMuteConversation: (conversationId: string) => void;
  togglePinConversation: (conversationId: string) => void;
  toggleArchiveConversation: (conversationId: string) => void;
  toggleFavoriteConversation: (conversationId: string) => void;

  // My Space Actions
  fetchEvents: () => Promise<void>;
  createEvent: (
    name: string,
    category: string,
    description?: string,
    coverImageUrl?: string,
    eventDate?: string
  ) => Promise<MySpaceEvent>;
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

  // Device Contacts Linking: Contacts are only shown if linked with this device
  const [isDeviceContactsLinked, setIsDeviceContactsLinked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && initialUser?.id) {
      return localStorage.getItem(`whatchat_device_contacts_linked_${initialUser.id}`) === 'true';
    }
    return false;
  });
  const [categories, setCategories] = useState<EventCategory[]>([
    { id: 'cat_personal', name: 'Personal', iconName: 'Heart', description: 'Personal memories & milestones' },
    { id: 'cat_college', name: 'College', iconName: 'GraduationCap', description: 'University and campus days' },
    { id: 'cat_work', name: 'Work', iconName: 'Briefcase', description: 'Projects and professional achievements' },
    { id: 'cat_trips', name: 'Trips', iconName: 'Camera', description: 'Vacations and road trips' },
  ]);
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [events, setEvents] = useState<MySpaceEvent[]>([
    {
      id: 'evt_first_memory',
      userId: initialUser.id,
      name: 'Welcome to My Space',
      category: 'Personal',
      description: 'Your private digital memory vault for cherished moments and saved chats.',
      coverImageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date().toISOString(),
      isFavorite: true,
      memoryCount: 1,
      mediaCounts: { photos: 1, videos: 0, documents: 0, audio: 0, notes: 0 },
    },
  ]);
  const [eventMessages, setEventMessages] = useState<Record<string, EventMessage[]>>({
    evt_first_memory: [
      {
        id: 'em_welcome',
        eventId: 'evt_first_memory',
        type: 'note',
        content: 'Welcome to WhatChat My Space! You can save any text, photo, audio recording, or forwarded chat here privately.',
        memoryDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isHighlight: true,
        tags: ['Welcome', 'FirstMemory'],
      },
    ],
  });

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
        phoneNumber: updatedUser.phoneNumber,
      }),
    });
    setUser(updatedUser);
  };

  // Contacts Actions
  const fetchContacts = useCallback(async () => {
    try {
      const data = await apiRequest<Contact[]>('/contacts');
      if (Array.isArray(data)) {
        setContacts(data);
      }
    } catch (err) {
      console.warn('Unable to load contacts:', err);
    }
  }, []);

  const linkDeviceContacts = async () => {
    if (!user) return;
    localStorage.setItem(`whatchat_device_contacts_linked_${user.id}`, 'true');
    setIsDeviceContactsLinked(true);
    await fetchContacts();

    // If contact directory is empty, automatically link registered users as device contacts
    try {
      const existing = await apiRequest<Contact[]>('/contacts');
      if (!existing || existing.length === 0) {
        const directoryUsers = await searchUsers('');
        const others = directoryUsers.filter((u) => u.id !== user.id);
        for (const other of others) {
          try {
            await addContact({
              displayName: other.fullName,
              username: other.username,
              contactUserId: other.id,
              about: other.about || 'Hey there! I am using WhatChat.',
            });
          } catch {
            // ignore duplicates
          }
        }
        await fetchContacts();
      }
    } catch (err) {
      console.warn('Sync device contacts note:', err);
    }
  };

  const unlinkDeviceContacts = () => {
    if (!user) return;
    localStorage.removeItem(`whatchat_device_contacts_linked_${user.id}`);
    setIsDeviceContactsLinked(false);
  };

  const syncDeviceContacts = async (items: SyncContactItem[]): Promise<SyncResult> => {
    const result = await apiRequest<SyncResult>('/contacts/sync', {
      method: 'POST',
      body: JSON.stringify({ contacts: items }),
    });
    if (user?.id) {
      localStorage.setItem(`whatchat_device_contacts_linked_${user.id}`, 'true');
    }
    setIsDeviceContactsLinked(true);
    await fetchContacts();
    return result;
  };

  const addContact = async (contactData: { displayName: string; phoneNumber?: string; contactUserId?: string; about?: string; username?: string; avatarUrl?: string }) => {
    const saved = await apiRequest<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
    setContacts(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
    return saved;
  };

  const removeContact = async (contactId: string) => {
    await apiRequest(`/contacts/${encodeURIComponent(contactId)}`, {
      method: 'DELETE',
    });
    setContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const searchUsers = async (query: string) => {
    try {
      const results = await apiRequest<Array<{ id: string; fullName: string; username?: string; about?: string; createdAt?: string }>>(
        `/users/search?q=${encodeURIComponent(query || '')}`
      );
      return Array.isArray(results) ? results : [];
    } catch (err) {
      console.warn('Unable to search users:', err);
      return [];
    }
  };

  // Conversations Actions
  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiRequest<Conversation[]>('/conversations');
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (err) {
      console.warn('Unable to load conversations:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const list = await apiRequest<Message[]>(`/conversations/${encodeURIComponent(conversationId)}/messages`);
      if (Array.isArray(list)) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: list,
        }));
      }
    } catch (err) {
      console.warn('Unable to load messages for conversation:', conversationId, err);
    }
  }, []);

  const startDirectChat = async (recipientUserId: string, recipientName?: string, recipientAvatar?: string): Promise<string> => {
    try {
      // 1. Check if conversation already exists in memory
      const existing = conversations.find(c => c.type === 'direct' && c.participants?.includes(recipientUserId));
      if (existing) {
        setActiveConversationId(existing.id);
        setActiveTab('chats');
        return existing.id;
      }

      // 2. Otherwise create via backend API
      const newConv = await apiRequest<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          type: 'direct',
          recipientId: recipientUserId,
        }),
      });

      if (!newConv.name && recipientName) {
        newConv.name = recipientName;
      }
      if (!newConv.avatarUrl && recipientAvatar) {
        newConv.avatarUrl = recipientAvatar;
      }

      setConversations(prev => [newConv, ...prev.filter(c => c.id !== newConv.id)]);
      setActiveConversationId(newConv.id);
      setActiveTab('chats');
      return newConv.id;
    } catch (err) {
      console.error('Failed to start direct conversation:', err);
      throw err;
    }
  };

  const createGroup = async (name: string, participantIds: string[], description?: string): Promise<string> => {
    try {
      const newGroup = await apiRequest<Conversation>('/conversations/group', {
        method: 'POST',
        body: JSON.stringify({
          name,
          participants: participantIds,
          description,
        }),
      });
      setConversations(prev => [newGroup, ...prev.filter(c => c.id !== newGroup.id)]);
      setActiveConversationId(newGroup.id);
      setActiveTab('chats');
      return newGroup.id;
    } catch (err) {
      console.error('Failed to create group:', err);
      throw err;
    }
  };

  const sendMessage = async (
    conversationId: string,
    text: string,
    attachments?: Attachment[],
    replyTo?: ReplyPreview
  ) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload = {
      text,
      attachments,
      replyTo,
      timestamp,
      senderName: user?.displayName || 'You',
    };

    try {
      const savedMsg = await apiRequest<Message>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), savedMsg],
      }));

      // Update conversation's last message
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: {
                  id: savedMsg.id,
                  text: savedMsg.text || (attachments?.[0]?.fileName ? `📎 ${attachments[0].fileName}` : 'Attachment'),
                  senderId: user?.id || '',
                  timestamp,
                  status: 'sent',
                },
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (error: unknown) {
      console.error('Unable to send message.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to send this message.');
    }
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

  const deleteMessage = async (conversationId: string, messageId: string, forEveryone: boolean) => {
    try {
      await apiRequest(`/messages/${encodeURIComponent(messageId)}?forEveryone=${forEveryone}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Backend deleteMessage note:', err);
    }

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
  const fetchEvents = useCallback(async () => {
    try {
      const list = await apiRequest<any[]>('/myspace/events');
      if (Array.isArray(list) && list.length > 0) {
        setEvents(
          list.map((e) => ({
            id: e.id,
            userId: e.userId || user?.id || '',
            name: e.name || 'Memory Capsule',
            category: e.category || 'Personal',
            description: e.description || '',
            coverImageUrl: e.coverImageUrl || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
            eventDate: e.eventDate || new Date().toISOString().split('T')[0],
            createdAt: e.createdAt || new Date().toISOString(),
            isFavorite: e.isFavorite || false,
            memoryCount: e.memoryCount || 0,
            mediaCounts: e.mediaCounts || { photos: 0, videos: 0, documents: 0, audio: 0, notes: 0 },
          }))
        );
      }
    } catch (err) {
      console.warn('Unable to load My Space events from backend:', err);
    }
  }, [user?.id]);

  const createEvent = async (
    name: string,
    category: string,
    description?: string,
    coverImageUrl?: string,
    eventDate?: string
  ): Promise<MySpaceEvent> => {
    const payload = {
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || '',
      coverImageUrl: coverImageUrl?.trim() || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
      eventDate: eventDate || new Date().toISOString().split('T')[0],
    };

    let newEvent: MySpaceEvent;
    try {
      const backendEvent = await apiRequest<any>('/myspace/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      newEvent = {
        id: backendEvent.id,
        userId: user?.id || '',
        name: backendEvent.name || payload.name,
        category: backendEvent.category || payload.category,
        description: backendEvent.description || payload.description,
        coverImageUrl: backendEvent.coverImageUrl || payload.coverImageUrl,
        eventDate: backendEvent.eventDate || payload.eventDate,
        createdAt: backendEvent.createdAt || new Date().toISOString(),
        isFavorite: false,
        memoryCount: 0,
        mediaCounts: { photos: 0, videos: 0, documents: 0, audio: 0, notes: 0 },
      };
    } catch (err) {
      console.warn('Backend createEvent resilient fallback:', err);
      newEvent = {
        id: `evt_${Date.now()}`,
        userId: user?.id || '',
        name: payload.name,
        category: payload.category,
        description: payload.description,
        coverImageUrl: payload.coverImageUrl,
        eventDate: payload.eventDate,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        memoryCount: 0,
        mediaCounts: { photos: 0, videos: 0, documents: 0, audio: 0, notes: 0 },
      };
    }

    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
    return newEvent;
  };

  const updateEvent = (eventId: string, updates: Partial<MySpaceEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  const deleteEvent = (eventId: string) => {
    try {
      apiRequest(`/myspace/events/${encodeURIComponent(eventId)}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('deleteEvent backend note:', err));
    } catch {}

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

  // Initial load of contacts, conversations and my space events
  useEffect(() => {
    if (isDeviceContactsLinked) {
      fetchContacts();
    }
    fetchConversations();
    fetchEvents();
  }, [isDeviceContactsLinked, fetchContacts, fetchConversations, fetchEvents]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  // Periodic poll for updates
  useEffect(() => {
    const timer = setInterval(() => {
      fetchConversations();
      if (activeConversationId) {
        fetchMessages(activeConversationId);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeConversationId, fetchConversations, fetchMessages]);

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
      isDeviceContactsLinked,
      linkDeviceContacts,
      unlinkDeviceContacts,
      syncDeviceContacts,
      fetchContacts,
      addContact,
      removeContact,
      searchUsers,
      fetchConversations,
      fetchMessages,
      startDirectChat,
      createGroup,
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
      fetchEvents,
      createEvent,
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
      isDeviceContactsLinked,
      linkDeviceContacts,
      unlinkDeviceContacts,
      syncDeviceContacts,
      fetchContacts,
      fetchConversations,
      fetchMessages,
      fetchEvents,
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
