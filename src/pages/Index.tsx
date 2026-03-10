import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from './AuthPage';
import ChatPage from './ChatPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAuthenticated ? <ChatPage /> : <AuthPage />;
};

export default Index;
