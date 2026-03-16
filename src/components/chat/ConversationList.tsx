import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Pin, VolumeX, Users, Megaphone, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationWithUser } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListProps {
  onMenuClick?: () => void;
}

export function ConversationList({ onMenuClick }: ConversationListProps) {
  const { conversations, activeConversation, setActiveConversation, searchQuery, setSearchQuery } = useChat();
  const { user } = useAuth();
  const currentUserId = user?.id;

  const filtered = conversations.filter(c => {
    const name = c.name || c.otherUser?.displayName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return format(date, 'HH:mm');
    if (diff < 604800000) return format(date, 'EEE', { locale: ptBR });
    return format(date, 'dd/MM', { locale: ptBR });
  };

  const getConversationName = (conv: ConversationWithUser) => {
    if (conv.name) return conv.name;
    return conv.otherUser?.displayName || 'Desconhecido';
  };

  const getInitials = (conv: ConversationWithUser) => {
    const name = getConversationName(conv);
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getTypeIcon = (conv: ConversationWithUser) => {
    if (conv.type === 'group') return <Users className="h-3 w-3" />;
    if (conv.type === 'channel') return <Megaphone className="h-3 w-3" />;
    return null;
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
    ];
    const idx = id.charCodeAt(1) % colors.length;
    return colors[idx];
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-sidebar-border">
        <button onClick={onMenuClick} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors lg:hidden">
          <Menu className="h-5 w-5 text-sidebar-foreground" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-sidebar-accent border-0 text-sm rounded-xl"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filtered.map((conv, i) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setActiveConversation(conv.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 transition-colors text-left',
                'hover:bg-sidebar-accent/60',
                activeConversation?.id === conv.id && 'bg-primary/10 hover:bg-primary/15'
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={cn('text-sm font-semibold text-white', getAvatarColor(conv.id))}>
                    {getInitials(conv)}
                  </AvatarFallback>
                </Avatar>
                {conv.type === 'private' && conv.otherUser?.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-sidebar-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getTypeIcon(conv)}
                    <span className={cn(
                      'font-medium text-sm truncate text-sidebar-foreground',
                      conv.unreadCount > 0 && 'font-semibold'
                    )}>
                      {getConversationName(conv)}
                    </span>
                    {conv.isPinned && <Pin className="h-3 w-3 text-muted-foreground shrink-0" />}
                    {conv.isMuted && <VolumeX className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </div>
                  {conv.lastMessage && (
                    <span className={cn(
                      'text-xs shrink-0 ml-2',
                      conv.unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'
                    )}>
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-sm text-muted-foreground truncate pr-2">
                    {conv.lastMessage?.senderId === '1' && (
                      <span className="text-primary">Você: </span>
                    )}
                    {conv.lastMessage?.content || 'Nenhuma mensagem'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <Badge className={cn(
                      'h-5 min-w-5 flex items-center justify-center rounded-full text-xs px-1.5 shrink-0',
                      conv.isMuted ? 'bg-muted-foreground' : 'bg-primary text-primary-foreground'
                    )}>
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
