import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Pin,
  Star,
  Check,
  CheckCheck,
  FileText,
  Sparkles,
  Reply,
  Forward,
  Trash2,
  Edit2,
  X,
  Play,
  Pause,
  Download,
  Info,
  VolumeX,
  Volume2,
  Lock,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { Message, Attachment, ReplyPreview } from '../../types/whatchat';

export const ChatView: React.FC = () => {
  const {
    activeConversationId,
    setActiveConversationId,
    conversations,
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    starMessage,
    addReaction,
    toggleMuteConversation,
    togglePinConversation,
    toggleFavoriteConversation,
    contacts,
    user,
    setSaveToEventModalData,
    typingContact,
    setActiveTab,
    setActiveEventId,
  } = useWhatChat();

  const [inputText, setInputText] = useState('');
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchKeyword, setChatSearchKeyword] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyPreview | null>(null);
  const [isEditingMessageId, setIsEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const convMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length, typingContact]);

  // Audio recording timer simulation
  useEffect(() => {
    let interval: any;
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  if (!currentConv) {
    return (
      <div className="flex-1 bg-[#F8F5FC] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#E9DDFB] flex items-center justify-center text-[#8064B5] mb-4 shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#292333]">WhatChat Web</h2>
        <p className="text-sm text-[#777181] max-w-sm mt-1">
          Select a chat to start messaging or head to <span className="font-semibold text-[#8064B5]">My Space</span> to organize your personal event memories.
        </p>
      </div>
    );
  }

  // Find other contact if direct
  const otherParticipantId = currentConv.participants.find((id) => id !== 'usr_me');
  const contact = contacts.find((c) => c.id === otherParticipantId);

  // Filter messages if search is active
  const displayedMessages = convMessages.filter((m) => {
    if (!chatSearchKeyword.trim()) return true;
    return m.text.toLowerCase().includes(chatSearchKeyword.toLowerCase());
  });

  // Find pinned message
  const pinnedMessage = convMessages.find((m) => m.isPinned);

  // Mention logic
  const isTypingMention = inputText.includes('@');
  const mentionQuery = isTypingMention
    ? inputText.slice(inputText.lastIndexOf('@') + 1).toLowerCase()
    : '';

  const mentionCandidates = currentConv.type === 'group'
    ? [
        { handle: 'all', name: 'Everyone in group' },
        ...currentConv.participants
          .filter((p) => p !== user?.id)
          .map((p) => {
            const c = contacts.find((cnt) => cnt.id === p);
            return {
              handle: c?.username || c?.displayName.replace(/\s+/g, '_').toLowerCase() || 'member',
              name: c?.displayName || 'Member',
            };
          }),
      ].filter((m) => m.handle.toLowerCase().includes(mentionQuery))
    : [];

  const handleSelectMention = (handle: string) => {
    const lastAtIndex = inputText.lastIndexOf('@');
    const newText = inputText.slice(0, lastAtIndex) + `@${handle} `;
    setInputText(newText);
    inputRef.current?.focus();
  };

  const renderMessageText = (text: string) => {
    const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
    const parts = text.split(mentionRegex);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="font-bold text-[#8064B5] bg-[#E9DDFB]/80 px-1.5 py-0.5 rounded-sm inline-block mr-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleSend = () => {
    if (!inputText.trim() && !replyingTo) return;
    sendMessage(currentConv.id, inputText.trim(), undefined, replyingTo || undefined);
    setInputText('');
    setReplyingTo(null);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingAudio(false);
    const audioAttachment: Attachment = {
      id: `att_voice_${Date.now()}`,
      type: 'audio',
      url: '#',
      fileName: `Voice_Note_${new Date().toISOString().slice(11, 19)}.m4a`,
      fileSize: `${(0.4 * (recordingSeconds || 2)).toFixed(1)} MB`,
      durationSeconds: recordingSeconds || 3,
    };
    sendMessage(
      currentConv.id,
      'Voice Message',
      [audioAttachment],
      replyingTo || undefined
    );
    setReplyingTo(null);
  };

  const handleSendPhotoMock = (sampleUrl: string, sampleName: string) => {
    const photoAttachment: Attachment = {
      id: `att_img_${Date.now()}`,
      type: 'image',
      url: sampleUrl,
      fileName: sampleName,
      fileSize: '3.6 MB',
    };
    sendMessage(
      currentConv.id,
      'Shared a photo',
      [photoAttachment],
      replyingTo || undefined
    );
    setShowAttachmentMenu(false);
    setReplyingTo(null);
  };

  const handleSendDocMock = () => {
    const docAttachment: Attachment = {
      id: `att_doc_${Date.now()}`,
      type: 'document',
      url: '#',
      fileName: 'Project_Specification_Summary.pdf',
      fileSize: '2.1 MB',
      mimeType: 'application/pdf',
    };
    sendMessage(
      currentConv.id,
      'Shared a document',
      [docAttachment],
      replyingTo || undefined
    );
    setShowAttachmentMenu(false);
    setReplyingTo(null);
  };

  const handleSaveEdit = (msgId: string) => {
    if (editingText.trim()) {
      editMessage(currentConv.id, msgId, editingText.trim());
    }
    setIsEditingMessageId(null);
    setEditingText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F5FC] relative min-w-0 select-none">
      {/* 1. Header Bar */}
      <header className="h-16 px-4 md:px-5 bg-white border-b border-[#EAE5F1] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={() => setActiveConversationId(null)}
            className="md:hidden p-1.5 -ml-1 text-[#777181] hover:text-[#292333] rounded-lg"
            title="Back to conversation list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
            onClick={() => setShowConversationInfo(!showConversationInfo)}
          >
            <div className="relative shrink-0">
              <img
                src={currentConv.avatarUrl}
                alt={currentConv.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-[#EAE5F1]"
              />
              {currentConv.type === 'direct' && contact?.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5EAA85] border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-[#292333] truncate">{currentConv.name}</h2>
                {currentConv.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
              </div>
              <p className="text-[11px] text-[#777181] truncate">
                {currentConv.type === 'group'
                  ? `${currentConv.participants.length} members · ${currentConv.groupCategory || 'Group'}`
                  : contact?.isOnline
                  ? 'Online'
                  : contact?.lastSeen || 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 text-[#777181]">
          {/* Search inside conversation */}
          <button
            onClick={() => setIsSearchingInChat(!isSearchingInChat)}
            className={`p-2 rounded-lg transition-colors ${
              isSearchingInChat ? 'bg-[#E9DDFB] text-[#8064B5]' : 'hover:bg-[#F8F5FC] hover:text-[#292333]'
            }`}
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick audio call simulation */}
          <button
            onClick={() => alert(`Starting secure voice call with ${currentConv.name}...`)}
            className="p-2 rounded-lg hover:bg-[#F8F5FC] hover:text-[#292333] transition-colors"
            title="Voice call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video call simulation */}
          <button
            onClick={() => alert(`Starting encrypted video call with ${currentConv.name}...`)}
            className="p-2 rounded-lg hover:bg-[#F8F5FC] hover:text-[#292333] transition-colors"
            title="Video call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Conversation info toggle */}
          <button
            onClick={() => setShowConversationInfo(!showConversationInfo)}
            className="p-2 rounded-lg hover:bg-[#F8F5FC] hover:text-[#292333] transition-colors"
            title="Details & settings"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. In-Chat Search Bar Drawer */}
      {isSearchingInChat && (
        <div className="px-5 py-2 bg-white border-b border-[#EAE5F1] flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-[#777181]" />
            <input
              type="text"
              placeholder="Search in this conversation..."
              value={chatSearchKeyword}
              onChange={(e) => setChatSearchKeyword(e.target.value)}
              className="w-full text-xs bg-transparent border-0 focus:outline-hidden text-[#292333]"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#777181]">
              {displayedMessages.length} results
            </span>
            <button
              onClick={() => {
                setIsSearchingInChat(false);
                setChatSearchKeyword('');
              }}
              className="text-[#777181] hover:text-[#292333]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Pinned Message Strip */}
      {pinnedMessage && (
        <div className="bg-[#E9DDFB]/60 border-b border-[#D9C7F7] px-5 py-2 flex items-center justify-between text-xs text-[#292333] shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-[#8064B5] fill-[#8064B5] shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-[#8064B5] mr-1">Pinned:</span>
              <span className="text-[#292333]">{pinnedMessage.text || 'Pinned attachment'}</span>
            </div>
          </div>
          <button
            onClick={() => pinMessage(currentConv.id, pinnedMessage.id)}
            className="text-[11px] text-[#8064B5] hover:underline shrink-0 ml-2 font-medium"
          >
            Unpin
          </button>
        </div>
      )}

      {/* 4. Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {/* Privacy encryption banner */}
        <div className="flex justify-center my-3">
          <div className="bg-[#EAE5F1]/50 border border-[#EAE5F1] rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-[11px] text-[#777181]">
            <Lock className="w-3 h-3 text-[#8064B5]" />
            <span>Messages and calls are end-to-end encrypted. No third party can read them.</span>
          </div>
        </div>

        {displayedMessages.map((msg) => {
          const isSentByMe = msg.senderId === user?.id;
          const isEditing = isEditingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group relative ${
                isSentByMe ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl p-3 text-xs shadow-2xs transition-all ${
                  isSentByMe
                    ? 'bg-[#E9DDFB] text-[#292333] border border-[#D9C7F7] rounded-tr-xs'
                    : 'bg-white text-[#292333] border border-[#EAE5F1] rounded-tl-xs'
                }`}
              >
                {/* Sender Name in Group Chat */}
                {!isSentByMe && currentConv.type === 'group' && (
                  <p className="text-[11px] font-bold text-[#8064B5] mb-1">
                    {msg.senderName}
                  </p>
                )}

                {/* Quoted Reply Preview */}
                {msg.replyTo && (
                  <div className="mb-2 p-2 rounded-lg bg-black/5 border-l-2 border-[#8064B5] text-[11px]">
                    <span className="font-semibold text-[#8064B5] block">
                      {msg.replyTo.senderName}
                    </span>
                    <p className="text-[#777181] truncate">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* Saved to My Space Indicator Tag */}
                {msg.savedToEventId && (
                  <button
                    onClick={() => {
                      setActiveTab('myspace');
                      setActiveEventId(msg.savedToEventId || null);
                    }}
                    className="mb-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/70 border border-[#B99AEF] text-[10px] font-semibold text-[#8064B5] hover:bg-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-[#8064B5]" />
                    <span>Saved to My Space: {msg.savedToEventName || 'Event'}</span>
                  </button>
                )}

                {/* Attachments rendering */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {msg.attachments.map((att) => {
                      if (att.type === 'image') {
                        return (
                          <div key={att.id} className="relative group/att rounded-xl overflow-hidden border border-[#EAE5F1]">
                            <img
                              src={att.url}
                              alt={att.fileName}
                              referrerPolicy="no-referrer"
                              className="max-h-72 w-full object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                              onClick={() => setPreviewImage(att.url)}
                            />
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-xs text-white px-2 py-1 rounded-md text-[10px]">
                              <span>{att.fileSize}</span>
                            </div>
                          </div>
                        );
                      }

                      if (att.type === 'audio') {
                        const isPlaying = playingAudioId === att.id;
                        return (
                          <div
                            key={att.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 border border-[#EAE5F1] min-w-56"
                          >
                            <button
                              onClick={() => setPlayingAudioId(isPlaying ? null : att.id)}
                              className="w-8 h-8 rounded-full bg-[#8064B5] text-white flex items-center justify-center shrink-0 hover:bg-[#6c519d] transition-colors"
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-1 h-5">
                                {[8, 14, 20, 10, 18, 12, 16, 22, 14, 18, 8, 12, 16].map((h, i) => (
                                  <span
                                    key={i}
                                    className={`w-1 rounded-full transition-all ${
                                      isPlaying ? 'bg-[#8064B5] animate-pulse' : 'bg-[#B99AEF]'
                                    }`}
                                    style={{ height: `${isPlaying ? h : 10}px` }}
                                  ></span>
                                ))}
                              </div>
                              <div className="flex justify-between text-[10px] text-[#777181] mt-1">
                                <span>Voice Note</span>
                                <span>{att.durationSeconds ? `${att.durationSeconds}s` : '0:14'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (att.type === 'document') {
                        return (
                          <div
                            key={att.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 border border-[#EAE5F1] min-w-56"
                          >
                            <div className="w-9 h-9 rounded-lg bg-[#E9DDFB] text-[#8064B5] flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#292333] truncate">
                                {att.fileName}
                              </p>
                              <span className="text-[10px] text-[#777181]">{att.fileSize} · PDF</span>
                            </div>
                            <button
                              onClick={() => alert(`Downloading ${att.fileName} via S3 presigned URL...`)}
                              className="p-1.5 text-[#777181] hover:text-[#8064B5] hover:bg-[#F8F5FC] rounded-lg transition-colors"
                              title="Download document"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}

                {/* Text Content */}
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-white border border-[#B99AEF] rounded-lg px-2 py-1 text-xs text-[#292333] focus:outline-hidden"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setIsEditingMessageId(null)}
                        className="px-2 py-0.5 text-[10px] text-[#777181]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="px-2 py-0.5 text-[10px] bg-[#8064B5] text-white rounded-md"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`whitespace-pre-wrap leading-relaxed ${msg.isDeletedForEveryone ? 'italic text-[#777181]' : ''}`}>
                    {renderMessageText(msg.text)}
                  </div>
                )}

                {/* Bottom Meta: Timestamp & Read Status */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#777181]">
                  {msg.isStarred && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                  {msg.isPinned && <Pin className="w-2.5 h-2.5 text-[#8064B5] fill-[#8064B5]" />}
                  {msg.isEdited && <span className="italic">edited</span>}
                  <span>{msg.timestamp}</span>

                  {isSentByMe && (
                    <span className="ml-0.5">
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#8064B5]" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#777181]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-[#777181]" />
                      )}
                    </span>
                  )}
                </div>

                {/* Reactions list */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/5">
                    {msg.reactions.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => addReaction(currentConv.id, msg.id, r.emoji)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-transform hover:scale-105 ${
                          r.users.includes(user?.id || '')
                            ? 'bg-[#E9DDFB] border-[#B99AEF] font-semibold text-[#8064B5]'
                            : 'bg-white border-[#EAE5F1] text-[#292333]'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Hover Actions Bar */}
                <div
                  className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-[#EAE5F1] rounded-full px-2 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 ${
                    isSentByMe ? 'right-0' : 'left-0'
                  }`}
                >
                  {/* Flagship Save to My Space Button */}
                  <button
                    onClick={() => setSaveToEventModalData(msg)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#8064B5] hover:text-[#6c519d] px-1 py-0.5 hover:bg-[#F8F5FC] rounded-md transition-colors"
                    title="Save to My Space Event"
                  >
                    <Sparkles className="w-3 h-3 text-[#8064B5]" />
                    <span className="hidden sm:inline">Save to My Space</span>
                  </button>

                  <div className="w-px h-3 bg-[#EAE5F1]"></div>

                  {/* Quick Emojis */}
                  <button
                    onClick={() => addReaction(currentConv.id, msg.id, '❤️')}
                    className="hover:scale-125 transition-transform text-xs"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => addReaction(currentConv.id, msg.id, '👍')}
                    className="hover:scale-125 transition-transform text-xs"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => addReaction(currentConv.id, msg.id, '💜')}
                    className="hover:scale-125 transition-transform text-xs"
                  >
                    💜
                  </button>

                  <div className="w-px h-3 bg-[#EAE5F1]"></div>

                  {/* Reply */}
                  <button
                    onClick={() =>
                      setReplyingTo({
                        id: msg.id,
                        text: msg.text || 'Attachment',
                        senderName: msg.senderName,
                      })
                    }
                    className="p-1 hover:text-[#8064B5] rounded-md transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-3 h-3" />
                  </button>

                  {/* Star */}
                  <button
                    onClick={() => starMessage(currentConv.id, msg.id)}
                    className="p-1 hover:text-amber-500 rounded-md transition-colors"
                    title="Star message"
                  >
                    <Star className={`w-3 h-3 ${msg.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  {/* Pin */}
                  <button
                    onClick={() => pinMessage(currentConv.id, msg.id)}
                    className="p-1 hover:text-[#8064B5] rounded-md transition-colors"
                    title="Pin message"
                  >
                    <Pin className={`w-3 h-3 ${msg.isPinned ? 'fill-[#8064B5] text-[#8064B5]' : ''}`} />
                  </button>

                  {/* Edit (if sent by me) */}
                  {isSentByMe && !msg.isDeletedForEveryone && (
                    <button
                      onClick={() => {
                        setIsEditingMessageId(msg.id);
                        setEditingText(msg.text);
                      }}
                      className="p-1 hover:text-[#8064B5] rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (isSentByMe) {
                        const forEveryone = confirm('Delete for everyone? Click Cancel to delete for yourself only.');
                        deleteMessage(currentConv.id, msg.id, forEveryone);
                      } else {
                        deleteMessage(currentConv.id, msg.id, false);
                      }
                    }}
                    className="p-1 hover:text-rose-500 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Typing indicator simulation */}
        {typingContact && typingContact.conversationId === currentConv.id && (
          <div className="flex items-center gap-2 text-xs text-[#777181] bg-white border border-[#EAE5F1] rounded-2xl rounded-tl-xs px-3.5 py-2 w-fit shadow-2xs">
            <span className="font-semibold text-[#8064B5]">{typingContact.name}</span>
            <span>is typing</span>
            <div className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-[#B99AEF] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#B99AEF] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-[#B99AEF] rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Reply Preview Banner */}
      {replyingTo && (
        <div className="px-5 py-2 bg-white border-t border-[#EAE5F1] flex items-center justify-between text-xs text-[#292333] shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-3.5 h-3.5 text-[#8064B5]" />
            <div className="truncate">
              <span className="font-semibold text-[#8064B5]">Replying to {replyingTo.senderName}:</span>
              <span className="text-[#777181] ml-1">{replyingTo.text}</span>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-[#777181] hover:text-[#292333]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6. Audio Recording Banner */}
      {isRecordingAudio && (
        <div className="px-5 py-3 bg-[#E9DDFB] border-t border-[#D9C7F7] flex items-center justify-between text-xs text-[#292333]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-semibold text-[#8064B5]">Recording Voice Memo...</span>
            <span className="font-mono tabular-nums text-xs font-bold text-[#292333]">
              00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecordingAudio(false)}
              className="px-3 py-1 text-xs text-[#777181] hover:text-rose-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="px-3 py-1 bg-[#8064B5] text-white rounded-lg text-xs font-semibold hover:bg-[#6c519d]"
            >
              Send Voice Note
            </button>
          </div>
        </div>
      )}

      {/* 7. Input Bottom Bar */}
      <footer className="p-3 md:p-4 bg-white border-t border-[#EAE5F1] shrink-0">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          {/* Attachment Button & Popover */}
          <div className="relative">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className={`p-2 rounded-xl transition-colors ${
                showAttachmentMenu ? 'bg-[#E9DDFB] text-[#8064B5]' : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
              }`}
              title="Attach media or document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {showAttachmentMenu && (
              <div className="absolute bottom-12 left-0 w-60 bg-white border border-[#EAE5F1] rounded-2xl shadow-xl p-2 z-30 space-y-1">
                <button
                  onClick={() =>
                    handleSendPhotoMock(
                      '/src/assets/images/event_birthday_celebration_1794229996051.jpg',
                      'Birthday_Celebration_Memory.jpg'
                    )
                  }
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-left rounded-xl hover:bg-[#F8F5FC] text-[#292333]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E9DDFB] text-[#8064B5] flex items-center justify-center">
                    📸
                  </div>
                  <div>
                    <p className="font-semibold">Photo & Video</p>
                    <span className="text-[10px] text-[#777181]">Share from library</span>
                  </div>
                </button>

                <button
                  onClick={handleSendDocMock}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-left rounded-xl hover:bg-[#F8F5FC] text-[#292333]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E9DDFB] text-[#8064B5] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Document (PDF/Doc)</p>
                    <span className="text-[10px] text-[#777181]">Preserved in S3 storage</span>
                  </div>
                </button>

                <div className="border-t border-[#EAE5F1] my-1"></div>

                <button
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    setActiveTab('myspace');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-left rounded-xl hover:bg-[#F8F5FC] text-[#8064B5]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E9DDFB] text-[#8064B5] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Open My Space</p>
                    <span className="text-[10px] text-[#777181]">View personal events</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Emoji Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-colors ${
                showEmojiPicker ? 'bg-[#E9DDFB] text-[#8064B5]' : 'text-[#777181] hover:bg-[#F8F5FC] hover:text-[#292333]'
              }`}
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-white border border-[#EAE5F1] rounded-2xl shadow-xl p-3 z-30 grid grid-cols-6 gap-2 w-52">
                {['😊', '❤️', '💜', '🎓', '✨', '🔥', '🎉', '🚀', '☕', '🎂', '👍', '🙏'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-lg hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mention Candidates Autocomplete Popup */}
          {isTypingMention && mentionCandidates.length > 0 && (
            <div className="absolute bottom-16 left-12 md:left-24 bg-white border border-[#EAE5F1] rounded-2xl shadow-xl p-2 z-30 w-64 max-h-48 overflow-y-auto space-y-1">
              <span className="text-[10px] font-bold text-[#8064B5] px-2 py-0.5 block uppercase tracking-wider">
                Mention in {currentConv.name}
              </span>
              {mentionCandidates.map((m) => (
                <button
                  key={m.handle}
                  onClick={() => handleSelectMention(m.handle)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F5FC] text-left text-xs transition-colors"
                >
                  <span className="font-semibold text-[#292333]">{m.name}</span>
                  <span className="text-[10px] text-[#8064B5] font-mono">@{m.handle}</span>
                </button>
              ))}
            </div>
          )}

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message (type @ to mention)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-[#F8F5FC] border border-[#EAE5F1] rounded-xl px-4 py-2.5 text-xs text-[#292333] placeholder-[#777181] focus:outline-hidden focus:border-[#B99AEF] focus:bg-white transition-all"
          />

          {/* Mic Button (Voice Note) */}
          <button
            onClick={() => setIsRecordingAudio(!isRecordingAudio)}
            className="p-2 rounded-xl text-[#777181] hover:bg-[#F8F5FC] hover:text-[#8064B5] transition-colors"
            title="Record voice note"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all shadow-xs ${
              inputText.trim()
                ? 'bg-[#E9DDFB] text-[#8064B5] hover:bg-[#D9C7F7] hover:scale-105 active:scale-95'
                : 'bg-[#F8F5FC] text-[#777181] cursor-not-allowed opacity-60'
            }`}
            title="Send message"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </div>
      </footer>

      {/* 8. Conversation Info Sidebar Drawer */}
      {showConversationInfo && (
        <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-[#EAE5F1] z-30 shadow-xl flex flex-col select-none">
          <div className="p-4 border-b border-[#EAE5F1] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#292333]">Chat Details</h3>
            <button
              onClick={() => setShowConversationInfo(false)}
              className="text-[#777181] hover:text-[#292333]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Header profile info */}
            <div className="flex flex-col items-center text-center">
              <img
                src={currentConv.avatarUrl}
                alt={currentConv.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#E9DDFB] mb-3"
              />
              <h4 className="text-base font-bold text-[#292333]">{currentConv.name}</h4>
              <p className="text-xs text-[#777181] mt-0.5">
                {currentConv.type === 'direct' ? contact?.phoneNumber : `${currentConv.participants.length} Participants`}
              </p>
              {currentConv.description && (
                <p className="text-xs text-[#292333] mt-2 px-3 py-2 bg-[#F8F5FC] rounded-xl border border-[#EAE5F1]">
                  {currentConv.description}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => togglePinConversation(currentConv.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8F5FC] hover:bg-[#E9DDFB]/50 text-xs font-semibold text-[#292333] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-[#8064B5]" />
                  <span>{currentConv.isPinned ? 'Unpin this Chat' : 'Pin to Top'}</span>
                </div>
              </button>

              <button
                onClick={() => toggleMuteConversation(currentConv.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8F5FC] hover:bg-[#E9DDFB]/50 text-xs font-semibold text-[#292333] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {currentConv.isMuted ? <Volume2 className="w-4 h-4 text-[#8064B5]" /> : <VolumeX className="w-4 h-4 text-[#777181]" />}
                  <span>{currentConv.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                </div>
              </button>

              <button
                onClick={() => toggleFavoriteConversation(currentConv.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8F5FC] hover:bg-[#E9DDFB]/50 text-xs font-semibold text-[#292333] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>{currentConv.isFavorite ? 'Remove from Favourites' : 'Add to Favourites'}</span>
                </div>
              </button>
            </div>

            {/* Group members list if group */}
            {currentConv.type === 'group' && (
              <div>
                <h5 className="text-xs font-bold text-[#777181] uppercase tracking-wider mb-2">
                  Participants ({currentConv.participants.length})
                </h5>
                <div className="space-y-2">
                  {currentConv.participants.map((pId) => {
                    const isMe = pId === 'usr_me';
                    const memberContact = contacts.find((c) => c.id === pId);
                    const name = isMe ? `${user?.displayName} (You)` : memberContact?.displayName || 'Member';
                    const avatar = isMe ? user?.avatarUrl : memberContact?.avatarUrl;
                    const isAdmin = currentConv.adminIds?.includes(pId);

                    return (
                      <div key={pId} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F5FC]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatar}
                            alt={name}
                            className="w-8 h-8 rounded-full object-cover border border-[#EAE5F1]"
                          />
                          <div>
                            <p className="text-xs font-semibold text-[#292333]">{name}</p>
                            <span className="text-[10px] text-[#777181]">
                              {isMe ? user?.phoneNumber : memberContact?.phoneNumber || 'WhatChat User'}
                            </span>
                          </div>
                        </div>
                        {isAdmin && (
                          <span className="text-[10px] font-bold text-[#8064B5] bg-[#E9DDFB] px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none"
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
