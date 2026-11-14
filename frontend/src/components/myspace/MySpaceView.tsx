import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Calendar,
  Image as ImageIcon,
  FileText,
  Mic,
  Star,
  Lock,
  Heart,
  GraduationCap,
  Briefcase,
  FolderGit2,
  BookmarkCheck,
  Grid3X3,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Trash2,
  Share2,
  Camera,
  Check,
  Upload,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { MySpaceEvent, EventMessage, Attachment } from '../../types/whatchat';

const PRESET_COVERS = [
  { label: 'Sunset & Calm', url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80' },
  { label: 'Campus & Books', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mountains & Travel', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Coffee & Journal', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Friends & Moments', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80' },
];

export const MySpaceView: React.FC = () => {
  const {
    events,
    activeEventId,
    setActiveEventId,
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    mySpaceSearchQuery,
    setMySpaceSearchQuery,
    mySpaceViewMode,
    setMySpaceViewMode,
    createEvent,
    deleteEvent,
    eventMessages,
    addEventMessage,
    deleteEventMessage,
    toggleEventHighlight,
  } = useWhatChat();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);

  // New Event Form State
  const [newCapsuleName, setNewCapsuleName] = useState('');
  const [newCapsuleCategory, setNewCapsuleCategory] = useState('Personal');
  const [newCapsuleDesc, setNewCapsuleDesc] = useState('');
  const [newCapsuleDate, setNewCapsuleDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCapsuleCover, setNewCapsuleCover] = useState(PRESET_COVERS[0].url);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // New Memory Form State
  const [memoryType, setMemoryType] = useState<EventMessage['type']>('note');
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState('');
  const [memoryTags, setMemoryTags] = useState('');

  // Active event object if selected
  const activeEvent = events.find((e) => e.id === activeEventId);
  const currentEventMessages = activeEventId ? eventMessages[activeEventId] || [] : [];

  // Filter events
  const filteredEvents = events.filter((evt) => {
    // Search query
    if (mySpaceSearchQuery.trim()) {
      const q = mySpaceSearchQuery.toLowerCase();
      const matchName = evt.name.toLowerCase().includes(q);
      const matchDesc = evt.description?.toLowerCase().includes(q);
      const matchCat = evt.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // Category filter
    if (selectedCategoryFilter && selectedCategoryFilter !== 'all') {
      if (evt.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats
  const totalEvents = events.length;
  const totalMemories = events.reduce((sum, e) => sum + e.memoryCount, 0);
  const totalPhotos = events.reduce((sum, e) => sum + e.mediaCounts.photos, 0);
  const totalDocs = events.reduce((sum, e) => sum + e.mediaCounts.documents, 0);
  const totalAudio = events.reduce((sum, e) => sum + e.mediaCounts.audio, 0);

  // Handle Event Creation
  const handleCreateCapsuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCapsuleName.trim()) return;
    setIsSubmittingEvent(true);
    try {
      await createEvent(
        newCapsuleName.trim(),
        newCapsuleCategory,
        newCapsuleDesc.trim(),
        newCapsuleCover,
        newCapsuleDate
      );
      setNewCapsuleName('');
      setNewCapsuleDesc('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create capsule:', err);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Handle Add Memory Submission
  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventId || !memoryContent.trim()) return;

    let attachments: Attachment[] | undefined;
    if (memoryPhotoUrl.trim()) {
      attachments = [
        {
          id: `att_${Date.now()}`,
          type: 'image',
          url: memoryPhotoUrl.trim(),
          fileName: 'memory_photo.jpg',
          fileSize: 'Photo',
        },
      ];
    }

    const tags = memoryTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addEventMessage(
      activeEventId,
      memoryPhotoUrl.trim() ? 'photo' : memoryType,
      memoryContent.trim(),
      attachments,
      memoryDate,
      tags
    );

    setMemoryContent('');
    setMemoryPhotoUrl('');
    setMemoryTags('');
    setShowAddMemoryModal(false);
  };

  // Category Icon Resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Briefcase':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'FolderGit2':
        return <FolderGit2 className="w-3.5 h-3.5" />;
      case 'BookmarkCheck':
        return <BookmarkCheck className="w-3.5 h-3.5" />;
      default:
        return <Heart className="w-3.5 h-3.5" />;
    }
  };

  // -------------------------------------------------------------
  // VIEW: ACTIVE EVENT DETAIL VIEW (when an event capsule is open)
  // -------------------------------------------------------------
  if (activeEvent) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#f8f5fc] overflow-y-auto select-none">
        {/* Top Detail Navigation Header */}
        <header className="bg-white border-b border-[#ede7f6] p-4 sticky top-0 z-20 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveEventId(null)}
              className="p-2 rounded-xl bg-[#f1ebfa] text-[#8064b5] hover:bg-[#e6daf7] transition-all flex items-center gap-1 text-xs font-semibold"
              title="Back to All Capsules"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Capsules</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#111b21] truncate">{activeEvent.name}</h2>
              <p className="text-[11px] text-[#777181]">{activeEvent.category} &bull; {activeEvent.eventDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMemoryModal(true)}
              className="btn-aesthetic-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Delete the capsule "${activeEvent.name}" and all its saved memories?`)) {
                  deleteEvent(activeEvent.id);
                }
              }}
              className="p-2 rounded-xl text-[#777181] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Capsule"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Cover Banner */}
        <div className="relative h-56 w-full bg-[#ede7f6] overflow-hidden shrink-0">
          <img
            src={activeEvent.coverImageUrl}
            alt={activeEvent.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[11px] font-bold text-[#8064b5] shadow-xs">
              {activeEvent.category}
            </span>
            <h1 className="text-2xl font-bold mt-2 drop-shadow-xs">{activeEvent.name}</h1>
            {activeEvent.description && (
              <p className="text-xs text-white/90 max-w-xl mt-1 leading-relaxed">
                {activeEvent.description}
              </p>
            )}
          </div>
        </div>

        {/* Memories Container */}
        <div className="max-w-4xl w-full mx-auto p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111b21]">
              Saved Moments & Memories ({currentEventMessages.length})
            </h3>
            <button
              onClick={() => setShowAddMemoryModal(true)}
              className="text-xs text-[#8064b5] hover:underline font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>
          </div>

          {currentEventMessages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#eae5f1] p-10 text-center shadow-xs">
              <Sparkles className="w-10 h-10 text-[#8064b5] mx-auto mb-3" />
              <h4 className="text-base font-semibold text-[#111b21]">No memories recorded yet</h4>
              <p className="text-xs text-[#777181] mt-1 max-w-sm mx-auto">
                Add your reflections, upload a photo, or save messages directly from chats into this capsule.
              </p>
              <button
                onClick={() => setShowAddMemoryModal(true)}
                className="mt-5 btn-aesthetic-primary px-4 py-2 text-xs font-semibold"
              >
                Add First Memory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEventMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white border border-[#eae5f1] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {msg.attachments && msg.attachments.length > 0 && msg.attachments[0].url && (
                      <div className="h-44 w-full rounded-xl overflow-hidden mb-3 bg-[#f8f5fc]">
                        <img
                          src={msg.attachments[0].url}
                          alt="Memory Attachment"
                          className="w-full h-full object-cover hover:scale-102 transition-transform cursor-pointer"
                          onClick={() => window.open(msg.attachments![0].url, '_blank')}
                        />
                      </div>
                    )}

                    <p className="text-xs text-[#111b21] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {msg.tags && msg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f1ebfa] text-[#8064b5]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f8f5fc] text-[11px] text-[#777181]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8064b5]" />
                      <span>{msg.memoryDate}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleEventHighlight(activeEvent.id, msg.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          msg.isHighlight ? 'text-amber-500 fill-amber-500' : 'text-[#777181] hover:text-amber-500'
                        }`}
                        title="Highlight memory"
                      >
                        <Star className={`w-3.5 h-3.5 ${msg.isHighlight ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => deleteEventMessage(activeEvent.id, msg.id)}
                        className="p-1 rounded-lg text-[#777181] hover:text-rose-600 transition-colors"
                        title="Delete memory entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Memory Modal */}
        {showAddMemoryModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#ede7f6] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ede7f6]">
                <div className="flex items-center gap-2 text-[#8064b5]">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-base font-bold text-[#111b21]">Add to {activeEvent.name}</h3>
                </div>
                <button onClick={() => setShowAddMemoryModal(false)} className="text-[#8a8494] hover:text-[#111b21]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMemorySubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#111b21] block mb-1">
                    Reflection, Thought, or Note <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write down what made this moment special..."
                    value={memoryContent}
                    onChange={(e) => setMemoryContent(e.target.value)}
                    className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111b21] block mb-1">
                    Photo URL <span className="text-gray-400 font-normal">(optional image link)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={memoryPhotoUrl}
                    onChange={(e) => setMemoryPhotoUrl(e.target.value)}
                    className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[#111b21] block mb-1">Date</label>
                    <input
                      type="date"
                      value={memoryDate}
                      onChange={(e) => setMemoryDate(e.target.value)}
                      className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#111b21] block mb-1">Tags</label>
                    <input
                      type="text"
                      placeholder="e.g. Vacation, Happy"
                      value={memoryTags}
                      onChange={(e) => setMemoryTags(e.target.value)}
                      className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#ede7f6]">
                  <button
                    type="button"
                    onClick={() => setShowAddMemoryModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#667781] hover:bg-[#f8f5fc] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-aesthetic-primary px-4 py-2 text-xs font-semibold"
                  >
                    Save Memory
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: MAIN MY SPACE DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f5fc] overflow-y-auto select-none">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#eae5f1] p-6 lg:p-7 shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-[#e9ddfb] text-[#8064b5]">
                  <Sparkles className="w-5 h-5 text-[#8064b5]" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#111b21]">My Space</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f1ebfa] text-[#8064b5] border border-[#ede7f6]">
                  Personal Memory Vault
                </span>
              </div>
              <p className="text-xs text-[#667781] max-w-xl">
                Your private digital sanctuary. Create custom event capsules, preserve chat moments, organize life milestones, and journal reflections.
              </p>
            </div>

            {/* Action Button: Create Event (ACTIVE) */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-aesthetic-primary flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
              title="Create new event capsule"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Event Capsule</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-medium text-[#667781]">Event Capsules</span>
              <p className="text-lg font-bold text-[#111b21] tabular-nums mt-0.5">{totalEvents}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-medium text-[#667781]">Saved Memories</span>
              <p className="text-lg font-bold text-[#8064b5] tabular-nums mt-0.5">{totalMemories}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-medium text-[#667781]">Photos & Media</span>
              <p className="text-lg font-bold text-[#111b21] tabular-nums mt-0.5">{totalPhotos}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-medium text-[#667781]">Documents</span>
              <p className="text-lg font-bold text-[#111b21] tabular-nums mt-0.5">{totalDocs}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-medium text-[#667781]">Voice Memos</span>
              <p className="text-lg font-bold text-[#111b21] tabular-nums mt-0.5">{totalAudio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar: Search, Categories & View Switcher */}
      <div className="max-w-6xl w-full mx-auto p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#667781] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search event capsules, notes, or tags..."
              value={mySpaceSearchQuery}
              onChange={(e) => setMySpaceSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#eae5f1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111b21] placeholder-[#667781] focus:outline-hidden focus:border-[#8064b5]"
            />
          </div>

          {/* View mode buttons: Events | Timeline */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#eae5f1] shadow-2xs self-start">
            <button
              onClick={() => setMySpaceViewMode('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mySpaceViewMode === 'events'
                  ? 'bg-[#8064b5] text-white shadow-xs'
                  : 'text-[#667781] hover:text-[#111b21]'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Capsules</span>
            </button>

            <button
              onClick={() => setMySpaceViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mySpaceViewMode === 'timeline'
                  ? 'bg-[#8064b5] text-white shadow-xs'
                  : 'text-[#667781] hover:text-[#111b21]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategoryFilter(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              selectedCategoryFilter === null
                ? 'bg-[#8064b5] text-white shadow-xs font-semibold'
                : 'bg-white border border-[#eae5f1] text-[#667781] hover:text-[#8064b5]'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                selectedCategoryFilter?.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-[#8064b5] text-white shadow-xs font-semibold'
                  : 'bg-white border border-[#eae5f1] text-[#667781] hover:text-[#8064b5]'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 3. Main Content Views */}
        {events.length === 0 && (
          <section className="mx-auto flex max-w-md flex-col items-center py-14 text-center">
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e9ddfb] text-[#8064b5]">
              <Sparkles className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-semibold text-[#292333]">Your memories deserve a space of their own.</h2>
            <p className="mt-2 text-sm leading-6 text-[#777181]">Create collections for photos, notes, and moments you want to keep together.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn-aesthetic-primary mt-5 px-5 py-2.5 text-xs font-semibold"
            >
              Create your first memory
            </button>
          </section>
        )}

        {/* A. EVENTS CARDS VIEW */}
        {mySpaceViewMode === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setActiveEventId(event.id)}
                className="group relative bg-white border border-[#eae5f1] hover:border-[#8064b5] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Event Cover Image */}
                <div className="relative h-44 w-full bg-[#f8f5fc] overflow-hidden">
                  <img
                    src={event.coverImageUrl}
                    alt={event.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-[#8064b5] shadow-xs">
                      {event.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {event.isFavorite && (
                        <span className="p-1 rounded-full bg-amber-400 text-white shadow-xs">
                          <Star className="w-3 h-3 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-bold drop-shadow-sm leading-snug line-clamp-1">
                      {event.name}
                    </h3>
                    {event.eventDate && (
                      <p className="text-[11px] text-white/90 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{event.eventDate}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Event Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#667781] line-clamp-2 leading-relaxed">
                    {event.description || 'Private event memories and attached documents.'}
                  </p>

                  <div className="pt-3 mt-3 border-t border-[#f8f5fc] flex items-center justify-between">
                    {/* Media counts icons */}
                    <div className="flex items-center gap-3 text-[11px] text-[#667781]">
                      <span className="flex items-center gap-1" title="Photos">
                        <ImageIcon className="w-3.5 h-3.5 text-[#8064b5]" />
                        <span>{event.mediaCounts.photos}</span>
                      </span>
                      <span className="flex items-center gap-1" title="Documents">
                        <FileText className="w-3.5 h-3.5 text-[#8064b5]" />
                        <span>{event.mediaCounts.documents}</span>
                      </span>
                      <span className="flex items-center gap-1" title="Voice Memos">
                        <Mic className="w-3.5 h-3.5 text-[#8064b5]" />
                        <span>{event.mediaCounts.audio}</span>
                      </span>
                    </div>

                    {/* Open Event Action */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#8064b5] group-hover:text-[#6e53a2]">
                      <span>Open Capsule</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* B. MEMORY TIMELINE VIEW */}
        {mySpaceViewMode === 'timeline' && (
          <div className="max-w-3xl mx-auto py-4 space-y-6">
            <div className="relative pl-6 border-l-2 border-[#8064b5]/40 space-y-8">
              {filteredEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-[#8064b5] shadow-xs" />

                  <div
                    onClick={() => setActiveEventId(evt.id)}
                    className="bg-white border border-[#eae5f1] hover:border-[#8064b5] p-4 rounded-2xl shadow-2xs cursor-pointer transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f1ebfa] text-[#8064b5]">
                          {evt.category}
                        </span>
                        <h4 className="text-sm font-bold text-[#111b21]">{evt.name}</h4>
                      </div>
                      <span className="text-[11px] text-[#667781] font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#8064b5]" />
                        <span>{evt.eventDate || 'Ongoing'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#667781] mb-3">{evt.description}</p>

                    {evt.coverImageUrl && (
                      <div className="h-44 w-full rounded-xl overflow-hidden mb-3">
                        <img
                          src={evt.coverImageUrl}
                          alt={evt.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-[#8064b5] font-semibold pt-2 border-t border-[#f8f5fc]">
                      <span>{evt.memoryCount} memory entries recorded</span>
                      <span className="flex items-center gap-1">
                        Open capsule <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Event Capsule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#ede7f6] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede7f6]">
              <div className="flex items-center gap-2 text-[#8064b5]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#111b21]">New Memory Capsule</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8a8494] hover:text-[#111b21] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCapsuleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#111b21] block mb-1">
                  Capsule Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Roadtrip, College Days, Project Launch"
                  value={newCapsuleName}
                  onChange={(e) => setNewCapsuleName(e.target.value)}
                  className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-xl px-3 py-2 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#111b21] block mb-1">Category</label>
                  <select
                    value={newCapsuleCategory}
                    onChange={(e) => setNewCapsuleCategory(e.target.value)}
                    className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-xl px-3 py-2 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                  >
                    <option value="Personal">Personal</option>
                    <option value="College">College</option>
                    <option value="Work">Work</option>
                    <option value="Trips">Trips</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#111b21] block mb-1">Event Date</label>
                  <input
                    type="date"
                    value={newCapsuleDate}
                    onChange={(e) => setNewCapsuleDate(e.target.value)}
                    className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-xl px-3 py-2 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111b21] block mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="A few words about this memory collection..."
                  value={newCapsuleDesc}
                  onChange={(e) => setNewCapsuleDesc(e.target.value)}
                  className="w-full bg-[#f8f5fc] border border-[#ede7f6] rounded-xl p-2.5 text-xs text-[#111b21] focus:bg-white focus:outline-hidden focus:border-[#8064b5]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111b21] block mb-1.5">
                  Select Cover Wallpaper
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COVERS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setNewCapsuleCover(preset.url)}
                      className={`relative h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        newCapsuleCover === preset.url
                          ? 'border-[#8064b5] scale-105 shadow-xs'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      {newCapsuleCover === preset.url && (
                        <div className="absolute inset-0 bg-[#8064b5]/40 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ede7f6]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#667781] hover:bg-[#f8f5fc] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="btn-aesthetic-primary px-5 py-2 text-xs font-semibold"
                >
                  {isSubmittingEvent ? 'Creating...' : 'Create Capsule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
