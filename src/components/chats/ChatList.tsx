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
    setIsCreateGroupOpen,
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
    <div className="w-80 md:w-96 bg-white border-r border-[#EAE5F1] flex flex-col h-full shrink-0 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-[#EAE5F1] bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#292333]">Chats</h1>
            <span className="text-xs text-[#777181] font-medium">({filteredConversations.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F5FC] hover:bg-[#E9DDFB] text-[#8064B5] text-xs font-semibold transition-colors"
              title="Create New Group"
            >
              <Users className="w-3.5 h-3.5" />
              <span>New Group</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#777181] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search chats, contacts, or messages..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#292333] placeholder-[#777181] focus:outline-hidden focus:border-[#B99AEF] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Segmented Bar */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setChatFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              chatFilter === 'all'
                ? 'bg-[#E9DDFB] text-[#8064B5] font-semibold'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setChatFilter('unread')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              chatFilter === 'unread'
                ? 'bg-[#E9DDFB] text-[#8064B5] font-semibold'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setChatFilter('favorites')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              chatFilter === 'favorites'
                ? 'bg-[#E9DDFB] text-[#8064B5] font-semibold'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
          >
            Favourites
          </button>
          <button
            onClick={() => setChatFilter('groups')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              chatFilter === 'groups'
                ? 'bg-[#E9DDFB] text-[#8064B5] font-semibold'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setChatFilter('college')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              chatFilter === 'college'
                ? 'bg-[#E9DDFB] text-[#8064B5] font-semibold'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            <span>College</span>
          </button>
          <button
            onClick={() => setChatFilter('network')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              chatFilter === 'network'
                ? 'bg-[#E9DDFB] text-[#8064B5] font-semibold'
                : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
          >
            My Network
          </button>

          {/* User's custom filters */}
          {customFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setChatFilter(f.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                chatFilter === f.id
                  ? 'bg-[#E9DDFB] text-[#8064B5] font-semibold'
                  : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
              }`}
            >
              {f.name}
            </button>
          ))}

          {/* Add custom filter button */}
          <button
            onClick={() => setShowAddFilterModal(true)}
            className="p-1 rounded-lg text-[#777181] hover:bg-[#F8F5FC] hover:text-[#8064B5] transition-colors"
            title="Create Custom Filter"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conversation List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F8F5FC]">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#777181] h-64">
            <Search className="w-8 h-8 text-[#EAE5F1] mb-2" />
            <p className="text-xs font-medium">No conversations found</p>
            <p className="text-[11px] text-[#777181] mt-1">Try another filter or search term</p>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id;
            const otherParticipantId = conv.participants.find((id) => id !== 'usr_me');
            const contact = contacts.find((c) => c.id === otherParticipantId);
            const isOnline = conv.type === 'direct' && contact?.isOnline;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`group relative flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#F8F5FC] border-r-2 border-[#8064B5]'
                    : 'hover:bg-[#FCFAFE] bg-white'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={conv.avatarUrl}
                    alt={conv.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-[#EAE5F1]"
                  />
                  {conv.type === 'direct' && isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5EAA85] border-2 border-white rounded-full"></span>
                  )}
                  {conv.type === 'group' && (
                    <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-[#E9DDFB] text-[#8064B5] border border-white rounded-full">
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
                          isSelected ? 'font-bold text-[#292333]' : 'font-semibold text-[#292333]'
                        }`}
                      >
                        {conv.name}
                      </h3>
                      {conv.isPinned && <Pin className="w-3 h-3 text-[#8064B5] shrink-0 fill-[#8064B5]" />}
                      {conv.isFavorite && <Star className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />}
                      {conv.isMuted && <VolumeX className="w-3 h-3 text-[#777181] shrink-0" />}
                    </div>

                    <span className="text-[11px] text-[#777181] shrink-0 ml-1">
                      {conv.lastMessage?.timestamp || ''}
                    </span>
                  </div>

                  {/* Message preview & checkmark */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      {conv.lastMessage?.senderId === 'usr_me' && (
                        <span className="shrink-0 text-[#8064B5]">
                          {conv.lastMessage.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#8064B5]" />
                          ) : conv.lastMessage.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#777181]" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-[#777181]" />
                          )}
                        </span>
                      )}
                      <p className="text-xs text-[#777181] truncate">
                        {conv.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread Pill */}
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-[#8064B5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
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
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#777181] hover:text-[#292333] hover:bg-white transition-all"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Context menu dropdown */}
                  {activeMenuConvId === conv.id && (
                    <div
                      className="absolute right-0 top-6 w-44 bg-white rounded-xl shadow-lg border border-[#EAE5F1] py-1 z-30 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          togglePinConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F8F5FC] text-[#292333]"
                      >
                        <Pin className="w-3.5 h-3.5 text-[#8064B5]" />
                        <span>{conv.isPinned ? 'Unpin chat' : 'Pin chat to top'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleFavoriteConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F8F5FC] text-[#292333]"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{conv.isFavorite ? 'Remove favourite' : 'Add to favourites'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleMuteConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F8F5FC] text-[#292333]"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-[#777181]" />
                        <span>{conv.isMuted ? 'Unmute chat' : 'Mute notifications'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleArchiveConversation(conv.id);
                          setActiveMenuConvId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F8F5FC] text-[#292333]"
                      >
                        <Archive className="w-3.5 h-3.5 text-[#777181]" />
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
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-[#EAE5F1]">
            <h3 className="text-base font-bold text-[#292333] mb-1">Create Custom Filter</h3>
            <p className="text-xs text-[#777181] mb-4">
              Add a personalized tab to quickly organize your chats.
            </p>

            <form onSubmit={handleCreateCustomFilter} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#292333] block mb-1">Filter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Work Squad, Study Circle"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#B99AEF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#292333] block mb-1">Filter Criteria</label>
                <select
                  value={newFilterCriteria}
                  onChange={(e) => setNewFilterCriteria(e.target.value as any)}
                  className="w-full bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#B99AEF]"
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
                  className="px-3 py-1.5 text-xs text-[#777181] hover:text-[#292333] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#E9DDFB] hover:bg-[#D9C7F7] text-[#8064B5] rounded-lg transition-colors"
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
