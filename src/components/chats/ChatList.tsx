import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  Check,
  CheckCheck,
  Pin,
  VolumeX,
  Star,
  MoreVertical,
  Archive,
  GraduationCap,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { Conversation } from '../../types/whatchat';

export const ChatList: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    chatFilter,
    setChatFilter,
    customFilters,
    addCustomFilter,
    chatSearchQuery,
    setChatSearchQuery,
    contacts,
    user,
    togglePinConversation,
    toggleMuteConversation,
    toggleFavoriteConversation,
    toggleArchiveConversation,
  } = useWhatChat();

  const [activeMenuConvId, setActiveMenuConvId] = useState<string | null>(null);
  const [showAddFilterModal, setShowAddFilterModal] = useState<boolean>(false);
  const [newFilterName, setNewFilterName] = useState<string>('');
  const [newFilterCriteria, setNewFilterCriteria] = useState<'unread' | 'groups' | 'direct' | 'college' | 'pinned' | 'favorites'>('groups');

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Search query filter
    if (chatSearchQuery.trim()) {
      const q = chatSearchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchMsg = c.lastMessage?.text.toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }

    // Tab filter
    if (chatFilter === 'all') return !c.isArchived;
    if (chatFilter === 'unread') return c.unreadCount > 0 && !c.isArchived;
    if (chatFilter === 'favorites') return c.isFavorite && !c.isArchived;
    if (chatFilter === 'groups') return c.type === 'group' && !c.isArchived;
    if (chatFilter === 'college') return c.groupCategory === 'College' && !c.isArchived;
    if (chatFilter === 'network') return c.type === 'direct' && !c.isArchived;
    if (chatFilter === 'archived') return c.isArchived;

    // Check custom filters
    const custom = customFilters.find((f) => f.id === chatFilter);
    if (custom) {
      if (custom.criteria === 'unread') return c.unreadCount > 0;
      if (custom.criteria === 'groups') return c.type === 'group';
      if (custom.criteria === 'direct') return c.type === 'direct';
      if (custom.criteria === 'college') return c.groupCategory === 'College';
      if (custom.criteria === 'pinned') return c.isPinned;
      if (custom.criteria === 'favorites') return c.isFavorite;
    }

    return true;
  });

  // Sort: pinned first, then by updatedAt
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleCreateCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;
    addCustomFilter(newFilterName.trim(), newFilterCriteria);
    setNewFilterName('');
    setShowAddFilterModal(false);
  };

  return (
    <div className="w-80 md:w-96 bg-white border-r border-[#eae5f1] flex flex-col h-full shrink-0 select-none">
      {/* Top Header (WhatsApp Web Header) */}
      <div className="p-3.5 border-b border-[#eae5f1] bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#111b21]">Chats</h1>
            <span className="text-xs text-[#667781] font-normal">({filteredConversations.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f8f5fc] hover:bg-[#eae5f1] text-[#8064b5] text-xs font-semibold transition-colors"
              title="Group creation is not available until the conversations API is connected"
            >
              <Users className="w-3.5 h-3.5" />
              <span>New Group</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#667781] absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations"
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="w-full bg-[#f8f5fc] border border-transparent rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#111b21] placeholder-[#667781] focus:outline-hidden focus:bg-white focus:border-[#947bc3] transition-all"
          />
        </div>

        {/* WhatsApp Filter Segmented Bar */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setChatFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              chatFilter === 'all'
                ? 'bg-[#e9ddfb] text-[#8064b5] font-semibold'
                : 'bg-[#f8f5fc] text-[#54656f] hover:bg-[#eae5f1]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setChatFilter('unread')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              chatFilter === 'unread'
                ? 'bg-[#e9ddfb] text-[#8064b5] font-semibold'
                : 'bg-[#f8f5fc] text-[#54656f] hover:bg-[#eae5f1]'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setChatFilter('favorites')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              chatFilter === 'favorites'
                ? 'bg-[#e9ddfb] text-[#8064b5] font-semibold'
                : 'bg-[#f8f5fc] text-[#54656f] hover:bg-[#eae5f1]'
            }`}
          >
            Favourites
          </button>
          <button
            onClick={() => setChatFilter('groups')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              chatFilter === 'groups'
                ? 'bg-[#e9ddfb] text-[#8064b5] font-semibold'
                : 'bg-[#f8f5fc] text-[#54656f] hover:bg-[#eae5f1]'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setChatFilter('college')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              chatFilter === 'college'
                ? 'bg-[#e9ddfb] text-[#8064b5] font-semibold'
                : 'bg-[#f8f5fc] text-[#54656f] hover:bg-[#eae5f1]'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            <span>College</span>
          </button>
          <button
            onClick={() => setChatFilter('network')}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              chatFilter === 'network'
                ? 'bg-[#e9ddfb] text-[#8064b5] font-semibold'
                : 'bg-[#f8f5fc] text-[#54656f] hover:bg-[#eae5f1]'
            }`}
          >
            Direct
          </button>

          {/* User custom filters */}
          {customFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setChatFilter(f.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                chatFilter === f.id
                  ? 'bg-[#e9ddfb] text-[#8064b5] font-semibold'
                  : 'bg-[#f8f5fc] text-[#54656f] hover:bg-[#eae5f1]'
              }`}
            >
              {f.name}
            </button>
          ))}

          {/* Add custom filter button */}
          <button
            onClick={() => setShowAddFilterModal(true)}
            className="p-1 rounded-full text-[#667781] hover:bg-[#eae5f1] hover:text-[#8064b5] transition-colors"
            title="Create Custom Filter"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conversation List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f8f5fc]">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#667781] h-64">
            <Search className="w-8 h-8 text-[#eae5f1] mb-2" />
            <p className="text-sm font-medium text-[#292333]">
              {chatSearchQuery.trim() ? 'No matching conversations' : 'Your conversations will appear here.'}
            </p>
            <p className="text-[11px] text-[#777181] mt-1">
              {chatSearchQuery.trim() ? 'Try another search.' : 'Conversations are loaded from your WhatChat account.'}
            </p>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id;
            const otherParticipantId = conv.participants.find((id) => id !== user?.id);
            const contact = contacts.find((c) => c.id === otherParticipantId);
            const isOnline = conv.type === 'direct' && contact?.isOnline;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`group relative flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#f8f5fc]'
                    : 'hover:bg-[#f5f6f6] bg-white'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={conv.avatarUrl}
                    alt={conv.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-[#eae5f1]"
                  />
                  {conv.type === 'direct' && isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#b99aef] border-2 border-white rounded-full"></span>
                  )}
                  {conv.type === 'group' && (
                    <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-[#e7fce3] text-[#8064b5] border border-white rounded-full">
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Info & Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3
                        className={`text-sm truncate ${
                          conv.unreadCount > 0 ? 'font-bold text-[#111b21]' : 'font-medium text-[#111b21]'
                        }`}
                      >
                        {conv.name}
                      </h3>
                      {conv.isPinned && <Pin className="w-3 h-3 text-[#8064b5] shrink-0 fill-[#8064b5]" />}
                      {conv.isFavorite && <Star className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />}
                      {conv.isMuted && <VolumeX className="w-3 h-3 text-[#667781] shrink-0" />}
                    </div>

                    <span
                      className={`text-[11px] shrink-0 ml-1 ${
                        conv.unreadCount > 0 ? 'text-[#b99aef] font-semibold' : 'text-[#667781]'
                      }`}
                    >
                      {conv.lastMessage?.timestamp || ''}
                    </span>
                  </div>

                  {/* Message preview & checkmark */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      {conv.lastMessage && conv.lastMessage.senderId === user?.id && (
                        <span className="shrink-0">
                          {conv.lastMessage.status === 'read' ? (
                            <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                          ) : conv.lastMessage.status === 'delivered' ? (
                            <CheckCheck className="w-4 h-4 text-[#667781]" />
                          ) : (
                            <Check className="w-4 h-4 text-[#667781]" />
                          )}
                        </span>
                      )}
                      <p className="text-xs text-[#667781] truncate">
                        {conv.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>

                    {/* WhatsApp Green Unread Pill */}
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-[#b99aef] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-normal">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick actions popup menu trigger */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuConvId(activeMenuConvId === conv.id ? null : conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#667781] hover:text-[#111b21] hover:bg-white transition-all"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Context menu dropdown */}
                  {activeMenuConvId === conv.id && (
                    <div
                      className="absolute right-0 top-6 w-44 bg-white rounded-lg shadow-xl border border-[#eae5f1] py-1 z-30 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          togglePinConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#f8f5fc] text-[#111b21]"
                      >
                        <Pin className="w-3.5 h-3.5 text-[#8064b5]" />
                        <span>{conv.isPinned ? 'Unpin chat' : 'Pin chat'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleFavoriteConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#f8f5fc] text-[#111b21]"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{conv.isFavorite ? 'Remove favourite' : 'Add to favourites'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleMuteConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#f8f5fc] text-[#111b21]"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-[#667781]" />
                        <span>{conv.isMuted ? 'Unmute chat' : 'Mute notifications'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleArchiveConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#f8f5fc] text-[#111b21]"
                      >
                        <Archive className="w-3.5 h-3.5 text-[#667781]" />
                        <span>{conv.isArchived ? 'Unarchive' : 'Archive chat'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Filter Modal */}
      {showAddFilterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-2xl border border-[#eae5f1]">
            <h3 className="text-base font-bold text-[#111b21] mb-1">Create Custom Filter</h3>
            <p className="text-xs text-[#667781] mb-4">
              Add a personalized tab to quickly organize your chats.
            </p>

            <form onSubmit={handleCreateCustomFilter} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#111b21] block mb-1">Filter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Work Squad, Study Circle"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#947bc3] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111b21] block mb-1">Filter Criteria</label>
                <select
                  value={newFilterCriteria}
                  onChange={(e) => setNewFilterCriteria(e.target.value as any)}
                  className="w-full bg-[#f8f5fc] border border-[#eae5f1] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#947bc3] focus:bg-white"
                >
                  <option value="groups">All Group Conversations</option>
                  <option value="college">College & Campus Groups</option>
                  <option value="direct">1:1 Direct Contacts</option>
                  <option value="unread">Unread Messages</option>
                  <option value="pinned">Pinned Conversations</option>
                  <option value="favorites">Star Favourites</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFilterModal(false)}
                  className="px-3 py-1.5 text-xs text-[#667781] hover:text-[#111b21] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#8064b5] hover:bg-[#947bc3] text-white rounded-lg transition-colors"
                >
                  Save Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
