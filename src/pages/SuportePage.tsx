import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, ExternalLink, MessageSquare } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/contexts/InventoryContext';
import { supabase } from '@/integrations/supabase/client';
import {
  SupportRequest,
  SupportStatus,
  SupportType,
  SupportPriority,
  supportStatusLabels,
  supportPriorityLabels,
  supportStatusColors,
  supportPriorityColors
} from '@/types/support';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SuportePage: React.FC = () => {
  const { toast } = useToast();
  const { equipmentTypes } = useInventory();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<SupportStatus>('recebido');
  const [newPriority, setNewPriority] = useState<SupportPriority>('media');
  const [newType, setNewType] = useState<string>('outros');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as unknown as SupportRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as solicitações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openUpdateDialog = (request: SupportRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setNewPriority(request.priority);
    setNewType(request.request_type);
    setResolutionNotes(request.resolution_notes || '');
    setIsDialogOpen(true);
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    setUpdating(true);
    try {
      console.log('Updating request:', selectedRequest.id, {
        status: newStatus,
        priority: newPriority,
        request_type: newType,
      });

      const { data, error } = await supabase
        .from('support_requests')
        .update({
          status: newStatus,
          priority: newPriority,
          request_type: newType as any,
          resolution_notes: resolutionNotes || null,
        })
        .eq('id', selectedRequest.id)
        .select();

      console.log('Update result:', { data, error });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Nenhum registro foi atualizado');
      }

      toast({ title: 'Solicitação atualizada!' });
      setIsDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.ubs_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: requests.length,
    recebido: requests.filter(r => r.status === 'recebido').length,
    em_andamento: requests.filter(r => r.status === 'em_andamento').length,
    resolvido: requests.filter(r => r.status === 'resolvido').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Solicitações de Suporte
            </h1>
            <p className="text-muted-foreground">
              Gerencie as demandas de suporte técnico
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchRequests} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const url = `${window.location.origin}/solicitar-suporte`;
                navigator.clipboard.writeText(url);
                toast({ title: 'Link copiado!' });
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Copiar Link do Formulário
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-400">{stats.recebido}</div>
              <div className="text-sm text-blue-400/80">Recebidos</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.em_andamento}</div>
              <div className="text-sm text-yellow-400/80">Em Andamento</div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/30 bg-emerald-500/10">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-emerald-400">{stats.resolvido}</div>
              <div className="text-sm text-emerald-400/80">Resolvidos</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, unidade, solicitante..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(supportStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table/Cards View */}
        <div className="grid md:hidden grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border/50">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            filteredRequests.map(request => (
              <Card key={request.id} className="border-border/50 bg-card/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground block">{request.tracking_code}</span>
                      <strong className="text-sm block">{request.ubs_name}</strong>
                    </div>
                    <Badge className={supportStatusColors[request.status]}>
                      {supportStatusLabels[request.status]}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Requisitante:</span> {request.requester_name}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tipo:</span> {request.request_type}
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openUpdateDialog(request)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="hidden md:block border-border/50 bg-card/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma solicitação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">{request.tracking_code}</TableCell>
                      <TableCell>{request.ubs_name}</TableCell>
                      <TableCell>{request.requester_name}</TableCell>
                      <TableCell>{request.request_type}</TableCell>
                      <TableCell>
                        <Badge className={supportPriorityColors[request.priority]}>
                          {supportPriorityLabels[request.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={supportStatusColors[request.status]}>
                          {supportStatusLabels[request.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUpdateDialog(request)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Gerenciar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Solicitação</DialogTitle>
            <DialogDescription>
              {selectedRequest?.tracking_code} - {selectedRequest?.ubs_name}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as SupportStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={newPriority} onValueChange={(v) => setNewPriority(v as SupportPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportPriorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="Sistema/Software">Sistema/Software</SelectItem>
                      <SelectItem value="Rede/Internet">Rede/Internet</SelectItem>
                      {equipmentTypes.map(type => (
                        <SelectItem key={`type-${type}`} value={type}>{type}</SelectItem>
                      ))}
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas de Resolução</Label>
                <Textarea
                  placeholder="Descreva as ações tomadas ou informações relevantes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateRequest} disabled={updating}>
                  {updating ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SuportePage;
