import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, AtSign, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signup, isLoading } = useAuth();
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.displayName || !form.username || !form.email || !form.password) {
      setError('Preencha todos os campos');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    try {
      await signup(form);
    } catch {
      setError('Erro ao criar conta');
    }
  };

  const fields = [
    { id: 'displayName', label: 'Nome completo', icon: User, type: 'text', placeholder: 'João Silva' },
    { id: 'username', label: 'Usuário', icon: AtSign, type: 'text', placeholder: 'joao_dev' },
    { id: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'seu@email.com' },
  ];

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4"
    >
      {fields.map(f => (
        <div key={f.id} className="space-y-1.5">
          <Label htmlFor={f.id} className="text-sm font-medium text-foreground">{f.label}</Label>
          <div className="relative">
            <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={f.id}
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.id as keyof typeof form]}
              onChange={e => update(f.id, e.target.value)}
              className="pl-10 h-11 bg-secondary/50 border-border focus:border-primary"
            />
          </div>
        </div>
      ))}

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={e => update('password', e.target.value)}
            className="pl-10 pr-10 h-11 bg-secondary/50 border-border focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive text-center">
          {error}
        </motion.p>
      )}

      <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Criar conta
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
          Fazer login
        </button>
      </p>
    </motion.form>
  );
}
