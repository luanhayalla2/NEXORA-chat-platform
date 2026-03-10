import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Search, VolumeX, Volume2, Trash2, Ban, UserCircle, Pin } from 'lucide-react';
import { toast } from 'sonner';

interface ChatHeaderMenuProps {
  isMuted?: boolean;
  isPinned?: boolean;
  contactName: string;
  onViewProfile?: () => void;
}

export function ChatHeaderMenu({ isMuted, isPinned, contactName, onViewProfile }: ChatHeaderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onViewProfile}>
          <UserCircle className="h-4 w-4 mr-2" />
          Ver perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info('Busca na conversa em breve!')}>
          <Search className="h-4 w-4 mr-2" />
          Buscar na conversa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success(isPinned ? 'Conversa desafixada' : 'Conversa fixada')}>
          <Pin className="h-4 w-4 mr-2" />
          {isPinned ? 'Desafixar conversa' : 'Fixar conversa'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success(isMuted ? 'Notificações ativadas' : 'Conversa silenciada')}>
          {isMuted ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
          {isMuted ? 'Ativar notificações' : 'Silenciar'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => toast.info('Conversa limpa')}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar conversa
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toast.warning(`${contactName} bloqueado`)}
          className="text-destructive focus:text-destructive"
        >
          <Ban className="h-4 w-4 mr-2" />
          Bloquear
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
