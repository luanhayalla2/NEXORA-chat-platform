import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquarePlus, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UserResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_online: boolean | null;
}

export function NewChatDialog() {
  const { user } = useAuth();
  const { createPrivateConversation, setActiveConversation } = useChat();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const searchTerm = `%${query.trim()}%`;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, is_online')
        .neq('id', user?.id || '')
        .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
        .limit(10);

      if (!error && data) {
        setResults(data);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, user?.id]);

  const handleSelectUser = async (selectedUser: UserResult) => {
    setIsCreating(true);
    try {
      const convId = await createPrivateConversation(selectedUser.id);
      if (convId) {
        setActiveConversation(convId);
        setOpen(false);
        toast.success(`Conversa com ${selectedUser.display_name} iniciada!`);
      }
    } catch {
      toast.error('Erro ao criar conversa');
    } finally {
      setIsCreating(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getAvatarColor = (id: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    return colors[id.charCodeAt(0) % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou username..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhum usuário encontrado
            </p>
          )}

          {!isSearching && results.map(u => (
            <button
              key={u.id}
              onClick={() => handleSelectUser(u)}
              disabled={isCreating}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors text-left disabled:opacity-50"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={cn('text-sm font-semibold text-white', getAvatarColor(u.id))}>
                    {getInitials(u.display_name)}
                  </AvatarFallback>
                </Avatar>
                {u.is_online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{u.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
              </div>
            </button>
          ))}

          {!query.trim() && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Digite para buscar usuários
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
