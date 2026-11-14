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
  MoreVertical,
  Trash2,
  Share2,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { MySpaceEvent } from '../../types/whatchat';

export const MySpaceView: React.FC = () => {
  const {
    events,
    setActiveEventId,
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    mySpaceSearchQuery,
    setMySpaceSearchQuery,
    mySpaceViewMode,
    setMySpaceViewMode,
    deleteEvent,
    eventMessages,
  } = useWhatChat();

  const [activeMenuEventId, setActiveMenuEventId] = useState<string | null>(null);

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

  // Collect all media across events for Personal Gallery view
  const allGalleryItems = Object.entries(eventMessages).flatMap(([eventId, msgs]) => {
    const parentEvent = events.find((e) => e.id === eventId);
    return msgs.flatMap((m) => {
      const items: any[] = [];
      if (m.attachments) {
        m.attachments.forEach((att) => {
          items.push({
            id: `${m.id}_${att.id}`,
            eventId,
            eventName: parentEvent?.name || 'Event',
            category: parentEvent?.category || 'General',
            type: att.type,
            url: att.url,
            fileName: att.fileName,
            fileSize: att.fileSize,
            memoryDate: m.memoryDate,
            caption: m.content,
          });
        });
      }
      return items;
    });
  });

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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f5fc] overflow-y-auto select-none">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#eae5f1] p-6 lg:p-7 shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-[#e9ddfb] text-[#8064b5]">
                  <Sparkles className="w-5 h-5 text-[#b99aef]" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#111b21]">My Space</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e9ddfb] text-[#8064b5]">
                  Personal Memory Vault
                </span>
              </div>
              <p className="text-xs text-[#667781] max-w-xl">
                Your private digital sanctuary. Create custom event capsules, preserve chat moments, organize life milestones, and journal reflections.
              </p>
            </div>

            {/* Action Button: Create Event */}
            <button
              disabled
              title="Memory creation is not available until the My Space API is connected"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#8064b5] hover:bg-[#947bc3] text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Event Capsule</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-[#667781]">Event Capsules</span>
              <p className="text-lg font-bold text-[#111b21] tabular-nums mt-0.5">{totalEvents}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-[#667781]">Saved Memories</span>
              <p className="text-lg font-bold text-[#8064b5] tabular-nums mt-0.5">{totalMemories}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-[#667781]">Photos & Media</span>
              <p className="text-lg font-bold text-[#111b21] tabular-nums mt-0.5">{totalPhotos}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-[#667781]">Documents</span>
              <p className="text-lg font-bold text-[#111b21] tabular-nums mt-0.5">{totalDocs}</p>
            </div>

            <div className="bg-[#f8f5fc] border border-[#eae5f1] rounded-lg p-3 flex flex-col justify-between">
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
              className="w-full bg-white border border-[#eae5f1] rounded-lg pl-9 pr-3 py-2 text-xs text-[#111b21] placeholder-[#667781] focus:outline-hidden focus:border-[#947bc3]"
            />
          </div>

          {/* View mode buttons: Events | Timeline | Gallery */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#eae5f1] shadow-2xs self-start">
            <button
              onClick={() => setMySpaceViewMode('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                mySpaceViewMode === 'events'
                  ? 'bg-[#e9ddfb] text-[#8064b5]'
                  : 'text-[#667781] hover:text-[#111b21]'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Capsules</span>
            </button>

            <button
              onClick={() => setMySpaceViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                mySpaceViewMode === 'timeline'
                  ? 'bg-[#e9ddfb] text-[#8064b5]'
                  : 'text-[#667781] hover:text-[#111b21]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>

            <button
              onClick={() => setMySpaceViewMode('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                mySpaceViewMode === 'gallery'
                  ? 'bg-[#e9ddfb] text-[#8064b5]'
                  : 'text-[#667781] hover:text-[#111b21]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media Vault</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategoryFilter(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              selectedCategoryFilter === null
                ? 'bg-[#8064b5] text-white shadow-xs'
                : 'bg-white border border-[#eae5f1] text-[#667781] hover:text-[#111b21]'
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
                  ? 'bg-[#8064b5] text-white shadow-xs'
                  : 'bg-white border border-[#eae5f1] text-[#667781] hover:text-[#111b21]'
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
              disabled
              title="Memory creation is not available until the My Space API is connected"
              className="mt-5 rounded-lg bg-[#8064b5] px-4 py-2.5 text-sm font-semibold text-white opacity-60"
            >
              Create your first memory
            </button>
            <p className="mt-3 text-xs text-[#9994a1]">Memory storage is not connected yet. No data will be saved until the backend is ready.</p>
          </section>
        )}

        {/* A. EVENTS CARDS VIEW */}
        {mySpaceViewMode === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setActiveEventId(event.id)}
                className="group relative bg-white border border-[#eae5f1] hover:border-[#947bc3] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
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
                      {event.isLocked && (
                        <span className="p-1 rounded-full bg-black/60 text-white shadow-xs">
                          <Lock className="w-3 h-3" />
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
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#8064b5] group-hover:text-[#947bc3]">
                      <span>Open Space</span>
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
            <div className="relative pl-6 border-l-2 border-[#947bc3]/40 space-y-8">
              {filteredEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Timeline dot */}
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-[#8064b5] shadow-xs"></span>

                  <div
                    onClick={() => setActiveEventId(evt.id)}
                    className="bg-white border border-[#eae5f1] hover:border-[#947bc3] p-4 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#e9ddfb] text-[#8064b5]">
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
                      <div className="h-44 w-full rounded-lg overflow-hidden mb-3">
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
                        View capsule <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* C. PERSONAL GALLERY VIEW */}
        {mySpaceViewMode === 'gallery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111b21]">All Saved Media & Documents</h3>
              <span className="text-xs text-[#667781]">{allGalleryItems.length} items preserved</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allGalleryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveEventId(item.eventId)}
                  className="bg-white border border-[#eae5f1] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                >
                  {item.type === 'image' ? (
                    <div className="h-36 w-full relative">
                      <img
                        src={item.url}
                        alt={item.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : item.type === 'document' ? (
                    <div className="h-36 w-full bg-[#f8f5fc] flex flex-col items-center justify-center p-3 text-center">
                      <FileText className="w-8 h-8 text-[#8064b5] mb-2" />
                      <p className="text-xs font-semibold text-[#111b21] truncate max-w-full">
                        {item.fileName}
                      </p>
                      <span className="text-[10px] text-[#667781] mt-0.5">{item.fileSize}</span>
                    </div>
                  ) : (
                    <div className="h-36 w-full bg-[#f8f5fc] flex flex-col items-center justify-center p-3 text-center">
                      <Mic className="w-8 h-8 text-[#8064b5] mb-2" />
                      <p className="text-xs font-semibold text-[#111b21]">Voice Reflection</p>
                      <span className="text-[10px] text-[#667781] mt-0.5">{item.fileSize}</span>
                    </div>
                  )}

                  <div className="p-2.5">
                    <p className="text-[11px] font-bold text-[#111b21] truncate">{item.eventName}</p>
                    <span className="text-[10px] text-[#667781]">{item.memoryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
