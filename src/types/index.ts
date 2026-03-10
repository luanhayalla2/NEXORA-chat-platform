// ============================================
// Core Domain Types - NEXORA
// ============================================

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  lastSeen: Date;
  isOnline: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  replyToId?: string;
  attachments?: Attachment[];
  createdAt: Date;
  editedAt?: Date;
}

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'file' | 'voice' | 'video';
  name: string;
  size: number;
  mimeType: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatarUrl?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationType = 'private' | 'group' | 'channel';

export interface ConversationWithUser extends Conversation {
  otherUser?: User;
}

// ============================================
// Auth Types
// ============================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  username: string;
  displayName: string;
}

// ============================================
// UI Types
// ============================================

export interface ChatViewState {
  activeConversationId: string | null;
  isSidebarOpen: boolean;
  isProfileOpen: boolean;
  searchQuery: string;
}
