import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { Conversation, Message, ConversationWithUser, User } from '@/types';

interface ChatContextType {
  conversations: ConversationWithUser[];
  activeConversation: ConversationWithUser | null;
  messages: Message[];
  setActiveConversation: (id: string | null) => void;
  sendMessage: (content: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoading: boolean;
  createConversation: (otherUserId: string) => Promise<string | null>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function mapProfile(p: any): User {
  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    email: '',
    avatarUrl: p.avatar_url || '',
    bio: p.bio || '',
    phone: p.phone || '',
    lastSeen: new Date(p.last_seen || Date.now()),
    isOnline: p.is_online || false,
    createdAt: new Date(p.created_at || Date.now()),
  };
}

function mapMessage(m: any): Message {
  return {
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    content: m.content,
    type: m.type as Message['type'],
    status: m.status as Message['status'],
    replyToId: m.reply_to_id || undefined,
    createdAt: new Date(m.created_at),
    editedAt: m.edited_at ? new Date(m.edited_at) : undefined,
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = user?.id;

  // Load conversations
  useEffect(() => {
    if (!currentUserId) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    const loadConversations = async () => {
      setIsLoading(true);

      // Get user's conversation participations
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, is_muted, is_pinned, unread_count')
        .eq('user_id', currentUserId);

      if (partError || !participations?.length) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      const convIds = participations.map(p => p.conversation_id);

      // Get conversations
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convIds)
        .order('updated_at', { ascending: false });

      if (!convs?.length) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Get all participants for these conversations to find other users
      const { data: allParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', convIds);

      // Get unique other user IDs
      const otherUserIds = [...new Set(
        (allParts || [])
          .filter(p => p.user_id !== currentUserId)
          .map(p => p.user_id)
      )];

      // Get profiles
      let profilesMap: Record<string, User> = {};
      if (otherUserIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', otherUserIds);
        (profiles || []).forEach(p => {
          profilesMap[p.id] = mapProfile(p);
        });
      }

      // Get last message for each conversation
      const lastMessagesMap: Record<string, Message> = {};
      for (const convId of convIds) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (msgs?.length) {
          lastMessagesMap[convId] = mapMessage(msgs[0]);
        }
      }

      const partMap = Object.fromEntries(participations.map(p => [p.conversation_id, p]));

      const mapped: ConversationWithUser[] = convs.map(c => {
        const part = partMap[c.id];
        const otherParts = (allParts || []).filter(p => p.conversation_id === c.id && p.user_id !== currentUserId);
        const otherUser = otherParts.length === 1 ? profilesMap[otherParts[0].user_id] : undefined;

        return {
          id: c.id,
          type: c.type as Conversation['type'],
          name: c.name || undefined,
          avatarUrl: c.avatar_url || undefined,
          participants: (allParts || []).filter(p => p.conversation_id === c.id).map(p => p.user_id),
          lastMessage: lastMessagesMap[c.id],
          unreadCount: part?.unread_count || 0,
          isPinned: part?.is_pinned || false,
          isMuted: part?.is_muted || false,
          createdAt: new Date(c.created_at || Date.now()),
          updatedAt: new Date(c.updated_at || Date.now()),
          otherUser,
        };
      });

      // Sort: pinned first, then by last message time
      mapped.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const aTime = a.lastMessage?.createdAt?.getTime() || a.updatedAt.getTime();
        const bTime = b.lastMessage?.createdAt?.getTime() || b.updatedAt.getTime();
        return bTime - aTime;
      });

      setConversations(mapped);
      setIsLoading(false);
    };

    loadConversations();
  }, [currentUserId]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeId || !currentUserId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeId)
        .order('created_at', { ascending: true });

      setMessages((data || []).map(mapMessage));
    };

    loadMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const newMsg = mapMessage(payload.new);
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Update last message in conversations list
          setConversations(prev =>
            prev.map(c =>
              c.id === activeId ? { ...c, lastMessage: newMsg, updatedAt: newMsg.createdAt } : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, currentUserId]);

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeId || !content.trim() || !currentUserId) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeId,
        sender_id: currentUserId,
        content: content.trim(),
        type: 'text',
        status: 'sent',
      });

    if (!error) {
      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeId);
    }
  }, [activeId, currentUserId]);

  const createConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    // Create conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'private' })
      .select()
      .single();

    if (convError || !conv) return null;

    // Add participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conv.id, user_id: currentUserId },
        { conversation_id: conv.id, user_id: otherUserId },
      ]);

    if (partError) return null;

    // Reload conversations
    setActiveId(conv.id);
    return conv.id;
  }, [currentUserId]);

  return (
    <ChatContext.Provider value={{
      conversations, activeConversation, messages,
      setActiveConversation, sendMessage, searchQuery, setSearchQuery,
      isLoading, createConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
