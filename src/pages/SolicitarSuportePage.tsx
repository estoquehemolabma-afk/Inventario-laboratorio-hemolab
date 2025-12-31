import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Send, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supportTypeLabels, supportPriorityLabels } from '@/types/support';

const formSchema = z.object({
  ubs_name: z.string().min(2, 'Nome da UBS é obrigatório').max(100),
  requester_name: z.string().min(2, 'Nome é obrigatório').max(100),
  requester_email: z.string().email('Email inválido').optional().or(z.literal('')),
  requester_phone: z.string().max(20).optional().or(z.literal('')),
  request_type: z.enum(['hardware', 'software', 'rede', 'impressora', 'outros']),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']),
  location: z.string().min(2, 'Local é obrigatório').max(100),
  description: z.string().min(10, 'Descreva o problema com pelo menos 10 caracteres').max(1000),
  equipment_info: z.string().max(500).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

const SolicitarSuportePage: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ubs_name: '',
      requester_name: '',
      requester_email: '',
      requester_phone: '',
      request_type: 'outros',
      priority: 'media',
      location: '',
      description: '',
      equipment_info: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const insertData = {
        ubs_name: data.ubs_name,
        requester_name: data.requester_name,
        requester_email: data.requester_email || null,
        requester_phone: data.requester_phone || null,
        request_type: data.request_type,
        priority: data.priority,
        location: data.location,
        description: data.description,
        equipment_info: data.equipment_info || null,
      };

      const { data: result, error } = await supabase
        .from('support_requests')
        .insert(insertData as any)
        .select('tracking_code')
        .single();

      if (error) throw error;

      setSubmittedCode(result.tracking_code);
      toast({
        title: 'Solicitação enviada!',
        description: 'Sua solicitação foi registrada com sucesso.',
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar sua solicitação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTrackingCode = () => {
    if (submittedCode) {
      navigator.clipboard.writeText(submittedCode);
      toast({ title: 'Código copiado!' });
    }
  };

  const trackingUrl = submittedCode ? `${window.location.origin}/acompanhar-suporte/${submittedCode}` : '';

  const copyTrackingUrl = () => {
    if (trackingUrl) {
      navigator.clipboard.writeText(trackingUrl);
      toast({ title: 'Link copiado!' });
    }
  };

  if (submittedCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <CardTitle className="text-2xl">Solicitação Enviada!</CardTitle>
              <CardDescription>
                Sua solicitação foi registrada com sucesso. Guarde o código abaixo para acompanhar o status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Código de Acompanhamento</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold text-primary">{submittedCode}</span>
                  <Button variant="ghost" size="icon" onClick={copyTrackingCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Link de Acompanhamento</p>
                <div className="flex items-center gap-2">
                  <Input value={trackingUrl} readOnly className="text-xs" />
                  <Button variant="ghost" size="icon" onClick={copyTrackingUrl}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSubmittedCode(null);
                    form.reset();
                  }}
                >
                  Nova Solicitação
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.open(trackingUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acompanhar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">TI Saúde</h1>
            <p className="text-xs text-muted-foreground">Solicitação de Suporte</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Nova Solicitação de Suporte</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo para solicitar suporte técnico. Após o envio, você receberá um código para acompanhar o status da sua solicitação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Informações da UBS */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Informações da Unidade</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ubs_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da UBS *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: UBS Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local/Setor *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Recepção, Consultório 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Informações do Solicitante */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Informações do Solicitante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="requester_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="requester_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="requester_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Detalhes do Problema */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Detalhes do Problema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="request_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Problema *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(supportTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(supportPriorityLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="equipment_info"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informações do Equipamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: PC da recepção, Patrimônio 12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Problema *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva detalhadamente o problema que está enfrentando..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Solicitação
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default SolicitarSuportePage;
