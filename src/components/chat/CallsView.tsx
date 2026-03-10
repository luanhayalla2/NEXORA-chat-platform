import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type CallType = 'incoming' | 'outgoing' | 'missed';
type CallMedia = 'voice' | 'video';

interface CallLog {
  id: string;
  contactName: string;
  contactId: string;
  type: CallType;
  media: CallMedia;
  duration: string;
  timestamp: Date;
  color: string;
}

const MOCK_CALLS: CallLog[] = [
  { id: 'cl1', contactName: 'Maria Santos', contactId: '2', type: 'incoming', media: 'video', duration: '12:34', timestamp: new Date(Date.now() - 1800000), color: 'bg-blue-500' },
  { id: 'cl2', contactName: 'Carlos Oliveira', contactId: '3', type: 'outgoing', media: 'voice', duration: '5:21', timestamp: new Date(Date.now() - 7200000), color: 'bg-emerald-500' },
  { id: 'cl3', contactName: 'Ana Costa', contactId: '4', type: 'missed', media: 'voice', duration: '', timestamp: new Date(Date.now() - 14400000), color: 'bg-violet-500' },
  { id: 'cl4', contactName: 'Pedro Lima', contactId: '5', type: 'outgoing', media: 'video', duration: '45:12', timestamp: new Date(Date.now() - 86400000), color: 'bg-amber-500' },
  { id: 'cl5', contactName: 'Maria Santos', contactId: '2', type: 'incoming', media: 'voice', duration: '8:05', timestamp: new Date(Date.now() - 172800000), color: 'bg-blue-500' },
  { id: 'cl6', contactName: 'Julia Ferreira', contactId: '6', type: 'missed', media: 'video', duration: '', timestamp: new Date(Date.now() - 259200000), color: 'bg-rose-500' },
];

export function CallsView() {
  const [calls] = useState(MOCK_CALLS);
  const [filter, setFilter] = useState<'all' | 'missed'>('all');
  const [search, setSearch] = useState('');

  const filtered = calls
    .filter(c => filter === 'all' || c.type === 'missed')
    .filter(c => c.contactName.toLowerCase().includes(search.toLowerCase()));

  const getCallIcon = (type: CallType) => {
    switch (type) {
      case 'incoming': return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case 'outgoing': return <PhoneOutgoing className="h-4 w-4 text-primary" />;
      case 'missed': return <PhoneMissed className="h-4 w-4 text-destructive" />;
    }
  };

  const getCallLabel = (call: CallLog) => {
    const mediaLabel = call.media === 'video' ? 'Vídeo chamada' : 'Chamada de voz';
    const typeLabel = call.type === 'incoming' ? 'Recebida' : call.type === 'outgoing' ? 'Realizada' : 'Perdida';
    return `${mediaLabel} · ${typeLabel}${call.duration ? ` · ${call.duration}` : ''}`;
  };

  const handleCall = (name: string, media: CallMedia) => {
    toast.info(`${media === 'video' ? '📹' : '📞'} Ligando para ${name}...`, {
      description: media === 'video' ? 'Iniciando vídeo chamada...' : 'Iniciando chamada de voz...',
      duration: 3000,
    });
  };

  const formatCallTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return format(date, 'HH:mm');
    if (diff < 604800000) return format(date, 'EEEE', { locale: ptBR });
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Ligações</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => toast.info('Nova ligação em breve!')}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar ligações..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 bg-secondary border-0 text-sm rounded-xl"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs h-7"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'missed' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs h-7"
            onClick={() => setFilter('missed')}
          >
            Perdidas
          </Button>
        </div>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Phone className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ligação encontrada</p>
          </div>
        ) : (
          filtered.map((call, i) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className={cn('text-sm font-semibold text-white', call.color)}>
                  {call.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-medium text-sm truncate',
                  call.type === 'missed' ? 'text-destructive' : 'text-foreground'
                )}>
                  {call.contactName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getCallIcon(call.type)}
                  <span className="text-xs text-muted-foreground truncate">{getCallLabel(call)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">{formatCallTime(call.timestamp)}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleCall(call.contactName, 'voice')}
                  >
                    <Phone className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleCall(call.contactName, 'video')}
                  >
                    <Video className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
