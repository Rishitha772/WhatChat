import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Star,
  Lock,
  Plus,
  Paperclip,
  Mic,
  Send,
  Image as ImageIcon,
  FileText,
  Tag,
  Trash2,
  Check,
  Bookmark,
  Download,
  Share2,
  Play,
  Pause,
  X,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { EventMessage, Attachment } from '../../types/whatchat';

export const EventChatView: React.FC = () => {
  const {
    activeEventId,
    setActiveEventId,
    events,
    eventMessages,
    addEventMessage,
    deleteEventMessage,
    toggleEventHighlight,
    updateEvent,
    user,
  } = useWhatChat();

  const [inputNote, setInputNote] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [memoryDateInput, setMemoryDateInput] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [isRecordingMemo, setIsRecordingMemo] = useState(false);
  const [memoSeconds, setMemoSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  const currentEvent = events.find((e) => e.id === activeEventId);
  const messagesList = activeEventId ? eventMessages[activeEventId] || [] : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesList.length]);

  useEffect(() => {
    let interval: any;
    if (isRecordingMemo) {
      interval = setInterval(() => setMemoSeconds((s) => s + 1), 1000);
    } else {
      setMemoSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingMemo]);

  if (!currentEvent) {
    return null;
  }

  const handleSendEntry = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputNote.trim()) return;

    addEventMessage(
      currentEvent.id,
      'note',
      inputNote.trim(),
      undefined,
      memoryDateInput,
      selectedTag ? [selectedTag] : ['Reflection']
    );

    setInputNote('');
    setSelectedTag('');
  };

  const handleAddSamplePhoto = (url: string, name: string) => {
    const photoAtt: Attachment = {
      id: `att_ev_${Date.now()}`,
      type: 'image',
      url,
      fileName: name,
      fileSize: '4.2 MB',
    };
    addEventMessage(
      currentEvent.id,
      'photo',
      inputNote.trim() || `Saved memory photograph to ${currentEvent.name}`,
      [photoAtt],
      memoryDateInput,
      ['PhotoMemory', currentEvent.category]
    );
    setShowPhotoModal(false);
    setInputNote('');
  };

  const handleAddSampleDoc = (title: string, filename: string) => {
    const docAtt: Attachment = {
      id: `att_ev_doc_${Date.now()}`,
      type: 'document',
      url: '#',
      fileName: filename,
      fileSize: '2.8 MB',
      mimeType: 'application/pdf',
    };
    addEventMessage(
      currentEvent.id,
      'document',
      title,
      [docAtt],
      memoryDateInput,
      ['Document', 'Vault']
    );
    setShowDocModal(false);
  };

  const handleFinishVoiceMemo = () => {
    setIsRecordingMemo(false);
    const audioAtt: Attachment = {
      id: `att_ev_audio_${Date.now()}`,
      type: 'audio',
      url: '#',
      fileName: `Memory_Voice_${Date.now()}.m4a`,
      fileSize: `${(0.4 * (memoSeconds || 2)).toFixed(1)} MB`,
      durationSeconds: memoSeconds || 4,
    };
    addEventMessage(
      currentEvent.id,
      'audio',
      'Personal voice memo & audio reflection',
      [audioAtt],
      memoryDateInput,
      ['VoiceReflection']
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F5FC] relative min-w-0 select-none">
      {/* 1. Header Bar with Event Context */}
      <header className="h-16 px-4 md:px-6 bg-white border-b border-[#EAE5F1] flex items-center justify-between shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setActiveEventId(null)}
            className="p-2 -ml-2 rounded-xl text-[#777181] hover:text-[#292333] hover:bg-[#F8F5FC] transition-colors"
            title="Back to My Space Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img
            src={currentEvent.coverImageUrl}
            alt={currentEvent.name}
            className="w-10 h-10 rounded-xl object-cover border border-[#EAE5F1] shrink-0"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#292333] truncate">
                {currentEvent.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9DDFB] text-[#8064B5]">
                {currentEvent.category}
              </span>
            </div>
            <p className="text-[11px] text-[#777181] flex items-center gap-1.5 truncate">
              <Calendar className="w-3 h-3 text-[#8064B5]" />
              <span>{currentEvent.eventDate || 'Ongoing Event'}</span>
              <span>·</span>
              <span>{messagesList.length} memory entries</span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 text-[#777181]">
          <button
            onClick={() => updateEvent(currentEvent.id, { isFavorite: !currentEvent.isFavorite })}
            className={`p-2 rounded-xl transition-colors ${
              currentEvent.isFavorite
                ? 'text-amber-500 bg-amber-50'
                : 'hover:bg-[#F8F5FC] hover:text-amber-500'
            }`}
            title="Favorite Event"
          >
            <Star className={`w-4 h-4 ${currentEvent.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() =>
              alert(`Exporting "${currentEvent.name}" memory archive as verified digital PDF book...`)
            }
            className="p-2 rounded-xl hover:bg-[#F8F5FC] hover:text-[#8064B5] transition-colors"
            title="Export memories"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Quick Action Toolbar: One-Click Memory Creators */}
      <div className="bg-[#FAF8FD] border-b border-[#EAE5F1] px-4 md:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-[#8064B5] uppercase tracking-wider shrink-0 mr-1">
          Quick Log:
        </span>

        <button
          onClick={() => setShowPhotoModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5F1] hover:border-[#B99AEF] hover:bg-[#E9DDFB]/30 text-xs font-semibold text-[#292333] transition-all whitespace-nowrap shadow-2xs"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#8064B5]" />
          <span>Add Photo</span>
        </button>

        <button
          onClick={() => setShowDocModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5F1] hover:border-[#B99AEF] hover:bg-[#E9DDFB]/30 text-xs font-semibold text-[#292333] transition-all whitespace-nowrap shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-[#8064B5]" />
          <span>Attach Document</span>
        </button>

        <button
          onClick={() => setIsRecordingMemo(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE5F1] hover:border-[#B99AEF] hover:bg-[#E9DDFB]/30 text-xs font-semibold text-[#292333] transition-all whitespace-nowrap shadow-2xs"
        >
          <Mic className="w-3.5 h-3.5 text-[#8064B5]" />
          <span>Record Audio Memo</span>
        </button>

        <div className="w-px h-4 bg-[#EAE5F1] mx-1"></div>

        <div className="flex items-center gap-1.5 text-xs text-[#777181] ml-auto">
          <span>Memory Date:</span>
          <input
            type="date"
            value={memoryDateInput}
            onChange={(e) => setMemoryDateInput(e.target.value)}
            className="bg-white border border-[#EAE5F1] rounded-lg px-2 py-0.5 text-xs text-[#292333] focus:outline-hidden"
          />
        </div>
      </div>

      {/* 3. Messages & Memory Timeline */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Event description card */}
        <div className="bg-white border border-[#EAE5F1] rounded-2xl p-4 shadow-2xs max-w-2xl mx-auto text-center space-y-2">
          <span className="text-[10px] font-bold text-[#8064B5] tracking-widest uppercase">
            Private Memory Log
          </span>
          <h3 className="text-base font-bold text-[#292333]">{currentEvent.name}</h3>
          <p className="text-xs text-[#777181] leading-relaxed">{currentEvent.description}</p>
        </div>

        {/* Entries list */}
        {messagesList.map((entry) => (
          <div key={entry.id} className="max-w-2xl mx-auto group">
            <div
              className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all relative ${
                entry.isHighlight
                  ? 'border-[#B99AEF] ring-2 ring-[#E9DDFB]'
                  : 'border-[#EAE5F1] hover:border-[#D9C7F7]'
              }`}
            >
              {/* Header inside entry */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#8064B5] bg-[#E9DDFB] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{entry.memoryDate}</span>
                  </span>

                  {entry.sourceChatName && (
                    <span className="text-[10px] font-medium text-[#777181]">
                      Forwarded from: <strong className="text-[#292333]">{entry.sourceChatName}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleEventHighlight(currentEvent.id, entry.id)}
                    className={`p-1 rounded-md transition-colors ${
                      entry.isHighlight
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-[#777181] hover:text-amber-500'
                    }`}
                    title="Mark as Highlight"
                  >
                    <Star className={`w-3.5 h-3.5 ${entry.isHighlight ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => deleteEventMessage(currentEvent.id, entry.id)}
                    className="p-1 rounded-md text-[#777181] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Attachments rendering */}
              {entry.attachments && entry.attachments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {entry.attachments.map((att) => {
                    if (att.type === 'image') {
                      return (
                        <div
                          key={att.id}
                          className="rounded-xl overflow-hidden border border-[#EAE5F1] cursor-pointer"
                          onClick={() => setPreviewImage(att.url)}
                        >
                          <img
                            src={att.url}
                            alt={att.fileName}
                            className="max-h-80 w-full object-cover hover:scale-[1.01] transition-transform"
                          />
                        </div>
                      );
                    }

                    if (att.type === 'document') {
                      return (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#F8F5FC] border border-[#EAE5F1]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#E9DDFB] text-[#8064B5] flex items-center justify-center">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#292333]">{att.fileName}</p>
                              <span className="text-[10px] text-[#777181]">{att.fileSize} · PDF</span>
                            </div>
                          </div>
                          <button
                            onClick={() => alert(`Opening ${att.fileName} via S3 object storage...`)}
                            className="p-2 text-[#8064B5] hover:bg-white rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }

                    if (att.type === 'audio') {
                      const isPlaying = playingAudioId === att.id;
                      return (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F5FC] border border-[#EAE5F1]"
                        >
                          <button
                            onClick={() => setPlayingAudioId(isPlaying ? null : att.id)}
                            className="w-8 h-8 rounded-full bg-[#8064B5] text-white flex items-center justify-center shrink-0"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-1 h-5">
                              {[8, 14, 20, 10, 18, 12, 16, 22, 14, 18, 8, 12, 16].map((h, i) => (
                                <span
                                  key={i}
                                  className={`w-1 rounded-full ${
                                    isPlaying ? 'bg-[#8064B5] animate-pulse' : 'bg-[#B99AEF]'
                                  }`}
                                  style={{ height: `${isPlaying ? h : 10}px` }}
                                ></span>
                              ))}
                            </div>
                            <span className="text-[10px] text-[#777181] mt-0.5 block">
                              Voice Reflection · {att.durationSeconds || 12}s
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}

              {/* Main textual content */}
              <p className="text-xs text-[#292333] leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>

              {/* Tags footer */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#F8F5FC]">
                  {entry.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-[#777181] hover:text-[#8064B5] cursor-pointer"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {/* 4. Audio Memo Recording Indicator */}
      {isRecordingMemo && (
        <div className="px-5 py-3 bg-[#E9DDFB] border-t border-[#D9C7F7] flex items-center justify-between text-xs text-[#292333]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-semibold text-[#8064B5]">Recording Personal Voice Reflection...</span>
            <span className="font-mono tabular-nums text-xs font-bold text-[#292333]">
              00:{memoSeconds < 10 ? `0${memoSeconds}` : memoSeconds}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecordingMemo(false)}
              className="px-3 py-1 text-xs text-[#777181] hover:text-rose-500"
            >
              Cancel
            </button>
            <button
              onClick={handleFinishVoiceMemo}
              className="px-3 py-1 bg-[#8064B5] text-white rounded-lg text-xs font-semibold hover:bg-[#6c519d]"
            >
              Save to Memory
            </button>
          </div>
        </div>
      )}

      {/* 5. Memory Entry Input Bar */}
      <footer className="p-3 md:p-4 bg-white border-t border-[#EAE5F1] shrink-0">
        <form onSubmit={handleSendEntry} className="flex items-center gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder={`Log a thought, milestone, or reflection for ${currentEvent.name}...`}
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            className="flex-1 bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-4 py-2.5 text-xs text-[#292333] placeholder-[#777181] focus:outline-hidden focus:border-[#B99AEF] focus:bg-white"
          />

          <button
            type="submit"
            disabled={!inputNote.trim()}
            className={`p-2.5 rounded-xl transition-all shadow-xs ${
              inputNote.trim()
                ? 'bg-[#E9DDFB] text-[#8064B5] hover:bg-[#D9C7F7] hover:scale-105 active:scale-95 font-semibold'
                : 'bg-[#F8F5FC] text-[#777181] cursor-not-allowed opacity-60'
            }`}
            title="Log Memory Entry"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      </footer>

      {/* 6. Photo Picker Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#EAE5F1]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#292333]">Attach Photo Memory</h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-[#777181]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#777181] mb-3">
              Select an image from your high-resolution memory collection:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                onClick={() =>
                  handleAddSamplePhoto(
                    '/src/assets/images/event_birthday_celebration_1794229996051.jpg',
                    'Birthday_Frosted_Cake.jpg'
                  )
                }
                className="h-28 rounded-xl overflow-hidden border border-[#EAE5F1] hover:border-[#8064B5] cursor-pointer group"
              >
                <img
                  src="/src/assets/images/event_birthday_celebration_1794229996051.jpg"
                  alt="Birthday"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div
                onClick={() =>
                  handleAddSamplePhoto(
                    '/src/assets/images/event_college_farewell_1794229996497.jpg',
                    'College_Farewell_Quad.jpg'
                  )
                }
                className="h-28 rounded-xl overflow-hidden border border-[#EAE5F1] hover:border-[#8064B5] cursor-pointer group"
              >
                <img
                  src="/src/assets/images/event_college_farewell_1794229996497.jpg"
                  alt="Farewell"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div
                onClick={() =>
                  handleAddSamplePhoto(
                    '/src/assets/images/event_mountain_travel_1794229996300.jpg',
                    'Alpine_Mist_Morning.jpg'
                  )
                }
                className="h-28 rounded-xl overflow-hidden border border-[#EAE5F1] hover:border-[#8064B5] cursor-pointer group"
              >
                <img
                  src="/src/assets/images/event_mountain_travel_1794229996300.jpg"
                  alt="Mountain"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div
                onClick={() =>
                  handleAddSamplePhoto(
                    '/src/assets/images/whatchat_hero_banner_1794229994931.jpg',
                    'WhatChat_Brand_Polaroids.jpg'
                  )
                }
                className="h-28 rounded-xl overflow-hidden border border-[#EAE5F1] hover:border-[#8064B5] cursor-pointer group"
              >
                <img
                  src="/src/assets/images/whatchat_hero_banner_1794229994931.jpg"
                  alt="Polaroids"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-1.5 text-xs text-[#777181] hover:text-[#292333]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Doc Picker Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#EAE5F1]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#292333]">Attach Document / Certificate</h3>
              <button onClick={() => setShowDocModal(false)} className="text-[#777181]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() =>
                  handleAddSampleDoc('Official Academic Degree & Honors Letter', 'Academic_Degree_2026.pdf')
                }
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#EAE5F1] hover:bg-[#F8F5FC] text-left"
              >
                <FileText className="w-5 h-5 text-[#8064B5]" />
                <div>
                  <p className="text-xs font-bold text-[#292333]">Academic_Degree_2026.pdf</p>
                  <span className="text-[10px] text-[#777181]">2.4 MB · Verified Academic Scans</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleAddSampleDoc('TechX 1st Prize Winner Certificate', 'TechX_Winner_Certificate.pdf')
                }
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#EAE5F1] hover:bg-[#F8F5FC] text-left"
              >
                <FileText className="w-5 h-5 text-[#8064B5]" />
                <div>
                  <p className="text-xs font-bold text-[#292333]">TechX_Winner_Certificate.pdf</p>
                  <span className="text-[10px] text-[#777181]">1.8 MB · Award Verification</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleAddSampleDoc('Confidential Seed Pitch Deck v3.2', 'WhatChat_Seed_Deck.pdf')
                }
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#EAE5F1] hover:bg-[#F8F5FC] text-left"
              >
                <FileText className="w-5 h-5 text-[#8064B5]" />
                <div>
                  <p className="text-xs font-bold text-[#292333]">WhatChat_Seed_Deck.pdf</p>
                  <span className="text-[10px] text-[#777181]">6.7 MB · Pitch & Projections</span>
                </div>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDocModal(false)}
                className="px-4 py-1.5 text-xs text-[#777181] hover:text-[#292333]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Full-screen preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#E9DDFB] p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Memory preview"
              className="rounded-2xl max-h-[80vh] w-auto object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
