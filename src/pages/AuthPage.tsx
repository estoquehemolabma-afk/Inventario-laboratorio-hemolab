import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, Phone, ArrowLeft, Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedUbs, setSelectedUbs] = useState<string[]>([]);

  const [dynamicUbsList, setDynamicUbsList] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/solicitar-suporte');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only fetch UBS list if the user is on the signup form
    if (!isLogin) {
      const fetchUbs = async () => {
        const { data } = await supabase.from('ubs').select('name').order('name');
        if (data) {
          setDynamicUbsList(data.map(u => u.name));
        }
      };
      fetchUbs();
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Credenciais inválidas',
              description: 'E-mail ou senha incorretos.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao entrar',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }
        toast({ title: 'Login realizado com sucesso!' });
        navigate('/solicitar-suporte');
      } else {
        if (!fullName.trim()) {
          toast({
            title: 'Nome obrigatório',
            description: 'Informe seu nome completo.',
            variant: 'destructive',
          });
          return;
        }

        if (selectedUbs.length === 0) {
          toast({
            title: 'UBS obrigatória',
            description: 'Selecione pelo menos uma Unidade de Saúde.',
            variant: 'destructive',
          });
          return;
        }

        const { error } = await signUp(email, password, fullName, phone, selectedUbs);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'E-mail já cadastrado',
              description: 'Use outro e-mail ou faça login.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao cadastrar',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }
        toast({
          title: 'Cadastro realizado!',
          description: 'Você já pode solicitar suporte.',
        });
        navigate('/solicitar-suporte');
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
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold">Chamados Hemolab</h1>
          <p className="text-muted-foreground">Sistema de Chamados e Suporte</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Acesse sua conta para solicitar suporte'
                : 'Cadastre-se para acessar o sistema'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
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
                  <div className="space-y-2">
                    <Label htmlFor="ubs">Unidades * <span className="text-xs text-muted-foreground">(pode selecionar várias)</span></Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (!selectedUbs.includes(value)) {
                            setSelectedUbs([...selectedUbs, value]);
                          }
                        }}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {dynamicUbsList.filter(ubs => !selectedUbs.includes(ubs)).map((ubs) => (
                            <SelectItem key={ubs} value={ubs}>
                              {ubs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedUbs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUbs.map((ubs) => (
                          <Badge
                            key={ubs}
                            variant="secondary"
                            className="flex items-center gap-1 text-xs"
                          >
                            {ubs.length > 30 ? ubs.substring(0, 27) + '...' : ubs}
                            <button
                              type="button"
                              onClick={() => setSelectedUbs(selectedUbs.filter(u => u !== ubs))}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
