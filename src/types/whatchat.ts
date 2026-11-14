export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface UserPrivacySettings {
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  profilePhotoVisibility: 'everyone' | 'contacts' | 'nobody';
  phoneDiscovery: boolean;
}

export interface User {
  id: string;
  email?: string;
  phoneNumber: string;
  countryCode: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  about: string;
  createdAt: string;
  lastSeen?: string;
  isOnline: boolean;
  privacySettings: UserPrivacySettings;
  storageUsedBytes: number; // e.g. 1.4 GB
  storageTotalBytes: number; // e.g. 15 GB
}

export interface Contact {
  id: string;
  phoneNumber: string;
  displayName: string;
  username?: string;
  avatarUrl: string;
  about: string;
  isOnline: boolean;
  lastSeen?: string;
  isFavorite?: boolean;
}

export type AttachmentType = 'image' | 'video' | 'document' | 'audio';

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  fileName: string;
  fileSize: string; // e.g. "3.4 MB"
  mimeType?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs
}

export interface ReplyPreview {
  id: string;
  text: string;
  senderName: string;
  attachmentType?: AttachmentType;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  attachments?: Attachment[];
  replyTo?: ReplyPreview;
  timestamp: string;
  status: MessageStatus;
  isPinned?: boolean;
  isStarred?: boolean;
  isEdited?: boolean;
  isDeletedForEveryone?: boolean;
  savedToEventId?: string;
  savedToEventName?: string;
  reactions?: MessageReaction[];
}

export type GroupCategoryType = 'College' | 'Project' | 'Family' | 'Business' | 'Community' | 'Other';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatarUrl: string;
  description?: string;
  participants: string[]; // contact IDs or user ID
  adminIds?: string[];
  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
    status?: MessageStatus;
    attachmentType?: AttachmentType;
  };
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  groupCategory?: GroupCategoryType;
  updatedAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  iconName: string;
  isCustom?: boolean;
  description?: string;
}

export interface MySpaceEvent {
  id: string;
  userId: string;
  name: string;
  category: string; // e.g. "Personal", "College", "Business", "Work", "Important"
  eventDate?: string;
  description?: string;
  coverImageUrl: string;
  createdAt: string;
  isFavorite: boolean;
  isLocked?: boolean;
  memoryCount: number;
  mediaCounts: {
    photos: number;
    videos: number;
    documents: number;
    audio: number;
    notes: number;
  };
}

export type EventMessageType = 'note' | 'photo' | 'document' | 'audio' | 'reflection' | 'forwarded_chat';

export interface EventMessage {
  id: string;
  eventId: string;
  type: EventMessageType;
  content: string;
  attachments?: Attachment[];
  memoryDate: string; // the date of the memory
  createdAt: string; // timestamp created
  isHighlight: boolean;
  tags?: string[];
  sourceChatName?: string;
}

export interface CustomFilter {
  id: string;
  name: string;
  criteria: 'unread' | 'groups' | 'direct' | 'college' | 'pinned' | 'favorites';
}
