import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateTOTPSecret, verifyTOTP, generateOTPAuthURI } from '@/lib/totp';
import { logSecurityEvent } from '@/lib/securityLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TwoFactorSetupProps {
  onClose: () => void;
}

const TOTP_STORAGE_KEY = 'nexora_2fa_secret';
const TOTP_ENABLED_KEY = 'nexora_2fa_enabled';

export function TwoFactorSetup({ onClose }: TwoFactorSetupProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'disable'>('status');
  const [secret, setSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const enabled = localStorage.getItem(TOTP_ENABLED_KEY) === 'true';
    setIsEnabled(enabled);
  }, []);

  const handleStartSetup = () => {
    const newSecret = generateTOTPSecret();
    setSecret(newSecret);
    setStep('setup');
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Chave copiada!');
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const valid = await verifyTOTP(secret, otpCode);
      if (valid) {
        localStorage.setItem(TOTP_STORAGE_KEY, secret);
        localStorage.setItem(TOTP_ENABLED_KEY, 'true');
        setIsEnabled(true);
        setStep('status');
        logSecurityEvent('PROFILE_UPDATED', user?.id, { action: '2fa_enabled' });
        toast.success('2FA ativado com sucesso!');
      } else {
        setError('Código inválido. Tente novamente.');
        logSecurityEvent('LOGIN_FAILED', user?.id, { reason: '2fa_invalid_code' });
      }
    } catch {
      setError('Erro ao verificar código');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable = async () => {
    setIsVerifying(true);
    setError('');

    const storedSecret = localStorage.getItem(TOTP_STORAGE_KEY);
    if (!storedSecret) {
      localStorage.removeItem(TOTP_ENABLED_KEY);
      setIsEnabled(false);
      setStep('status');
      return;
    }

    try {
      const valid = await verifyTOTP(storedSecret, otpCode);
      if (valid) {
        localStorage.removeItem(TOTP_STORAGE_KEY);
        localStorage.removeItem(TOTP_ENABLED_KEY);
        setIsEnabled(false);
        setStep('status');
        logSecurityEvent('PROFILE_UPDATED', user?.id, { action: '2fa_disabled' });
        toast.success('2FA desativado');
      } else {
        setError('Código inválido');
      }
    } catch {
      setError('Erro ao verificar');
    } finally {
      setIsVerifying(false);
    }
  };

  const otpauthURI = secret && user?.email
    ? generateOTPAuthURI(secret, user.email)
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <AnimatePresence mode="wait">
        {step === 'status' && (
          <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
              {isEnabled ? (
                <ShieldCheck className="h-10 w-10 text-green-500 shrink-0" />
              ) : (
                <ShieldOff className="h-10 w-10 text-destructive shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isEnabled ? '2FA Ativado' : '2FA Desativado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isEnabled
                    ? 'Sua conta está protegida com autenticação de dois fatores'
                    : 'Adicione uma camada extra de segurança à sua conta'}
                </p>
              </div>
            </div>

            {isEnabled ? (
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                onClick={() => { setOtpCode(''); setError(''); setStep('disable'); }}
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Desativar 2FA
              </Button>
            ) : (
              <Button
                className="w-full rounded-xl"
                onClick={handleStartSetup}
              >
                <Shield className="h-4 w-4 mr-2" />
                Ativar 2FA
              </Button>
            )}
          </motion.div>
        )}

        {step === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Configurar Google Authenticator</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1. Abra o Google Authenticator no seu celular<br />
                    2. Toque em "+" e selecione "Inserir chave de configuração"<br />
                    3. Cole a chave abaixo
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Sua chave secreta</label>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-xs bg-secondary/50"
                />
                <Button variant="outline" size="icon" onClick={handleCopySecret} className="shrink-0">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {otpauthURI && (
              <div className="p-3 rounded-xl bg-background border border-border text-center">
                <p className="text-xs text-muted-foreground mb-2">Ou escaneie o QR Code:</p>
                <div className="inline-block p-3 bg-white rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthURI)}`}
                    alt="QR Code 2FA"
                    className="w-44 h-44"
                  />
                </div>
              </div>
            )}

            <Button className="w-full rounded-xl" onClick={() => { setOtpCode(''); setError(''); setStep('verify'); }}>
              Próximo - Verificar código
            </Button>
          </motion.div>
        )}

        {(step === 'verify' || step === 'disable') && (
          <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm font-semibold text-foreground">
                {step === 'verify' ? 'Verificar código' : 'Confirmar desativação'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Digite o código de 6 dígitos do Google Authenticator
              </p>
            </div>

            <div className="space-y-2">
              <Input
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-[0.5em] h-14"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              className="w-full rounded-xl"
              onClick={step === 'verify' ? handleVerify : handleDisable}
              disabled={otpCode.length !== 6 || isVerifying}
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {step === 'verify' ? 'Ativar 2FA' : 'Desativar 2FA'}
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => setStep(step === 'verify' ? 'setup' : 'status')}>
              Voltar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
