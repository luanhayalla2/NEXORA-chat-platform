import React, { useState } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatView } from '@/components/chat/ChatView';
import { ProfilePanel } from '@/components/chat/ProfilePanel';
import { AppSettingsPanel } from '@/components/chat/AppSettingsPanel';
import { StatusView } from '@/components/chat/StatusView';
import { CommunityView } from '@/components/chat/CommunityView';
import { CallsView } from '@/components/chat/CallsView';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, MessageCircle, CircleDot, Users, Phone } from 'lucide-react';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { AnimatePresence, motion } from 'framer-motion';

type SidebarTab = 'chats' | 'status' | 'community' | 'calls';

function ChatLayout() {
  const { user } = useAuth();
  const { activeConversation } = useChat();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('chats');

  const initials = user?.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  const tabs: { id: SidebarTab; icon: React.ElementType; label: string }[] = [
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'status', icon: CircleDot, label: 'Status' },
    { id: 'community', icon: Users, label: 'Comunidade' },
    { id: 'calls', icon: Phone, label: 'Ligações' },
  ];

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'status': return <StatusView />;
      case 'community': return <CommunityView />;
      case 'calls': return <CallsView />;
      default: return <ConversationList />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className={cn(
        'w-full lg:w-[380px] xl:w-[420px] border-r border-border flex flex-col shrink-0',
        'transition-all duration-300',
        activeConversation ? 'hidden lg:flex' : 'flex'
      )}>
        {/* User header */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProfile(true)}>
              <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
            <span className="font-semibold text-sm text-foreground">NEXORA</span>
          </div>
          <div className="flex items-center gap-1">
            <NewChatDialog />
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-card">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors relative',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderSidebarContent()}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {showSettings && <AppSettingsPanel onClose={() => setShowSettings(false)} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat area */}
      <div className={cn(
        'flex-1 flex',
        !activeConversation ? 'hidden lg:flex' : 'flex'
      )}>
        <ChatView />
        <AnimatePresence>
          {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}
