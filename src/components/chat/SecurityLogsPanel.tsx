import React, { useState, useEffect } from 'react';
import { getSecurityLogs, clearSecurityLogs } from '@/lib/securityLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Shield, Trash2, Search, AlertTriangle, CheckCircle2, XCircle,
  LogIn, LogOut, UserX, MessageSquare, RefreshCw, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SecurityLogsPanelProps {
  onClose: () => void;
}

const eventIcons: Record<string, React.ElementType> = {
  LOGIN_SUCCESS: CheckCircle2,
  LOGIN_FAILED: XCircle,
  SIGNUP_SUCCESS: CheckCircle2,
  SIGNUP_FAILED: XCircle,
  LOGOUT: LogOut,
  SESSION_EXPIRED: Clock,
  UNAUTHORIZED_ACCESS: UserX,
  MESSAGE_SANITIZED: MessageSquare,
  INVALID_INPUT: AlertTriangle,
  RATE_LIMIT_HIT: AlertTriangle,
  PROFILE_UPDATED: RefreshCw,
};

const eventColors: Record<string, string> = {
  LOGIN_SUCCESS: 'text-green-500',
  LOGIN_FAILED: 'text-destructive',
  SIGNUP_SUCCESS: 'text-green-500',
  SIGNUP_FAILED: 'text-destructive',
  LOGOUT: 'text-muted-foreground',
  SESSION_EXPIRED: 'text-yellow-500',
  UNAUTHORIZED_ACCESS: 'text-destructive',
  MESSAGE_SANITIZED: 'text-yellow-500',
  INVALID_INPUT: 'text-yellow-500',
  RATE_LIMIT_HIT: 'text-destructive',
  PROFILE_UPDATED: 'text-blue-500',
};

const eventLabels: Record<string, string> = {
  LOGIN_SUCCESS: 'Login bem-sucedido',
  LOGIN_FAILED: 'Login falhou',
  SIGNUP_SUCCESS: 'Cadastro bem-sucedido',
  SIGNUP_FAILED: 'Cadastro falhou',
  LOGOUT: 'Logout',
  SESSION_EXPIRED: 'Sessão expirada',
  UNAUTHORIZED_ACCESS: 'Acesso não autorizado',
  MESSAGE_SANITIZED: 'Mensagem sanitizada',
  INVALID_INPUT: 'Entrada inválida',
  RATE_LIMIT_HIT: 'Rate limit atingido',
  PROFILE_UPDATED: 'Perfil atualizado',
};

export function SecurityLogsPanel({ onClose }: SecurityLogsPanelProps) {
  const [logs, setLogs] = useState(getSecurityLogs());
  const [filter, setFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getSecurityLogs());
  }, []);

  const filteredLogs = logs
    .filter(log => {
      if (selectedType && log.event !== selectedType) return false;
      if (filter) {
        const search = filter.toLowerCase();
        return (
          log.event.toLowerCase().includes(search) ||
          log.userId?.toLowerCase().includes(search) ||
          JSON.stringify(log.details).toLowerCase().includes(search)
        );
      }
      return true;
    })
    .reverse(); // Most recent first

  const handleClear = () => {
    clearSecurityLogs();
    setLogs([]);
    toast.success('Logs limpos');
  };

  const eventTypes = [...new Set(logs.map(l => l.event))];

  // Stats
  const totalLogs = logs.length;
  const failedLogins = logs.filter(l => l.event === 'LOGIN_FAILED').length;
  const rateLimits = logs.filter(l => l.event === 'RATE_LIMIT_HIT').length;
  const sanitized = logs.filter(l => l.event === 'MESSAGE_SANITIZED').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total de eventos" value={totalLogs} icon={Shield} color="text-primary" />
        <StatCard label="Logins falhos" value={failedLogins} icon={XCircle} color="text-destructive" />
        <StatCard label="Rate limits" value={rateLimits} icon={AlertTriangle} color="text-yellow-500" />
        <StatCard label="Msgs sanitizadas" value={sanitized} icon={MessageSquare} color="text-blue-500" />
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar nos logs..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="pl-10 bg-secondary/50"
        />
      </div>

      {/* Event type filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedType(null)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            !selectedType ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos
        </button>
        {eventTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(selectedType === type ? null : type)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {eventLabels[type] || type}
          </button>
        ))}
      </div>

      <Separator />

      {/* Log List */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhum log encontrado</p>
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              const Icon = eventIcons[log.event] || Shield;
              const color = eventColors[log.event] || 'text-muted-foreground';
              const date = new Date(log.timestamp);

              return (
                <motion.div
                  key={`${log.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {eventLabels[log.event] || log.event}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                    {log.userId && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate font-mono">
                        ID: {log.userId.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <Button variant="destructive" size="sm" className="w-full rounded-xl" onClick={handleClear}>
        <Trash2 className="h-3.5 w-3.5 mr-2" />
        Limpar todos os logs
      </Button>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-secondary/50 flex items-center gap-2.5">
      <Icon className={`h-5 w-5 ${color} shrink-0`} />
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
