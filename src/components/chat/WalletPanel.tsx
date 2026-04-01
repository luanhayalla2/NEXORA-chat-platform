import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUpRight, ArrowDownLeft, Copy, QrCode, RefreshCw,
  Bitcoin, Loader2, CheckCircle2, XCircle, Clock, ChevronLeft,
  Send, Download, Wallet as WalletIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface WalletData {
  id: string;
  balance_usd: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  to_address: string | null;
  from_address: string | null;
  status: string;
  description: string | null;
  created_at: string;
}

type WalletPage = 'main' | 'send' | 'receive' | 'deposit';

const CRYPTO_LIST = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'hsl(var(--primary))' },
  { id: 'TON', name: 'Toncoin', icon: '💎', color: 'hsl(210, 100%, 50%)' },
  { id: 'USDT', name: 'Tether', icon: '₮', color: 'hsl(150, 60%, 45%)' },
];

export function WalletPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<WalletPage>('main');

  // Send state
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState('BTC');
  const [sending, setSending] = useState(false);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const loadWallet = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    // Fetch or create wallet
    let { data: w } = await supabase
      .from('wallets')
      .select('id, balance_usd')
      .eq('user_id', user.id)
      .single();

    if (!w) {
      const { data: newW } = await supabase
        .from('wallets')
        .insert({ user_id: user.id, balance_usd: 0 })
        .select('id, balance_usd')
        .single();
      w = newW;
    }

    if (w) {
      setWallet(w as WalletData);

      // Fetch transactions
      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', w.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions((txns || []) as Transaction[]);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // Realtime transactions
  useEffect(() => {
    if (!wallet?.id) return;

    const channel = supabase
      .channel(`wallet_txns:${wallet.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `wallet_id=eq.${wallet.id}`,
      }, (payload) => {
        const newTx = payload.new as Transaction;
        setTransactions(prev => [newTx, ...prev]);
        loadWallet();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [wallet?.id, loadWallet]);

  const generateAddress = (currency: string) => {
    const chars = '0123456789abcdef';
    let addr = currency === 'BTC' ? 'bc1q' : currency === 'TON' ? 'EQ' : '0x';
    for (let i = 0; i < 32; i++) addr += chars[Math.floor(Math.random() * chars.length)];
    return addr;
  };

  const handleSend = async () => {
    if (!wallet || !sendAddress.trim() || !sendAmount.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (amount > wallet.balance_usd) {
      toast.error('Saldo insuficiente');
      return;
    }

    setSending(true);

    // Create transaction
    const { error: txErr } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'send',
        amount: -amount,
        currency: sendCurrency,
        to_address: sendAddress.trim(),
        status: 'completed',
        description: `Envio de ${amount} ${sendCurrency}`,
      });

    if (txErr) {
      toast.error('Erro ao enviar');
      setSending(false);
      return;
    }

    // Update balance
    await supabase
      .from('wallets')
      .update({ balance_usd: wallet.balance_usd - amount })
      .eq('id', wallet.id);

    toast.success(`${amount} ${sendCurrency} enviado com sucesso!`);
    setSendAddress('');
    setSendAmount('');
    setSending(false);
    setPage('main');
    loadWallet();
  };

  const handleDeposit = async () => {
    if (!wallet || !depositAmount.trim()) {
      toast.error('Informe o valor');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    setDepositing(true);

    const { error: txErr } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'deposit',
        amount,
        currency: 'USD',
        status: 'completed',
        description: `Depósito de $${amount.toFixed(2)}`,
      });

    if (txErr) {
      toast.error('Erro ao depositar');
      setDepositing(false);
      return;
    }

    await supabase
      .from('wallets')
      .update({ balance_usd: wallet.balance_usd + amount })
      .eq('id', wallet.id);

    toast.success(`$${amount.toFixed(2)} depositado com sucesso!`);
    setDepositAmount('');
    setDepositing(false);
    setPage('main');
    loadWallet();
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success('Endereço copiado!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="absolute inset-0 z-50 bg-card flex items-center justify-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  const renderSendPage = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Criptomoeda</label>
        <div className="flex gap-2">
          {CRYPTO_LIST.map(c => (
            <button
              key={c.id}
              onClick={() => setSendCurrency(c.id)}
              className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                sendCurrency === c.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-secondary'
              }`}
            >
              <span className="text-lg">{c.icon}</span>
              <span className="text-xs font-medium text-foreground">{c.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Endereço do destinatário</label>
        <Input
          value={sendAddress}
          onChange={e => setSendAddress(e.target.value)}
          placeholder="bc1q... ou EQ... ou 0x..."
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Valor (USD)</label>
        <Input
          type="number"
          value={sendAmount}
          onChange={e => setSendAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        <p className="text-xs text-muted-foreground">
          Saldo disponível: ${wallet?.balance_usd.toFixed(2) || '0.00'}
        </p>
      </div>

      <Button onClick={handleSend} disabled={sending} className="w-full rounded-xl">
        {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
        {sending ? 'Enviando...' : 'Enviar'}
      </Button>
    </div>
  );

  const renderReceivePage = () => {
    const addresses = CRYPTO_LIST.map(c => ({
      ...c,
      address: generateAddress(c.id),
    }));

    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          Compartilhe seu endereço para receber criptomoedas
        </p>

        {addresses.map(c => (
          <div key={c.id} className="p-3 rounded-xl bg-secondary/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{c.icon}</span>
              <span className="text-sm font-medium text-foreground">{c.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[10px] text-muted-foreground font-mono break-all bg-background p-2 rounded-lg">
                {c.address}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => copyAddress(c.address)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-center">
          <div className="h-32 w-32 rounded-xl bg-secondary flex items-center justify-center">
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Escaneie o QR Code para receber
        </p>
      </div>
    );
  };

  const renderDepositPage = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-primary/10 text-center">
        <WalletIcon className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">Depositar fundos</p>
        <p className="text-xs text-muted-foreground">Adicione saldo à sua carteira NEXORA</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Valor (USD)</label>
        <Input
          type="number"
          value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[10, 50, 100].map(v => (
          <Button
            key={v}
            variant="outline"
            className="rounded-xl"
            onClick={() => setDepositAmount(v.toString())}
          >
            ${v}
          </Button>
        ))}
      </div>

      <Button onClick={handleDeposit} disabled={depositing} className="w-full rounded-xl">
        {depositing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
        {depositing ? 'Depositando...' : 'Depositar'}
      </Button>
    </div>
  );

  const renderMainPage = () => (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">SALDO ATUAL</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            ${wallet?.balance_usd.toFixed(2) || '0.00'}
          </span>
          <span className="text-sm text-muted-foreground">USD</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="flex flex-col items-center gap-1.5 h-auto py-3 rounded-xl"
          onClick={() => setPage('send')}
        >
          <ArrowUpRight className="h-5 w-5 text-destructive" />
          <span className="text-xs">Enviar</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-1.5 h-auto py-3 rounded-xl"
          onClick={() => setPage('receive')}
        >
          <ArrowDownLeft className="h-5 w-5 text-green-500" />
          <span className="text-xs">Receber</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-1.5 h-auto py-3 rounded-xl"
          onClick={() => setPage('deposit')}
        >
          <Download className="h-5 w-5 text-primary" />
          <span className="text-xs">Depositar</span>
        </Button>
      </div>

      {/* Crypto List */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Criptomoedas</p>
        <div className="space-y-1">
          {CRYPTO_LIST.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors">
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${c.color}20` }}>
                {c.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.id}</p>
              </div>
              <p className="text-sm font-medium text-foreground">$0.00</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Histórico</p>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={loadWallet}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Atualizar
          </Button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <WalletIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma transação</p>
            <p className="text-xs text-muted-foreground">Deposite fundos para começar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  tx.type === 'send' ? 'bg-destructive/10' : 'bg-green-500/10'
                }`}>
                  {tx.type === 'send'
                    ? <ArrowUpRight className="h-4 w-4 text-destructive" />
                    : <ArrowDownLeft className="h-4 w-4 text-green-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.description || (tx.type === 'send' ? 'Enviado' : tx.type === 'deposit' ? 'Depósito' : 'Recebido')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-semibold ${tx.amount < 0 ? 'text-destructive' : 'text-green-500'}`}>
                    {tx.amount < 0 ? '' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  {getStatusIcon(tx.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const pageTitle = page === 'main' ? 'Carteira' : page === 'send' ? 'Enviar' : page === 'receive' ? 'Receber' : 'Depositar';

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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => page === 'main' ? onClose() : setPage('main')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <WalletIcon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">{pageTitle}</h3>
        </div>
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
            {page === 'main' && renderMainPage()}
            {page === 'send' && renderSendPage()}
            {page === 'receive' && renderReceivePage()}
            {page === 'deposit' && renderDepositPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
