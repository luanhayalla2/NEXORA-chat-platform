import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { motion, AnimatePresence } from 'framer-motion';
import nexoraLogo from '@/assets/nexora-logo.png';
import WelcomePage from './WelcomePage';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [screen, setScreen] = useState<'welcome' | 'auth'>('welcome');

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === 'welcome' ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
          >
            <WelcomePage
              onGetStarted={() => { setScreen('auth'); setMode('signup'); }}
              onLogin={() => { setScreen('auth'); setMode('login'); }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <button
                  onClick={() => setScreen('welcome')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1"
                >
                  ← Voltar
                </button>
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <img src={nexoraLogo} alt="NEXORA" className="w-16 h-16 object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">NEXORA</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <LoginForm key="login" onSwitchToSignup={() => setMode('signup')} />
                ) : (
                  <SignupForm key="signup" onSwitchToLogin={() => setMode('login')} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
