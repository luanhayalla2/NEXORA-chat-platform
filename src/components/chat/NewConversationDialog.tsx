import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  is_online: boolean;
}

export function NewConversationDialog() {
  const { user } = useAuth();
  const { createConversation, setActiveConversation } = useChat();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_online')
        .neq('id', user.id)
        .limit(20);

      if (search.trim()) {
        query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
      }

      const { data } = await query;
      setUsers((data as UserResult[]) || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, open, user]);

  const handleStartChat = async (otherUserId: string) => {
    setCreating(otherUserId);
    try {
      const convId = await createConversation(otherUserId);
      if (convId) {
        setActiveConversation(convId);
        setOpen(false);
        setSearch('');
        toast.success('Conversa criada!');
      } else {
        toast.error('Erro ao criar conversa');
      }
    } finally {
      setCreating(null);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getAvatarColor = (id: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    return colors[id.charCodeAt(1) % colors.length];
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
          <DialogTitle>Nova conversa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {search ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
              </p>
            ) : (
              users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleStartChat(u.id)}
                  disabled={creating === u.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors disabled:opacity-50"
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
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                  </div>
                  {creating === u.id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
