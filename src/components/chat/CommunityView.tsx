import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Globe, Lock, ChevronRight, ArrowLeft, Search, X, Check, Trash2, LogOut, Send, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  isPrivate: boolean;
  color: string;
  lastActivity: string;
  isJoined: boolean;
}

const COMMUNITY_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500',
];

const INITIAL_COMMUNITIES: Community[] = [
  { id: 'cm1', name: 'Desenvolvedores React', description: 'Comunidade para devs React/TypeScript', members: 342, isPrivate: false, color: 'bg-blue-500', lastActivity: 'Novo post há 5min', isJoined: true },
  { id: 'cm2', name: 'UI/UX Designers', description: 'Compartilhe designs e peça feedback', members: 189, isPrivate: false, color: 'bg-violet-500', lastActivity: 'Discussão ativa', isJoined: true },
  { id: 'cm3', name: 'Equipe NEXORA', description: 'Grupo interno da equipe', members: 15, isPrivate: true, color: 'bg-emerald-500', lastActivity: 'Atualização há 1h', isJoined: true },
  { id: 'cm4', name: 'Open Source BR', description: 'Projetos open source brasileiros', members: 567, isPrivate: false, color: 'bg-amber-500', lastActivity: 'Novo membro', isJoined: true },
  { id: 'cm5', name: 'DevOps & Cloud', description: 'AWS, GCP, Azure e mais', members: 231, isPrivate: false, color: 'bg-rose-500', lastActivity: 'Artigo compartilhado', isJoined: true },
];

const DISCOVER_COMMUNITIES: Community[] = [
  { id: 'dc1', name: 'Flutter Brasil', description: 'Comunidade brasileira de Flutter e Dart', members: 1204, isPrivate: false, color: 'bg-cyan-500', lastActivity: '128 posts hoje', isJoined: false },
  { id: 'dc2', name: 'Data Science PT', description: 'Machine Learning, IA e Big Data', members: 876, isPrivate: false, color: 'bg-pink-500', lastActivity: '45 posts hoje', isJoined: false },
  { id: 'dc3', name: 'Startup Weekend', description: 'Empreendedorismo e startups', members: 2341, isPrivate: false, color: 'bg-teal-500', lastActivity: 'Evento em breve', isJoined: false },
  { id: 'dc4', name: 'Cybersecurity BR', description: 'Segurança da informação e hacking ético', members: 654, isPrivate: false, color: 'bg-rose-500', lastActivity: '32 posts hoje', isJoined: false },
  { id: 'dc5', name: 'Game Dev Brasil', description: 'Desenvolvimento de jogos com Unity e Unreal', members: 1567, isPrivate: false, color: 'bg-amber-500', lastActivity: 'Jam em andamento', isJoined: false },
  { id: 'dc6', name: 'Design Systems', description: 'Tokens, componentes e padrões de design', members: 432, isPrivate: false, color: 'bg-violet-500', lastActivity: '18 posts hoje', isJoined: false },
  { id: 'dc7', name: 'Blockchain & Web3', description: 'Crypto, DeFi e descentralização', members: 987, isPrivate: true, color: 'bg-blue-500', lastActivity: 'Debate ativo', isJoined: false },
];

type View = 'list' | 'create' | 'discover' | 'detail';

export function CommunityView() {
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [discoverList, setDiscoverList] = useState<Community[]>(DISCOVER_COMMUNITIES);
  const [view, setView] = useState<View>('list');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [discoverSearch, setDiscoverSearch] = useState('');

  // Create form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrivate, setNewPrivate] = useState(false);
  const [newColor, setNewColor] = useState(0);

  const resetCreateForm = () => {
    setNewName('');
    setNewDesc('');
    setNewPrivate(false);
    setNewColor(0);
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error('Dê um nome para a comunidade');
      return;
    }
    const created: Community = {
      id: `my-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Sem descrição',
      members: 1,
      isPrivate: newPrivate,
      color: COMMUNITY_COLORS[newColor],
      lastActivity: 'Criada agora',
      isJoined: true,
    };
    setCommunities(prev => [created, ...prev]);
    resetCreateForm();
    setView('list');
    toast.success(`Comunidade "${created.name}" criada! 🎉`);
  };

  const handleJoin = (community: Community) => {
    setCommunities(prev => [...prev, { ...community, isJoined: true }]);
    setDiscoverList(prev => prev.filter(c => c.id !== community.id));
    toast.success(`Você entrou em "${community.name}"! 🎉`);
  };

  const handleLeave = (id: string) => {
    const comm = communities.find(c => c.id === id);
    setCommunities(prev => prev.filter(c => c.id !== id));
    setSelectedCommunity(null);
    setView('list');
    if (comm) toast.success(`Você saiu de "${comm.name}"`);
  };

  const handleDelete = (id: string) => {
    const comm = communities.find(c => c.id === id);
    setCommunities(prev => prev.filter(c => c.id !== id));
    setSelectedCommunity(null);
    setView('list');
    if (comm) toast.success(`Comunidade "${comm.name}" excluída`);
  };

  const handleOpenDetail = (community: Community) => {
    setSelectedCommunity(community);
    setView('detail');
  };

  const filteredDiscover = discoverList.filter(c =>
    c.name.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(discoverSearch.toLowerCase())
  );

  // ---- Create View ----
  if (view === 'create') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setView('list'); resetCreateForm(); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm text-foreground flex-1">Nova comunidade</span>
          <Button size="sm" className="rounded-full" onClick={handleCreate} disabled={!newName.trim()}>
            <Check className="h-4 w-4 mr-1" />
            Criar
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Icon preview */}
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarFallback className={cn('text-2xl font-bold text-white', COMMUNITY_COLORS[newColor])}>
                {newName ? newName.charAt(0).toUpperCase() : <Users className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              {COMMUNITY_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setNewColor(i)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-all',
                    color,
                    newColor === i ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'opacity-60 hover:opacity-100'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome da comunidade *</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Desenvolvedores React" maxLength={50} className="h-10" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{newName.length}/50</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Sobre o que é essa comunidade?" maxLength={150} className="h-10" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{newDesc.length}/150</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Comunidade privada</p>
                  <p className="text-xs text-muted-foreground">Apenas convidados podem entrar</p>
                </div>
              </div>
              <Switch checked={newPrivate} onCheckedChange={setNewPrivate} />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- Discover View ----
  if (view === 'discover') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setView('list'); setDiscoverSearch(''); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm text-foreground flex-1">Descobrir comunidades</span>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar comunidades..."
              value={discoverSearch}
              onChange={e => setDiscoverSearch(e.target.value)}
              className="pl-9 h-9 bg-secondary border-0 text-sm rounded-xl"
            />
            {discoverSearch && (
              <button onClick={() => setDiscoverSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {filteredDiscover.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
              <Globe className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Nenhuma comunidade encontrada</p>
              <p className="text-xs mt-1">Tente outro termo de busca</p>
            </div>
          ) : (
            filteredDiscover.map((community, i) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={cn('text-sm font-bold text-white', community.color)}>
                    {community.isPrivate ? <Lock className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm text-foreground truncate">{community.name}</p>
                    {community.isPrivate && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{community.description}</p>
                  <span className="text-[10px] text-muted-foreground">{community.members.toLocaleString()} membros</span>
                </div>
                <Button size="sm" className="rounded-full text-xs h-8 gap-1" onClick={() => handleJoin(community)}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Entrar
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  // ---- Detail View ----
  if (view === 'detail' && selectedCommunity) {
    const isCreator = selectedCommunity.id.startsWith('my-');
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setView('list')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm text-foreground flex-1 truncate">{selectedCommunity.name}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col items-center py-8 px-4">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarFallback className={cn('text-2xl font-bold text-white', selectedCommunity.color)}>
                {selectedCommunity.isPrivate ? <Lock className="h-8 w-8" /> : <Users className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold text-foreground text-center">{selectedCommunity.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 text-center">{selectedCommunity.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-muted-foreground">{selectedCommunity.members} membros</span>
              <span className="text-xs text-primary">{selectedCommunity.lastActivity}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 space-y-2">
            <Button variant="outline" className="w-full justify-start rounded-xl h-11 gap-3" onClick={() => toast.info('Convidar membros em breve!')}>
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="text-sm">Convidar membros</span>
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-11 gap-3" onClick={() => toast.info('Enviar mensagem na comunidade em breve!')}>
              <Send className="h-4 w-4 text-primary" />
              <span className="text-sm">Enviar mensagem</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-11 gap-3 text-destructive hover:text-destructive"
              onClick={() => handleLeave(selectedCommunity.id)}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sair da comunidade</span>
            </Button>
            {isCreator && (
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl h-11 gap-3 text-destructive hover:text-destructive"
                onClick={() => handleDelete(selectedCommunity.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Excluir comunidade</span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- Main List ----
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Comunidades</h2>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setView('create')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 h-8" onClick={() => setView('create')}>
            <Plus className="h-3.5 w-3.5" />
            Nova comunidade
          </Button>
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 h-8" onClick={() => setView('discover')}>
            <Globe className="h-3.5 w-3.5" />
            Descobrir
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {communities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma comunidade ainda</p>
            <p className="text-xs mt-1">Crie ou descubra comunidades</p>
          </div>
        ) : (
          <>
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suas comunidades</p>
            {communities.map((community, i) => (
              <motion.button
                key={community.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleOpenDetail(community)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={cn('text-sm font-bold text-white', community.color)}>
                    {community.isPrivate ? <Lock className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm text-foreground truncate">{community.name}</p>
                    {community.isPrivate && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{community.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{community.members} membros</span>
                    <span className="text-[10px] text-primary">{community.lastActivity}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
