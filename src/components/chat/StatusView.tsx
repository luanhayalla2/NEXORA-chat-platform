import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Camera, Edit3, Eye, X, Send, Image, Palette, Type, ArrowLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Status {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  bgColor: string;
  timestamp: Date;
  views: number;
  avatarColor: string;
}

const BG_COLORS = [
  'from-primary to-accent',
  'from-rose-500 to-amber-500',
  'from-violet-500 to-blue-500',
  'from-emerald-500 to-cyan-500',
  'from-amber-500 to-rose-500',
  'from-blue-600 to-violet-600',
  'from-pink-500 to-purple-500',
  'from-teal-500 to-green-500',
];

const INITIAL_STATUSES: Status[] = [
  { id: 's1', userId: '2', userName: 'Maria Santos', content: 'Trabalhando no novo design! 🎨', type: 'text', bgColor: 'from-violet-500 to-blue-500', timestamp: new Date(Date.now() - 1800000), views: 12, avatarColor: 'bg-blue-500' },
  { id: 's2', userId: '3', userName: 'Carlos Oliveira', content: 'Sprint review amanhã! 📋', type: 'text', bgColor: 'from-emerald-500 to-cyan-500', timestamp: new Date(Date.now() - 3600000), views: 8, avatarColor: 'bg-emerald-500' },
  { id: 's3', userId: '5', userName: 'Pedro Lima', content: 'Deploy concluído com sucesso 🚀', type: 'text', bgColor: 'from-primary to-accent', timestamp: new Date(Date.now() - 7200000), views: 15, avatarColor: 'bg-violet-500' },
  { id: 's4', userId: '6', userName: 'Julia Ferreira', content: 'Novas ilustrações prontas! ✨', type: 'text', bgColor: 'from-amber-500 to-rose-500', timestamp: new Date(Date.now() - 14400000), views: 6, avatarColor: 'bg-amber-500' },
];

type EditorMode = 'text' | 'camera' | null;

export function StatusView() {
  const [statuses, setStatuses] = useState<Status[]>(INITIAL_STATUSES);
  const [myStatuses, setMyStatuses] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [statusText, setStatusText] = useState('');
  const [selectedBg, setSelectedBg] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const timeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  const openTextEditor = () => {
    setEditorMode('text');
    setStatusText('');
    setSelectedBg(0);
  };

  const openCameraEditor = () => {
    cameraInputRef.current?.click();
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setImageCaption('');
      setEditorMode('camera');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setImageCaption('');
      setEditorMode('camera');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const publishTextStatus = () => {
    if (!statusText.trim()) {
      toast.error('Escreva algo para seu status!');
      return;
    }
    const newStatus: Status = {
      id: `my-${Date.now()}`,
      userId: '1',
      userName: 'Você',
      content: statusText.trim(),
      type: 'text',
      bgColor: BG_COLORS[selectedBg],
      timestamp: new Date(),
      views: 0,
      avatarColor: 'bg-primary',
    };
    setMyStatuses(prev => [newStatus, ...prev]);
    setEditorMode(null);
    setStatusText('');
    toast.success('Status publicado! 🎉');
  };

  const publishImageStatus = () => {
    if (!capturedImage) return;
    const newStatus: Status = {
      id: `my-${Date.now()}`,
      userId: '1',
      userName: 'Você',
      content: imageCaption.trim() || '',
      type: 'image',
      imageUrl: capturedImage,
      bgColor: BG_COLORS[0],
      timestamp: new Date(),
      views: 0,
      avatarColor: 'bg-primary',
    };
    setMyStatuses(prev => [newStatus, ...prev]);
    setEditorMode(null);
    setCapturedImage(null);
    setImageCaption('');
    toast.success('Status com foto publicado! 📸');
  };

  const deleteMyStatus = (id: string) => {
    setMyStatuses(prev => prev.filter(s => s.id !== id));
    setSelectedStatus(null);
    toast.success('Status removido');
  };

  // ---- Text Editor ----
  if (editorMode === 'text') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full bg-background"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setEditorMode(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm text-foreground">Novo status</span>
          <Button size="sm" className="rounded-full" onClick={publishTextStatus} disabled={!statusText.trim()}>
            <Send className="h-4 w-4 mr-1" />
            Publicar
          </Button>
        </div>

        {/* Preview */}
        <div className={cn('flex-1 flex items-center justify-center p-6 bg-gradient-to-br', BG_COLORS[selectedBg])}>
          <textarea
            autoFocus
            value={statusText}
            onChange={e => setStatusText(e.target.value)}
            placeholder="Escreva seu status..."
            maxLength={500}
            className="bg-transparent text-white text-xl font-semibold text-center w-full max-w-sm resize-none outline-none placeholder:text-white/50 min-h-[120px]"
          />
        </div>

        {/* Color picker */}
        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Cor de fundo</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {BG_COLORS.map((color, i) => (
              <button
                key={i}
                onClick={() => setSelectedBg(i)}
                className={cn(
                  'h-8 w-8 rounded-full shrink-0 bg-gradient-to-br transition-all',
                  color,
                  selectedBg === i ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'opacity-70 hover:opacity-100'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">{statusText.length}/500</p>
        </div>
      </motion.div>
    );
  }

  // ---- Camera/Image Editor ----
  if (editorMode === 'camera' && capturedImage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full bg-background"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setEditorMode(null); setCapturedImage(null); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm text-foreground">Status com foto</span>
          <Button size="sm" className="rounded-full" onClick={publishImageStatus}>
            <Send className="h-4 w-4 mr-1" />
            Publicar
          </Button>
        </div>

        {/* Image Preview */}
        <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
          <img
            src={capturedImage}
            alt="Status preview"
            className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
          />
        </div>

        {/* Caption */}
        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={imageCaption}
              onChange={e => setImageCaption(e.target.value)}
              placeholder="Adicionar legenda..."
              maxLength={200}
              className="text-sm h-9"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- Status Viewer ----
  if (selectedStatus) {
    const isMyStatus = selectedStatus.userId === '1';
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-background flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setSelectedStatus(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn('text-sm font-semibold text-white', selectedStatus.avatarColor)}>
              {selectedStatus.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">{selectedStatus.userName}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(selectedStatus.timestamp)}</p>
          </div>
          {isMyStatus && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-destructive" onClick={() => deleteMyStatus(selectedStatus.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          {selectedStatus.type === 'image' && selectedStatus.imageUrl ? (
            <div className="flex flex-col items-center gap-3 max-w-sm w-full">
              <img src={selectedStatus.imageUrl} alt="Status" className="max-h-[50vh] object-contain rounded-xl shadow-lg" />
              {selectedStatus.content && (
                <p className="text-sm text-foreground text-center">{selectedStatus.content}</p>
              )}
            </div>
          ) : (
            <div className={cn('bg-gradient-to-br rounded-2xl p-8 max-w-sm w-full text-center', selectedStatus.bgColor)}>
              <p className="text-xl font-semibold text-white">{selectedStatus.content}</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-center gap-1 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="text-xs">{selectedStatus.views} visualizações</span>
        </div>
      </motion.div>
    );
  }

  // ---- Main Status List ----
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hidden inputs */}
      <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleCameraCapture} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

      {/* My Status */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => myStatuses.length > 0 ? setSelectedStatus(myStatuses[0]) : openTextEditor()}>
              <Avatar className={cn('h-14 w-14', myStatuses.length > 0 && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
                <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">EU</AvatarFallback>
              </Avatar>
            </button>
            <button
              onClick={openTextEditor}
              className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center border-2 border-background"
            >
              <Plus className="h-3.5 w-3.5 text-primary-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Meu status</p>
            <p className="text-xs text-muted-foreground">
              {myStatuses.length > 0 ? `${myStatuses.length} atualização(ões) · Toque para ver` : 'Toque para atualizar seu status'}
            </p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={openCameraEditor} title="Câmera">
              <Camera className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={openGallery} title="Galeria">
              <Image className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={openTextEditor} title="Escrever">
              <Edit3 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* My statuses */}
      {myStatuses.length > 0 && (
        <div>
          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meus status</p>
          {myStatuses.map((status, i) => (
            <motion.button
              key={status.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedStatus(status)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="rounded-full p-[2px] bg-gradient-to-tr from-primary to-accent">
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">EU</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {status.type === 'image' ? '📸 Foto' : status.content.slice(0, 40)}
                  {status.content.length > 40 ? '...' : ''}
                </p>
                <p className="text-xs text-muted-foreground">{timeAgo(status.timestamp)} · {status.views} visualizações</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-destructive shrink-0"
                onClick={(e) => { e.stopPropagation(); deleteMyStatus(status.id); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.button>
          ))}
        </div>
      )}

      {/* Others' statuses */}
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atualizações recentes</p>
        <AnimatePresence>
          {statuses.map((status, i) => (
            <motion.button
              key={status.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedStatus(status)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="rounded-full p-[2px] bg-gradient-to-tr from-primary to-accent">
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarFallback className={cn('text-sm font-semibold text-white', status.avatarColor)}>
                    {status.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{status.userName}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(status.timestamp)}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
