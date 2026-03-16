import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Conversation, Message, ConversationWithUser, User } from '@/types';

interface ChatContextType {
  conversations: ConversationWithUser[];
  activeConversation: ConversationWithUser | null;
  messages: Message[];
  setActiveConversation: (id: string | null) => void;
  sendMessage: (content: string) => void;
  createPrivateConversation: (otherUserId: string) => Promise<string | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoading: boolean;
  refreshConversations: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function mapMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    type: row.type as Message['type'],
    status: row.status as Message['status'],
    replyToId: row.reply_to_id || undefined,
    createdAt: new Date(row.created_at),
    editedAt: row.edited_at ? new Date(row.edited_at) : undefined,
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

  // Fetch conversations
  useEffect(() => {
    if (!currentUserId) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    async function loadConversations() {
      setIsLoading(true);

      // Get user's participations
      const { data: participations, error: pError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, is_muted, is_pinned, unread_count')
        .eq('user_id', currentUserId!);

      if (pError || !participations?.length) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      const convIds = participations.map(p => p.conversation_id);

      // Get conversations
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convIds);

      if (!convs?.length) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Get all participants for these conversations to find other users
      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', convIds);

      // Get other user IDs for private chats
      const otherUserIds = new Set<string>();
      allParticipants?.forEach(p => {
        if (p.user_id !== currentUserId) otherUserIds.add(p.user_id);
      });

      // Fetch profiles of other users
      let profilesMap: Record<string, User> = {};
      if (otherUserIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', Array.from(otherUserIds));

        profiles?.forEach(p => {
          profilesMap[p.id] = {
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
        });
      }

      // Get last message for each conversation
      const lastMessages: Record<string, Message> = {};
      for (const convId of convIds) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (msgs?.[0]) {
          lastMessages[convId] = mapMessage(msgs[0]);
        }
      }

      // Build ConversationWithUser objects
      const participationMap: Record<string, typeof participations[0]> = {};
      participations.forEach(p => { participationMap[p.conversation_id] = p; });

      const result: ConversationWithUser[] = convs.map(conv => {
        const participation = participationMap[conv.id];
        const convParticipants = allParticipants?.filter(p => p.conversation_id === conv.id).map(p => p.user_id) || [];
        
        // Find other user for private chats
        let otherUser: User | undefined;
        if (conv.type === 'private') {
          const otherUserId = convParticipants.find(id => id !== currentUserId);
          if (otherUserId) otherUser = profilesMap[otherUserId];
        }

        return {
          id: conv.id,
          type: conv.type as Conversation['type'],
          name: conv.name || undefined,
          avatarUrl: conv.avatar_url || undefined,
          participants: convParticipants,
          lastMessage: lastMessages[conv.id],
          unreadCount: participation?.unread_count || 0,
          isPinned: participation?.is_pinned || false,
          isMuted: participation?.is_muted || false,
          createdAt: new Date(conv.created_at || Date.now()),
          updatedAt: new Date(conv.updated_at || Date.now()),
          otherUser,
        };
      });

      // Sort: pinned first, then by last message time
      result.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const aTime = a.lastMessage?.createdAt.getTime() || a.updatedAt.getTime();
        const bTime = b.lastMessage?.createdAt.getTime() || b.updatedAt.getTime();
        return bTime - aTime;
      });

      setConversations(result);
      setIsLoading(false);
    }

    loadConversations();
  }, [currentUserId]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeId || !currentUserId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeId!)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map(mapMessage));
      }
    }

    loadMessages();

    // Subscribe to new messages in real-time
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
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Update last message in conversations list
          setConversations(prev => prev.map(c => 
            c.id === activeId ? { ...c, lastMessage: newMsg } : c
          ));
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

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeId,
      sender_id: currentUserId,
      content: content.trim(),
      type: 'text',
      status: 'sent',
    });

    if (error) {
      console.error('Failed to send message:', error);
    }
  }, [activeId, currentUserId]);

  const refreshConversations = useCallback(() => {
    if (currentUserId) {
      // Trigger re-fetch by toggling a dummy state
      setIsLoading(true);
      loadConversationsRef.current?.();
    }
  }, [currentUserId]);

  const createPrivateConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    // Check if a private conversation already exists between these two users
    const { data: myParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (myParticipations?.length) {
      const myConvIds = myParticipations.map(p => p.conversation_id);
      const { data: otherParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', myConvIds);

      if (otherParticipations?.length) {
        // Check if any shared conversation is private
        const sharedIds = otherParticipations.map(p => p.conversation_id);
        const { data: sharedConvs } = await supabase
          .from('conversations')
          .select('id, type')
          .in('id', sharedIds)
          .eq('type', 'private');

        if (sharedConvs?.[0]) {
          // Already exists, just return the id
          return sharedConvs[0].id;
        }
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'private' })
      .select('id')
      .single();

    if (convError || !newConv) return null;

    // Add both participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: currentUserId },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);

    if (partError) return null;

    // Refresh conversations list
    setTimeout(() => refreshConversations(), 100);

    return newConv.id;
  }, [currentUserId, refreshConversations]);

  return (
    <ChatContext.Provider value={{ conversations, activeConversation, messages, setActiveConversation, sendMessage, createPrivateConversation, searchQuery, setSearchQuery, isLoading, refreshConversations }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
