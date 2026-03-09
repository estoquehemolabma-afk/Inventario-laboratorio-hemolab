import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, KeyRound } from 'lucide-react';
import { formatPhone } from '@/lib/phoneMask';
import logoGota from '@/assets/logogota.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, isAdmin, roleLoaded, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!authLoading && user && roleLoaded) {
      if (isAdmin) {
        navigate('/');
      } else {
        navigate('/solicitar-suporte');
      }
    }
  }, [user, isAdmin, roleLoaded, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Credenciais inválidas',
            description: error.message.includes('Invalid login credentials')
              ? 'E-mail ou senha incorretos.'
              : error.message,
            variant: 'destructive',
          });
          return;
        }
        toast({ title: 'Login realizado com sucesso!' });
        // Navigation handled by useEffect after role loads
      } else {
        if (!fullName.trim()) {
          toast({ title: 'Nome obrigatório', description: 'Informe seu nome completo.', variant: 'destructive' });
          return;
        }

        // Validate invite code via DB function
        const { data: isValid, error: codeError } = await supabase.rpc('validate_invite_code', { input_code: inviteCode });

        if (codeError || !isValid) {
          toast({ title: 'Código inválido', description: 'O código de convite informado não é válido.', variant: 'destructive' });
          return;
        }

        // Sign up with all UBS (admin has access to all)
        const { data: ubsData } = await supabase.from('ubs').select('name').order('name');
        const allUbsNames = ubsData?.map(u => u.name) || [];

        const { error } = await signUp(email, password, fullName, phone, allUbsNames);
        if (error) {
          toast({
            title: error.message.includes('already registered') ? 'E-mail já cadastrado' : 'Erro ao cadastrar',
            description: error.message.includes('already registered') ? 'Use outro e-mail ou faça login.' : error.message,
            variant: 'destructive',
          });
          return;
        }

        // Wait briefly for the user to be created, then assign admin role
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          await supabase.rpc('assign_admin_role', { target_user_id: sessionData.session.user.id });
        }

        toast({ title: 'Cadastro realizado!', description: 'Verifique seu e-mail para confirmar a conta.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoGota} alt="Hemolab Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-display font-bold">Inventário Hemolab</h1>
          <p className="text-muted-foreground">Acesso administrativo ao sistema</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Criar Conta Admin'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Acesse o painel de gerenciamento do inventário'
                : 'Cadastre-se com um código de convite'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Código de Convite *</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="inviteCode"
                        type="text"
                        placeholder="Digite o código de convite"
                        className="pl-10"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gradient-primary text-white border-0" disabled={loading}>
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? 'Não tem conta? Cadastre-se com código de convite' : 'Já tem conta? Entrar'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
