import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  X, Moon, Sun, Bell, BellOff, Shield, Lock, Globe, Palette,
  User, LogOut, ChevronRight, ChevronLeft, Save, Languages,
  MessageSquare, HardDrive, Trash2, Info, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AppSettingsPanelProps {
  onClose: () => void;
}

type SettingsPage = 'main' | 'account' | 'notifications' | 'privacy' | 'appearance' | 'storage' | 'language' | 'about' | 'wallet';

export function AppSettingsPanel({ onClose }: AppSettingsPanelProps) {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = useState<SettingsPage>('main');

  // Notification settings
  const [notifSound, setNotifSound] = useState(true);
  const [notifPreview, setNotifPreview] = useState(true);
  const [notifVibrate, setNotifVibrate] = useState(true);

  // Privacy settings
  const [lastSeenVisible, setLastSeenVisible] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [profilePhotoVisible, setProfilePhotoVisible] = useState(true);

  // Account edit
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: editName,
        bio: editBio,
        phone: editPhone,
      });
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast.success('Cache limpo com sucesso!');
  };

  const handleDeleteAccount = () => {
    toast.error('Função de exclusão de conta em breve!', {
      description: 'Entre em contato com o suporte.',
    });
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Desconectado com sucesso!');
  };

  const menuItems: { id: SettingsPage; icon: React.ElementType; label: string; desc: string }[] = [
    { id: 'account', icon: User, label: 'Conta', desc: 'Editar perfil, nome, bio' },
    { id: 'wallet', icon: Wallet, label: 'Carteira', desc: 'Envie e receba criptomoedas' },
    { id: 'notifications', icon: Bell, label: 'Notificações', desc: 'Sons, vibração, preview' },
    { id: 'privacy', icon: Shield, label: 'Privacidade', desc: 'Visto por último, confirmação de leitura' },
    { id: 'appearance', icon: Palette, label: 'Aparência', desc: 'Tema claro/escuro' },
    { id: 'storage', icon: HardDrive, label: 'Armazenamento', desc: 'Cache e dados' },
    { id: 'language', icon: Languages, label: 'Idioma', desc: 'Português (BR)' },
    { id: 'about', icon: Info, label: 'Sobre', desc: 'NEXORA v1.0.0' },
  ];

  const renderPage = () => {
    switch (page) {
      case 'account':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Nome</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Bio</label>
              <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Sua bio" rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Telefone</label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+55 11 99999-9999" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input value={user?.email || ''} disabled className="opacity-60" />
            </div>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full rounded-xl">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
            <Separator />
            <Button variant="destructive" onClick={handleDeleteAccount} className="w-full rounded-xl">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir conta
            </Button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <SettingToggle label="Som de notificação" desc="Tocar som ao receber mensagem" checked={notifSound} onChange={setNotifSound} />
            <SettingToggle label="Pré-visualização" desc="Mostrar conteúdo na notificação" checked={notifPreview} onChange={setNotifPreview} />
            <SettingToggle label="Vibração" desc="Vibrar ao receber mensagem" checked={notifVibrate} onChange={setNotifVibrate} />
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <SettingToggle label="Visto por último" desc="Mostrar quando esteve online" checked={lastSeenVisible} onChange={setLastSeenVisible} />
            <SettingToggle label="Confirmação de leitura" desc="Enviar tiques azuis" checked={readReceipts} onChange={setReadReceipts} />
            <SettingToggle label="Foto de perfil" desc="Quem pode ver sua foto" checked={profilePhotoVisible} onChange={setProfilePhotoVisible} />
            <Separator />
            <div className="flex items-center gap-3 px-1">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Criptografia</p>
                <p className="text-xs text-muted-foreground">Mensagens protegidas de ponta a ponta</p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Tema atual</p>
                  <p className="text-xs text-muted-foreground">{theme === 'dark' ? 'Modo escuro' : 'Modo claro'}</p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} />
            </button>
            <div className="px-1">
              <p className="text-xs text-muted-foreground">
                O tema será aplicado em todo o aplicativo instantaneamente.
              </p>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm font-medium text-foreground">Cache do app</p>
              <p className="text-xs text-muted-foreground mt-1">Dados temporários armazenados localmente</p>
            </div>
            <Button variant="outline" onClick={handleClearCache} className="w-full rounded-xl">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar cache
            </Button>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-2">
            {['Português (BR)', 'English', 'Español'].map(lang => (
              <button
                key={lang}
                onClick={() => toast.info(`Idioma "${lang}" selecionado`)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{lang}</span>
                {lang === 'Português (BR)' && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4 text-center">
            <div className="py-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">NEXORA</h3>
              <p className="text-xs text-muted-foreground">Versão 1.0.0</p>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground leading-relaxed px-2">
              NEXORA é um aplicativo de mensagens moderno e seguro. Conecte-se com amigos, crie grupos e compartilhe momentos.
            </p>
            <p className="text-xs text-muted-foreground">© 2026 NEXORA. Todos os direitos reservados.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-card flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        {page !== 'main' ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setPage('main')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <h3 className="font-semibold text-foreground">
          {page === 'main' ? 'Configurações' : menuItems.find(m => m.id === page)?.label}
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {page === 'main' ? (
              <div className="space-y-1">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              renderPage()
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Logout */}
      {page === 'main' && (
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
      )}
    </motion.div>
  );
}

function SettingToggle({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
