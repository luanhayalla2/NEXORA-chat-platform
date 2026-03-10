import React, { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { X, Mail, Phone, AtSign, Moon, Sun, LogOut, Edit2, Shield, Bell, Camera, Check, MessageSquare, Clock, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProfilePanelProps {
  onClose: () => void;
}

export function ProfilePanel({ onClose }: ProfilePanelProps) {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  if (!user) return null;

  const initials = user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ displayName: editName, bio: editBio, phone: editPhone });
      setIsEditing(false);
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    // permite selecionar o mesmo arquivo novamente
    e.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }

    const maxSizeMb = 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Imagem muito grande (máx. ${maxSizeMb}MB)`);
      return;
    }

    try {
      setIsUploadingAvatar(true);

      const extFromName = file.name.split('.').pop()?.toLowerCase();
      const extFromMime = file.type.split('/')[1]?.toLowerCase();
      const rawExt = extFromName || extFromMime || 'png';
      const safeExt = rawExt.replace(/[^a-z0-9]/g, '') || 'png';

      // IMPORTANTE: a policy usa storage.foldername(name)[1] = auth.uid()
      const path = `${user.id}/avatar.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // cache-bust simples (e.g. CDN / browser)
      await updateProfile({ avatarUrl: `${publicUrl}?v=${Date.now()}` });
      toast.success('Foto atualizada!');
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Não foi possível enviar a imagem.';
      toast.error('Erro ao atualizar foto', { description });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Até logo! 👋');
  };

  const statsItems = [
    { icon: MessageSquare, label: 'Mensagens', value: '1.2k' },
    { icon: Clock, label: 'Tempo ativo', value: '3h hoje' },
    { icon: Globe, label: 'Comunidades', value: '4' },
  ];

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-80 border-l border-border bg-card h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">Perfil</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Avatar & Name */}
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
          <div className="flex flex-col items-center -mt-12 px-4 pb-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={`Foto de ${user.displayName}`} />
                ) : null}
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelected}
              />

              <button
                type="button"
                onClick={handleAvatarChange}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-card shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Alterar foto de perfil"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-primary-foreground" />
                )}
              </button>
            </div>

            {isEditing ? (
              <div className="w-full mt-3 space-y-2">
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Nome"
                  className="text-center text-sm h-9"
                />
                <Input
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Bio"
                  className="text-center text-sm h-9"
                />
                <Input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="Telefone"
                  className="text-center text-sm h-9"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="flex-1 rounded-full" onClick={handleSaveProfile}>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-foreground mt-3">{user.displayName}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>
                {user.bio && <p className="text-sm text-muted-foreground mt-1 text-center">{user.bio}</p>}
                <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Editar perfil
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 px-4 py-3">
          {statsItems.map(item => (
            <div key={item.label} className="flex flex-col items-center py-2 rounded-xl bg-secondary/50">
              <item.icon className="h-4 w-4 text-primary mb-1" />
              <p className="text-sm font-bold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Info */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informações</p>
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: Phone, label: 'Telefone', value: user.phone || 'Não informado' },
            { icon: AtSign, label: 'Usuário', value: `@${user.username}` },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Settings */}
        <div className="px-4 py-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configurações rápidas</p>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <span className="text-sm font-medium text-foreground">
              {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </span>
          </button>
          <button
            onClick={() => toast.info('Configurações de notificações em breve!')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Notificações</span>
          </button>
          <button
            onClick={() => toast.info('Privacidade e segurança em breve!')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Privacidade e Segurança</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da conta
        </Button>
      </div>
    </motion.div>
  );
}
