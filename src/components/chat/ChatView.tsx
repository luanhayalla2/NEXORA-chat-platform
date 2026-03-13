import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Send, Paperclip, Check, CheckCheck, Mic, Camera, FileText, Image, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiPicker } from './EmojiPicker';
import { ChatHeaderMenu } from './ChatHeaderMenu';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Message } from '@/types';

export function ChatView() {
  const { activeConversation, messages, sendMessage, setActiveConversation } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeConversation) inputRef.current?.focus();
  }, [activeConversation]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    toast.success(`Arquivo "${file.name}" (${sizeMB}MB) selecionado`);
    // TODO: upload to storage and send as attachment
    e.target.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    const type = file.type.startsWith('video') ? 'Vídeo' : 'Foto';
    toast.success(`${type} capturado com sucesso!`);
    // TODO: upload to storage and send as attachment
    e.target.value = '';
  };

  const handleCall = () => {
    if (!activeConversation) return;
    const phone = activeConversation.otherUser?.phone;
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      toast.info(`Ligando para ${activeConversation.otherUser?.displayName || activeConversation.name}...`, {
        description: 'Chamadas de voz em breve!',
        duration: 3000,
      });
    }
  };

  const handleMicPress = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info('🎙️ Gravando áudio...', { description: 'Clique novamente para parar' });
    } else {
      setIsRecording(false);
      toast.success('Áudio gravado!', { description: 'Envio de áudio em breve!' });
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'read': return <CheckCheck className="h-3.5 w-3.5 text-primary" />;
      default: return null;
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-3"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">NEXORA</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Selecione uma conversa para começar a trocar mensagens
          </p>
        </motion.div>
      </div>
    );
  }

  const convName = activeConversation.name || activeConversation.otherUser?.displayName || 'Chat';
  const convInitials = convName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isOnline = activeConversation.type === 'private' && activeConversation.otherUser?.isOnline;
  const subtitle = activeConversation.type === 'group'
    ? `${activeConversation.participants.length} membros`
    : activeConversation.type === 'channel'
      ? `${activeConversation.participants.length} inscritos`
      : isOnline ? 'online' : 'visto por último recentemente';

  const getAvatarColor = (id: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    return colors[id.charCodeAt(1) % colors.length];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card">
        <button
          onClick={() => setActiveConversation(null)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className={cn('text-sm font-semibold text-white', getAvatarColor(activeConversation.id))}>
            {convInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm text-foreground truncate">{convName}</h2>
          <p className={cn('text-xs', isOnline ? 'text-primary' : 'text-muted-foreground')}>
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <ChatHeaderMenu
            contactName={convName}
            isMuted={activeConversation.isMuted}
            isPinned={activeConversation.isPinned}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isOwn = msg.senderId === '1';
            const showTime = i === 0 || 
              (messages[i - 1].createdAt.getTime() - msg.createdAt.getTime() > 300000);
            
            return (
              <React.Fragment key={msg.id}>
                {showTime && i === 0 && (
                  <div className="flex justify-center py-2">
                    <span className="text-xs text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">
                      {format(msg.createdAt, 'dd MMM yyyy')}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn(
                    'max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
                    isOwn 
                      ? 'message-bubble-out rounded-br-md' 
                      : 'message-bubble-in rounded-bl-md shadow-sm border border-border/50'
                  )}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
                      <span className="text-[10px] text-muted-foreground">
                        {format(msg.createdAt, 'HH:mm')}
                      </span>
                      {isOwn && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleCameraCapture}
      />

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <EmojiPicker onSelect={handleEmojiSelect} />

          {/* Attachment dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.click();
                }
              }}>
                <Image className="h-4 w-4 mr-2" />
                Imagem
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'video/*';
                  fileInputRef.current.click();
                }
              }}>
                <Film className="h-4 w-4 mr-2" />
                Vídeo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip';
                  fileInputRef.current.click();
                }
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Camera */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full shrink-0"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 text-muted-foreground" />
          </Button>

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem..."
            className="flex-1 h-10 px-4 bg-secondary/50 rounded-full text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {input.trim() ? (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                onClick={handleSend}
                size="icon"
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                onClick={handleMicPress}
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full transition-colors',
                  isRecording
                    ? 'bg-destructive hover:bg-destructive/90 animate-pulse'
                    : 'bg-primary hover:bg-primary/90'
                )}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
