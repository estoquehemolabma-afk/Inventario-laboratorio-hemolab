import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, Clock, CheckCircle2, Wrench, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  SupportRequest,
  SupportStatus,
  supportStatusLabels,
  supportTypeLabels,
  supportPriorityLabels,
  supportStatusColors,
  supportPriorityColors
} from '@/types/support';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusSteps: { status: SupportStatus; icon: React.ElementType; label: string }[] = [
  { status: 'recebido', icon: Clock, label: 'Recebido' },
  { status: 'em_andamento', icon: Wrench, label: 'Em Andamento' },
  { status: 'resolvido', icon: CheckCircle2, label: 'Resolvido' },
];

const AcompanharSuportePage: React.FC = () => {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const [searchCode, setSearchCode] = useState(trackingCode || '');
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!trackingCode);

  const fetchRequest = async (code: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('tracking_code', code.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      setRequest(data as unknown as SupportRequest | null);
    } catch (error) {
      console.error('Error fetching request:', error);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingCode) {
      fetchRequest(trackingCode);
    }
  }, [trackingCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      fetchRequest(searchCode.trim());
    }
  };

  const getStatusIndex = (status: SupportStatus) => {
    if (status === 'cancelado') return -1;
    return statusSteps.findIndex(s => s.status === status);
  };

  const currentStepIndex = request ? getStatusIndex(request.status) : -1;

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
            <p className="text-xs text-muted-foreground">Acompanhamento de Suporte</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Acompanhar Solicitação</CardTitle>
              <CardDescription>
                Digite o código de acompanhamento para verificar o status da sua solicitação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Ex: SUP-20241231-ABC123"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="flex-1 font-mono"
                />
                <Button type="submit" disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-4">Buscando solicitação...</p>
          </div>
        )}

        {/* Not Found */}
        {!loading && searched && !request && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Solicitação não encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Verifique se o código está correto e tente novamente.
                </p>
                <Link to="/solicitar-suporte">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Fazer nova solicitação
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Request Details */}
        {!loading && request && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Timeline */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="font-mono">{request.tracking_code}</span>
                    </CardTitle>
                    <CardDescription>
                      Criado em {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <Badge className={supportStatusColors[request.status]}>
                    {supportStatusLabels[request.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {request.status === 'cancelado' ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                    <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400 font-medium">Solicitação Cancelada</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <React.Fragment key={step.status}>
                          <div className="flex flex-col items-center">
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: isCurrent ? 1.1 : 1 }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                                } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                            >
                              <Icon className="w-6 h-6" />
                            </motion.div>
                            <span className={`mt-2 text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                              {step.label}
                            </span>
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`flex-1 h-1 mx-4 rounded ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                              }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Request Info */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Detalhes da Solicitação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Unidade</p>
                    <p className="font-medium">{request.ubs_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{request.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{supportTypeLabels[request.request_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prioridade</p>
                    <Badge className={supportPriorityColors[request.priority]}>
                      {supportPriorityLabels[request.priority]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solicitante</p>
                    <p className="font-medium">{request.requester_name}</p>
                  </div>
                  {request.equipment_info && (
                    <div>
                      <p className="text-sm text-muted-foreground">Equipamento</p>
                      <p className="font-medium">{request.equipment_info}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descrição do Problema</p>
                  <p className="bg-muted/50 rounded-lg p-3">{request.description}</p>
                </div>

                {request.resolution_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notas de Resolução</p>
                    <p className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-300">
                      {request.resolution_notes}
                    </p>
                  </div>
                )}

                {request.resolved_at && (
                  <div className="text-sm text-muted-foreground">
                    Resolvido em {format(new Date(request.resolved_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center">
              <Link to="/solicitar-suporte">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Fazer nova solicitação
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AcompanharSuportePage;
