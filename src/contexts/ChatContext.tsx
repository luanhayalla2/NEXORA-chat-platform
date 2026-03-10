import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Conversation, Message, ConversationWithUser, User } from '@/types';

// Mock data
const MOCK_USERS: User[] = [
  { id: '2', username: 'maria_ui', displayName: 'Maria Santos', email: 'maria@email.com', lastSeen: new Date(), isOnline: true, createdAt: new Date(), bio: 'UI/UX Designer' },
  { id: '3', username: 'carlos_pm', displayName: 'Carlos Oliveira', email: 'carlos@email.com', lastSeen: new Date(Date.now() - 300000), isOnline: false, createdAt: new Date(), bio: 'Product Manager' },
  { id: '4', username: 'ana_dev', displayName: 'Ana Costa', email: 'ana@email.com', lastSeen: new Date(Date.now() - 3600000), isOnline: false, createdAt: new Date(), bio: 'Backend Developer' },
  { id: '5', username: 'pedro_ops', displayName: 'Pedro Lima', email: 'pedro@email.com', lastSeen: new Date(), isOnline: true, createdAt: new Date(), bio: 'DevOps Engineer' },
  { id: '6', username: 'julia_design', displayName: 'Julia Ferreira', email: 'julia@email.com', lastSeen: new Date(Date.now() - 7200000), isOnline: false, createdAt: new Date(), bio: 'Graphic Designer' },
];

const MOCK_CONVERSATIONS: ConversationWithUser[] = [
  {
    id: 'c1', type: 'private', participants: ['1', '2'], unreadCount: 3, isPinned: true, isMuted: false,
    createdAt: new Date(), updatedAt: new Date(),
    otherUser: MOCK_USERS[0],
    lastMessage: { id: 'm1', conversationId: 'c1', senderId: '2', content: 'O design ficou incrível! Vou te enviar os assets agora 🎨', type: 'text', status: 'delivered', createdAt: new Date(Date.now() - 60000) },
  },
  {
    id: 'c2', type: 'group', name: 'Equipe Produto', participants: ['1', '2', '3', '4'], unreadCount: 12, isPinned: true, isMuted: false,
    createdAt: new Date(), updatedAt: new Date(),
    lastMessage: { id: 'm2', conversationId: 'c2', senderId: '3', content: 'Sprint review amanhã às 10h. Todos confirmados?', type: 'text', status: 'read', createdAt: new Date(Date.now() - 180000) },
  },
  {
    id: 'c3', type: 'private', participants: ['1', '3'], unreadCount: 0, isPinned: false, isMuted: false,
    createdAt: new Date(), updatedAt: new Date(),
    otherUser: MOCK_USERS[1],
    lastMessage: { id: 'm3', conversationId: 'c3', senderId: '1', content: 'Vamos alinhar o roadmap na segunda', type: 'text', status: 'read', createdAt: new Date(Date.now() - 3600000) },
  },
  {
    id: 'c4', type: 'private', participants: ['1', '4'], unreadCount: 1, isPinned: false, isMuted: false,
    createdAt: new Date(), updatedAt: new Date(),
    otherUser: MOCK_USERS[2],
    lastMessage: { id: 'm4', conversationId: 'c4', senderId: '4', content: 'PR aprovado! Pode fazer merge ✅', type: 'text', status: 'delivered', createdAt: new Date(Date.now() - 7200000) },
  },
  {
    id: 'c5', type: 'channel', name: 'Anúncios Tech', participants: ['1', '2', '3', '4', '5'], unreadCount: 0, isPinned: false, isMuted: true,
    createdAt: new Date(), updatedAt: new Date(),
    lastMessage: { id: 'm5', conversationId: 'c5', senderId: '5', content: 'Deploy v2.3.1 concluído com sucesso 🚀', type: 'text', status: 'read', createdAt: new Date(Date.now() - 86400000) },
  },
  {
    id: 'c6', type: 'private', participants: ['1', '6'], unreadCount: 0, isPinned: false, isMuted: false,
    createdAt: new Date(), updatedAt: new Date(),
    otherUser: MOCK_USERS[4],
    lastMessage: { id: 'm6', conversationId: 'c6', senderId: '6', content: 'Enviei as ilustrações por email', type: 'text', status: 'read', createdAt: new Date(Date.now() - 172800000) },
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'm1-1', conversationId: 'c1', senderId: '1', content: 'E aí Maria, como ficou o redesign?', type: 'text', status: 'read', createdAt: new Date(Date.now() - 300000) },
    { id: 'm1-2', conversationId: 'c1', senderId: '2', content: 'Ficou demais! Refiz toda a paleta de cores', type: 'text', status: 'read', createdAt: new Date(Date.now() - 240000) },
    { id: 'm1-3', conversationId: 'c1', senderId: '2', content: 'Usei aquela referência que você mandou do Dribbble', type: 'text', status: 'read', createdAt: new Date(Date.now() - 200000) },
    { id: 'm1-4', conversationId: 'c1', senderId: '1', content: 'Ótimo! Manda o link do Figma pra eu dar uma olhada', type: 'text', status: 'read', createdAt: new Date(Date.now() - 150000) },
    { id: 'm1-5', conversationId: 'c1', senderId: '2', content: 'O design ficou incrível! Vou te enviar os assets agora 🎨', type: 'text', status: 'delivered', createdAt: new Date(Date.now() - 60000) },
  ],
  c2: [
    { id: 'm2-1', conversationId: 'c2', senderId: '3', content: 'Pessoal, precisamos alinhar as prioridades do Q2', type: 'text', status: 'read', createdAt: new Date(Date.now() - 600000) },
    { id: 'm2-2', conversationId: 'c2', senderId: '1', content: 'Concordo. A feature de mensagens em grupo é prioridade', type: 'text', status: 'read', createdAt: new Date(Date.now() - 500000) },
    { id: 'm2-3', conversationId: 'c2', senderId: '2', content: 'Já estou trabalhando no design system atualizado', type: 'text', status: 'read', createdAt: new Date(Date.now() - 400000) },
    { id: 'm2-4', conversationId: 'c2', senderId: '4', content: 'A API de real-time está pronta para testes', type: 'text', status: 'read', createdAt: new Date(Date.now() - 300000) },
    { id: 'm2-5', conversationId: 'c2', senderId: '3', content: 'Sprint review amanhã às 10h. Todos confirmados?', type: 'text', status: 'read', createdAt: new Date(Date.now() - 180000) },
  ],
};

interface ChatContextType {
  conversations: ConversationWithUser[];
  activeConversation: ConversationWithUser | null;
  messages: Message[];
  setActiveConversation: (id: string | null) => void;
  sendMessage: (content: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations] = useState<ConversationWithUser[]>(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');

  const activeConversation = conversations.find(c => c.id === activeId) || null;
  const messages = activeId ? (allMessages[activeId] || []) : [];

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!activeId || !content.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeId,
      senderId: '1',
      content: content.trim(),
      type: 'text',
      status: 'sent',
      createdAt: new Date(),
    };
    setAllMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));
  }, [activeId]);

  return (
    <ChatContext.Provider value={{ conversations, activeConversation, messages, setActiveConversation, sendMessage, searchQuery, setSearchQuery }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
