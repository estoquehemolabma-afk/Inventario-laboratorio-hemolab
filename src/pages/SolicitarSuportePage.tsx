import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Send, CheckCircle, Copy, ExternalLink, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  ubs_name: z.string().min(1, 'Selecione a unidade'),
  location: z.string().min(2, 'Local é obrigatório').max(100),
  description: z.string().min(10, 'Descreva o problema com pelo menos 10 caracteres').max(1000),
  equipment_info: z.string().optional().or(z.literal('')),
  request_type: z.string().min(1, 'Selecione o tipo de problema'),
});

type FormData = z.infer<typeof formSchema>;

import { useInventory } from '@/contexts/InventoryContext';

const SolicitarSuportePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { getEquipmentByUBS, equipmentList, ubsList } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [ubsEquipments, setUbsEquipments] = useState<any[]>([]);

  useEffect(() => { if (!authLoading && !user) navigate('/auth'); }, [user, authLoading, navigate]);

  const userUbsList = profile?.ubs_name || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ubs_name: userUbsList.length === 1 ? userUbsList[0] : '', location: '', description: '', equipment_info: '', request_type: '' },
  });

  useEffect(() => { if (userUbsList.length === 1) form.setValue('ubs_name', userUbsList[0]); }, [profile, form, userUbsList]);

  // When UBS changes, load its equipment
  const selectedUbsName = form.watch('ubs_name');
  useEffect(() => {
    if (selectedUbsName) {
      // Find UBS id by name
      const ubs = ubsList.find(u => u.name === selectedUbsName);
      if (ubs) {
        const eqs = equipmentList.filter(e => e.ubsId === ubs.id && e.isActive);
        setUbsEquipments(eqs);
      } else {
        setUbsEquipments([]);
      }
      // Reset equipment selection when UBS changes
      form.setValue('equipment_info', '');
      form.setValue('location', '');
      form.setValue('request_type', '');
    } else {
      setUbsEquipments([]);
    }
  }, [selectedUbsName, ubsList, equipmentList]);

  // When equipment is selected, auto-fill location and group
  const selectedEquipmentInfo = form.watch('equipment_info');
  useEffect(() => {
    if (selectedEquipmentInfo && selectedEquipmentInfo !== 'Outro (Não listado)') {
      const eq = ubsEquipments.find(e => `${e.brand} ${e.model} - PAT: ${e.patrimonyNumber}` === selectedEquipmentInfo);
      if (eq) {
        form.setValue('location', eq.location || '');
        form.setValue('request_type', eq.type || '');
      }
    }
  }, [selectedEquipmentInfo, ubsEquipments]);

  const onSubmit = async (data: FormData) => {
    if (!profile) return;
    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase
        .from('support_requests')
        .insert({
          ubs_name: data.ubs_name, requester_name: profile.full_name,
          requester_email: profile.email, requester_phone: profile.phone,
          location: data.location, description: data.description,
          equipment_info: data.equipment_info || null,
          request_type: data.request_type,
          status: 'recebido',
          priority: 'media'
        } as any)
        .select('tracking_code').single();
      if (error) throw error;
      setSubmittedCode(result.tracking_code);
      toast({ title: 'Solicitação enviada!', description: 'Sua solicitação foi registrada com sucesso.' });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({ title: 'Erro ao enviar', description: 'Não foi possível enviar sua solicitação.', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const copyTrackingCode = () => { if (submittedCode) { navigator.clipboard.writeText(submittedCode); toast({ title: 'Código copiado!' }); } };
  const trackingUrl = submittedCode ? `${window.location.origin}/acompanhar-suporte/${submittedCode}` : '';
  const copyTrackingUrl = () => { if (trackingUrl) { navigator.clipboard.writeText(trackingUrl); toast({ title: 'Link copiado!' }); } };
  const handleSignOut = async () => { await signOut(); navigate('/auth'); };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user || !profile) return null;

  if (submittedCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <CardTitle className="text-2xl">Solicitação Enviada!</CardTitle>
              <CardDescription>Guarde o código abaixo para acompanhar o status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Código de Acompanhamento</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold text-primary">{submittedCode}</span>
                  <Button variant="ghost" size="icon" onClick={copyTrackingCode}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Link de Acompanhamento</p>
                <div className="flex items-center gap-2">
                  <Input value={trackingUrl} readOnly className="text-xs" />
                  <Button variant="ghost" size="icon" onClick={copyTrackingUrl}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setSubmittedCode(null); form.reset({ ubs_name: userUbsList.length === 1 ? userUbsList[0] : '', location: '', description: '', equipment_info: '' }); }}>
                  Nova Solicitação
                </Button>
                <Button className="flex-1" onClick={() => window.open(trackingUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" /> Acompanhar
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
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Inventário</h1>
              <p className="text-xs text-muted-foreground">Solicitação de Suporte</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-muted-foreground" /><span className="hidden sm:inline">{profile.full_name}</span></div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Nova Solicitação de Suporte</CardTitle>
              <CardDescription>Solicitante: <strong>{profile.full_name}</strong> ({profile.email})</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Informações da Unidade</h3>
                    <FormField control={form.control} name="ubs_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Unidade *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger></FormControl>
                          <SelectContent className="max-h-[300px]">
                            {userUbsList.map((ubs) => (<SelectItem key={ubs} value={ubs}>{ubs}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                    <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Detalhes do Problema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUbsName && (
                        <FormField control={form.control} name="equipment_info" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipamento da Unidade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione um equipamento" /></SelectTrigger></FormControl>
                              <SelectContent className="max-h-[300px]">
                                {ubsEquipments.map((eq) => (
                                  <SelectItem key={eq.id} value={`${eq.brand} ${eq.model} - PAT: ${eq.patrimonyNumber}`}>
                                    {eq.type}: {eq.brand} {eq.model} (Pat: {eq.patrimonyNumber})
                                  </SelectItem>
                                ))}
                                <SelectItem value="Outro (Não listado)">Outro (Não listado / Sem patrimônio)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}

                      <FormField control={form.control} name="request_type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o grupo" /></SelectTrigger></FormControl>
                            <SelectContent className="max-h-[300px]">
                              <SelectItem value="Imóvel">Imóvel</SelectItem>
                              <SelectItem value="Escritório">Escritório</SelectItem>
                              <SelectItem value="Veículos">Veículos</SelectItem>
                              <SelectItem value="Material Técnico">Material Técnico</SelectItem>
                              <SelectItem value="Eletro">Eletro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento/Setor *</FormLabel>
                          <FormControl><Input placeholder="Ex: Recepção, Sala 1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Descrição do Problema *</FormLabel><FormControl><Textarea placeholder="Descreva detalhadamente o problema..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" /> Enviar Solicitação</>}
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
