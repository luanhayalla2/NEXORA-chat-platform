import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import nexoraLogo from '@/assets/nexora-logo.png';

const slides = [
  {
    icon: MessageCircle,
    title: 'Mensagens em tempo real',
    description: 'Envio rápido e instantâneo.',
    color: 'bg-primary/15 text-primary',
  },
  {
    icon: Users,
    title: 'Crie comunidades',
    description: 'Conecte pessoas e grupos.',
    color: 'bg-accent text-accent-foreground',
  },
  {
    icon: Shield,
    title: 'Chat seguro',
    description: 'Conversas protegidas e privadas.',
    color: 'bg-destructive/15 text-destructive',
  },
  {
    icon: Globe,
    title: 'Conexão instantânea',
    description: 'Conecte-se com o mundo.',
    color: 'bg-success/15 text-success',
  },
];

interface WelcomePageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function WelcomePage({ onGetStarted, onLogin }: WelcomePageProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(slides.length - 1, idx)));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(current + (diff > 0 ? 1 : -1));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-4"
      >
        <img src={nexoraLogo} alt="NEXORA" className="w-20 h-20 object-contain" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-foreground tracking-tight mb-10"
      >
        NEXORA
      </motion.h1>

      {/* Carousel */}
      <div
        className="w-full max-w-sm overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-center px-4 py-8"
          >
            <div className={`w-20 h-20 rounded-3xl ${slides[current].color} flex items-center justify-center mx-auto mb-6`}>
              {React.createElement(slides[current].icon, { className: 'h-10 w-10' })}
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              {slides[current].title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2 mt-4 mb-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Button
          size="lg"
          onClick={onGetStarted}
          className="w-full text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          Começar Agora
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onLogin}
          className="w-full text-base font-semibold rounded-xl"
        >
          Já tenho conta
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-xs text-muted-foreground"
      >
        NEXORA © {new Date().getFullYear()} — Privacidade · Termos
      </motion.p>
    </div>
  );
}
