import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Check,
  CheckCheck,
  Sparkles,
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon,
  Trash2,
  Reply,
  Lock,
  PhoneCall,
  VideoOff,
  Mic,
  MicOff,
  User,
} from 'lucide-react';
import { useWhatChat } from '../../context/WhatChatContext';
import { Attachment, ReplyPreview } from '../../types/whatchat';

export function ChatView() {
  const {
    activeConversationId,
    setActiveConversationId,
    conversations,
    messages,
    sendMessage,
    deleteMessage,
    saveMessageToMySpace,
    contacts,
    user: currentUser,
    events,
    setActiveTab,
  } = useWhatChat();

  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyPreview | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCallingModal, setShowCallingModal] = useState<{ type: 'audio' | 'video'; active: boolean } | null>(null);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [saveToSpaceModalMsg, setSaveToSpaceModalMsg] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Determine chat name, avatar, and other user info
  const otherParticipantId = activeConv?.participants?.find((id) => id !== currentUser?.id);
  const matchedContact = contacts.find(
    (c) => c.contactUserId === otherParticipantId || c.id === otherParticipantId
  );

  const chatDisplayName =
    activeConv?.type === 'group'
      ? activeConv.name || 'Group Chat'
      : matchedContact?.displayName || activeConv?.name || 'Direct Chat';

  const chatAvatar =
    activeConv?.avatarUrl ||
    matchedContact?.avatarUrl ||
    '';

  const isOtherOnline = activeConv?.type === 'direct' && (matchedContact?.isOnline ?? true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeConversationId]);

  // Handle Send Message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversationId) return;
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    const text = inputText.trim();
    const atts = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;
    const reply = replyingTo || undefined;

    setInputText('');
    setPendingAttachments([]);
    setReplyingTo(null);

    try {
      await sendMessage(activeConversationId, text, atts, reply);
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  // Handle Attachment Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newAtt: Attachment = {
        id: `att_${Date.now()}`,
        type: isImage ? 'image' : 'document',
        url,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        mimeType: file.type,
      };
      setPendingAttachments((prev) => [...prev, newAtt]);
      setShowAttachMenu(false);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Filter messages if search inside chat is active
  const displayedMessages = searchInChatQuery.trim()
    ? currentMessages.filter((m) =>
        m.text?.toLowerCase().includes(searchInChatQuery.toLowerCase())
      )
    : currentMessages;

  // Placeholder when no conversation is selected (WhatsApp Web Welcome screen)
  if (!activeConversationId || !activeConv) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center aesthetic-chat-bg p-8 text-center select-none border-l border-[#ede7f6]">
        <div className="max-w-md flex flex-col items-center">
          <div className="w-20 h-20 rounded-[24px] bg-[#ece2f9] text-[#8064b5] flex items-center justify-center mb-6 shadow-xs border border-[#ddcdfa]">
            <MessageSquare size={38} />
          </div>
          <h2 className="text-2xl font-bold text-[#111b21] tracking-tight">WhatChat for Web</h2>
          <p className="mt-3 text-sm text-[#777181] leading-relaxed">
            Send and receive messages with friends, groups, and colleagues in real-time. Pick an existing chat from the left sidebar or start a new one from Contacts.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('contacts')}
              className="btn-aesthetic-primary px-5 py-2.5 text-xs font-semibold"
            >
              Open Contacts
            </button>
          </div>

          <div className="mt-12 flex items-center gap-2 text-xs text-[#8a8494] font-medium">
            <Lock className="w-3.5 h-3.5 text-[#8064b5]" />
            <span>End-to-end encrypted personal messages</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full aesthetic-chat-bg overflow-hidden relative select-none">
      {/* 1. WhatChat Aesthetic Chat Header (Purple) */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#ede7f6] px-4 flex items-center justify-between z-10 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={() => setActiveConversationId(null)}
            className="md:hidden p-1.5 -ml-1 text-[#777181] hover:text-[#111b21] rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Conversation Avatar (Aesthetic Purple Squircle Badge) */}
          <div className="relative shrink-0">
            {chatAvatar ? (
              <img
                src={chatAvatar}
                alt={chatDisplayName}
                className="w-11 h-11 rounded-[16px] object-cover border border-[#ede7f6] shadow-2xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-[16px] bg-[#ece2f9] text-[#7050a6] font-bold flex items-center justify-center text-sm shadow-2xs border border-[#ddcdfa]">
                {chatDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            {activeConv.type === 'direct' && isOtherOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#8064b5] rounded-full border-2 border-white shadow-2xs" />
            )}
          </div>

          {/* Conversation Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[#111b21] truncate">{chatDisplayName}</h3>
              <div className="w-4 h-4 rounded-full bg-[#8064b5] flex items-center justify-center text-white shrink-0" title="Verified">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7050a6] font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8064b5] shrink-0" />
              <span>
                {activeConv.type === 'group'
                  ? `${activeConv.participants?.length || 2} members`
                  : isOtherOnline
                  ? 'Online'
                  : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Aesthetic Purple Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search in chat toggle */}
          <button
            onClick={() => setIsSearchingInChat(!isSearchingInChat)}
            className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all active:scale-95 ${
              isSearchingInChat
                ? 'bg-[#8064b5] text-white shadow-xs'
                : 'bg-[#f8f5fc] hover:bg-[#ede5fa] text-[#7050a6]'
            }`}
            title="Search in chat"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => setShowCallingModal({ type: 'video', active: true })}
            className="w-10 h-10 rounded-[14px] bg-[#f1ebfa] hover:bg-[#e6daf7] text-[#7050a6] flex items-center justify-center transition-all active:scale-95"
            title="Start video call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Audio Call Button (Aesthetic Purple Squircle) */}
          <button
            onClick={() => setShowCallingModal({ type: 'audio', active: true })}
            className="btn-squircle-call"
            title="Start voice call"
          >
            <Phone className="w-4.5 h-4.5 fill-current" />
          </button>
        </div>
      </header>

      {/* 2. In-Chat Search Bar (collapsible) */}
      {isSearchingInChat && (
        <div className="bg-white border-b border-[#eae5f1] px-4 py-2 flex items-center gap-2 z-10 animate-in slide-in-from-top-2">
          <Search className="w-4 h-4 text-[#8a8494]" />
          <input
            type="text"
            placeholder="Search messages in this conversation..."
            value={searchInChatQuery}
            onChange={(e) => setSearchInChatQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#111b21] focus:outline-hidden"
            autoFocus
          />
          {searchInChatQuery && (
            <button onClick={() => setSearchInChatQuery('')} className="text-[#8a8494]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 3. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {/* End-to-end security chip */}
        <div className="flex justify-center my-2">
          <div className="bg-white/90 backdrop-blur-xs text-[#7050a6] text-[11px] font-medium px-4 py-1.5 rounded-full shadow-2xs flex items-center gap-1.5 border border-[#ede7f6]">
            <Lock className="w-3 h-3 text-[#8064b5]" />
            <span>Messages are end-to-end encrypted. No one outside can read them.</span>
          </div>
        </div>

        {/* Aesthetic "TODAY" Chip */}
        <div className="flex justify-center my-2">
          <span className="text-[10px] font-bold text-[#8064b5] tracking-widest uppercase bg-white/90 backdrop-blur-xs px-3.5 py-1 rounded-full border border-[#ede7f6] shadow-2xs">
            TODAY
          </span>
        </div>

        {displayedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#777181]">
            <div className="w-14 h-14 rounded-[18px] bg-[#ece2f9] text-[#7050a6] grid place-items-center mb-2 shadow-2xs border border-[#ddcdfa]">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-[#111b21]">No messages yet</p>
            <p className="text-[11px] text-[#777181] mt-0.5">Send a message below to start chatting!</p>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id || msg.senderName === 'You';

            return (
              <div
                key={msg.id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-[85%] md:max-w-[70%] px-4 py-2.5 text-xs break-words shadow-2xs transition-all ${
                    isMe
                      ? 'bg-[#8064b5] text-white rounded-[22px] rounded-tr-[6px]'
                      : 'bg-white text-[#111b21] rounded-[22px] rounded-tl-[6px] border border-[#ede7f6] shadow-[0_2px_12px_rgba(128,100,181,0.04)]'
                  }`}
                >
                  {/* Sender name in group chats */}
                  {activeConv.type === 'group' && !isMe && (
                    <p className="text-[11px] font-bold text-[#8064b5] mb-1">
                      {msg.senderName}
                    </p>
                  )}

                  {/* Quoted reply banner */}
                  {msg.replyTo && (
                    <div
                      className={`mb-2 p-2 rounded-xl text-[11px] border-l-3 ${
                        isMe
                          ? 'bg-white/15 text-white/95 border-white'
                          : 'bg-[#f8f5fc] text-[#7050a6] border-[#8064b5]'
                      }`}
                    >
                      <p className="font-bold">{msg.replyTo.senderName}</p>
                      <p className="truncate line-clamp-1">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {msg.attachments.map((att) => (
                        <div key={att.id}>
                          {att.type === 'image' ? (
                            <img
                              src={att.url}
                              alt={att.fileName}
                              className="rounded-2xl max-h-64 w-auto object-cover cursor-pointer hover:opacity-95 shadow-2xs"
                              onClick={() => window.open(att.url, '_blank')}
                            />
                          ) : (
                            <div
                              className={`flex items-center gap-2 p-2.5 rounded-xl ${
                                isMe ? 'bg-white/20 text-white' : 'bg-[#f8f5fc] border border-[#ede7f6]'
                              }`}
                            >
                              <FileText className="w-4 h-4 shrink-0 text-[#8064b5]" />
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{att.fileName}</p>
                                <p className="text-[10px] opacity-75">{att.fileSize}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="whitespace-pre-wrap leading-relaxed text-[13px]">{msg.text}</p>

                  {/* Timestamp & Status */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-purple-200' : 'text-[#8a8494]'
                    }`}
                  >
                    <span>{msg.timestamp || 'Just now'}</span>
                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-purple-100" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-purple-200" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-purple-200" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Quick Action Toolbar on Hover */}
                  <div
                    className={`absolute -top-3 ${
                      isMe ? 'right-2' : 'left-2'
                    } hidden group-hover:flex items-center gap-0.5 bg-white/95 backdrop-blur-md border border-[#ede7f6] rounded-full px-2 py-0.5 shadow-md text-[#7050a6] z-20`}
                  >
                    <button
                      onClick={() =>
                        setReplyingTo({
                          id: msg.id,
                          text: msg.text,
                          senderName: msg.senderName,
                        })
                      }
                      className="p-1 hover:text-[#8064b5] hover:bg-[#f1ebfa] rounded-full transition-colors"
                      title="Reply"
                    >
                      <Reply className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSaveToSpaceModalMsg(msg)}
                      className="p-1 hover:text-[#8064b5] hover:bg-[#f1ebfa] rounded-full transition-colors"
                      title="Save to My Space"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteMessage(activeConversationId, msg.id, isMe)}
                      className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Aesthetic Chat Input Bar (Floating Modern Dock in Purple) */}
      <footer className="p-3 md:p-4 z-10 shrink-0 bg-transparent">
        {/* Quoted Reply Preview */}
        {replyingTo && (
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-white/95 backdrop-blur-md border border-[#ede7f6] border-l-4 border-l-[#8064b5] p-2.5 rounded-2xl mb-2 text-xs shadow-xs">
            <div className="min-w-0">
              <span className="font-bold text-[#8064b5] block">Replying to {replyingTo.senderName}</span>
              <span className="text-[#6b7280] truncate block">{replyingTo.text}</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-[#9ca3af] hover:text-[#111827] p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Pending Attachment Preview */}
        {pendingAttachments.length > 0 && (
          <div className="max-w-4xl mx-auto flex items-center gap-2 mb-2 p-2.5 bg-white/95 backdrop-blur-md border border-[#ede7f6] rounded-2xl shadow-xs overflow-x-auto">
            {pendingAttachments.map((att, idx) => (
              <div key={idx} className="relative group shrink-0">
                {att.type === 'image' ? (
                  <img src={att.url} alt={att.fileName} className="w-14 h-14 rounded-2xl object-cover shadow-2xs" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#f8f5fc] border border-[#ede7f6] flex flex-col items-center justify-center p-1">
                    <FileText className="w-5 h-5 text-[#8064b5]" />
                    <span className="text-[9px] text-[#6b7280] truncate w-full text-center mt-1">
                      {att.fileName}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Floating Input Dock (Purple Aesthetic) */}
        <form onSubmit={handleSend} className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-[#ede7f6] rounded-[28px] p-2 md:p-2.5 shadow-[0_6px_25px_rgba(128,100,181,0.07)] flex items-center gap-2">
          {/* Aesthetic Lavender Squircle Attachment Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="btn-squircle-attach"
              title="Attach photo or document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-14 left-0 bg-white border border-[#ede7f6] rounded-2xl shadow-xl p-2 flex flex-col gap-1 w-48 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#111b21] hover:bg-[#f8f5fc] rounded-xl transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-[#8064b5]" />
                  <span>Photos & Videos</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#111b21] hover:bg-[#f8f5fc] rounded-xl transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#8064b5]" />
                  <span>Document</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* Aesthetic Rounded Pill Input */}
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white border border-[#ede7f6] rounded-[22px] px-4 py-2.5 text-xs md:text-sm text-[#111b21] placeholder-[#9ca3af] focus:outline-hidden focus:border-[#8064b5] focus:ring-2 focus:ring-[#8064b5]/20 transition-all"
          />

          {/* Aesthetic Purple Squircle Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && pendingAttachments.length === 0}
            className="btn-squircle-send shrink-0"
            title="Send"
          >
            <Send className="w-4.5 h-4.5 -rotate-12 translate-x-0.5" />
          </button>
        </form>
      </footer>

      {/* Save to My Space Modal */}
      {saveToSpaceModalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#eae5f1] shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#8064b5]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-[#111b21]">Save to My Space</h3>
              </div>
              <button
                onClick={() => setSaveToSpaceModalMsg(null)}
                className="text-[#8a8494] hover:text-[#111b21]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#777181]">
              Choose which personal memory capsule to save this message into:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => {
                    saveMessageToMySpace(saveToSpaceModalMsg, evt.id);
                    setSaveToSpaceModalMsg(null);
                    window.alert(`Saved to capsule: ${evt.name}!`);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-[#eae5f1] hover:border-[#8064b5] hover:bg-[#f8f5fc] transition-all text-xs font-semibold text-[#111b21] flex items-center justify-between"
                >
                  <span>{evt.name}</span>
                  <span className="text-[10px] text-[#8064b5] font-normal">{evt.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Voice / Video Calling Dialog */}
      {showCallingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1f2937] text-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl text-center">
            <div className="relative mb-6">
              {chatAvatar ? (
                <img
                  src={chatAvatar}
                  alt={chatDisplayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#8064b5]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#8064b5] text-white text-3xl font-bold flex items-center justify-center">
                  {chatDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#1f2937] flex items-center justify-center">
                {showCallingModal.type === 'video' ? <Video className="w-3 h-3 text-white" /> : <Phone className="w-3 h-3 text-white" />}
              </span>
            </div>

            <h3 className="text-xl font-bold">{chatDisplayName}</h3>
            <p className="text-xs text-emerald-400 mt-1 animate-pulse">Ringing...</p>

            <div className="flex items-center gap-6 mt-10">
              <button
                onClick={() => setShowCallingModal(null)}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                title="End call"
              >
                <PhoneCall className="w-6 h-6 rotate-135" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
