import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Calendar, TrendingUp, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours, differenceInDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface SupportRequest {
  id: string;
  tracking_code: string;
  ubs_name: string;
  status: string;
  priority: string;
  request_type: string;
  created_at: string;
  resolved_at: string | null;
  updated_at: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = {
  recebido: '#3b82f6',
  em_andamento: '#f59e0b',
  resolvido: '#10b981',
  cancelado: '#ef4444',
};

const RelatoriosSuportePage: React.FC = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequests(data as SupportRequest[]);
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'month') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === 'last3months') {
      startDate = startOfMonth(subMonths(now, 2));
      endDate = endOfMonth(now);
    } else {
      startDate = startOfYear(new Date(parseInt(selectedYear), 0, 1));
      endDate = endOfYear(new Date(parseInt(selectedYear), 0, 1));
    }

    return requests.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= startDate && createdAt <= endDate;
    });
  }, [requests, period, selectedYear]);

  const stats = useMemo(() => {
    const resolved = filteredRequests.filter(r => r.status === 'resolvido' && r.resolved_at);
    
    const resolutionTimes = resolved.map(r => {
      const created = new Date(r.created_at);
      const resolvedAt = new Date(r.resolved_at!);
      return differenceInHours(resolvedAt, created);
    });

    const avgResolutionHours = resolutionTimes.length > 0 
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
      : 0;

    const avgResolutionDays = Math.round(avgResolutionHours / 24 * 10) / 10;

    return {
      total: filteredRequests.length,
      resolved: resolved.length,
      pending: filteredRequests.filter(r => r.status === 'recebido').length,
      inProgress: filteredRequests.filter(r => r.status === 'em_andamento').length,
      cancelled: filteredRequests.filter(r => r.status === 'cancelado').length,
      avgResolutionHours,
      avgResolutionDays,
      resolutionRate: filteredRequests.length > 0 
        ? Math.round((resolved.length / filteredRequests.length) * 100) 
        : 0,
    };
  }, [filteredRequests]);

  const statusData = useMemo(() => [
    { name: 'Recebido', value: stats.pending, color: STATUS_COLORS.recebido },
    { name: 'Em Andamento', value: stats.inProgress, color: STATUS_COLORS.em_andamento },
    { name: 'Resolvido', value: stats.resolved, color: STATUS_COLORS.resolvido },
    { name: 'Cancelado', value: stats.cancelled, color: STATUS_COLORS.cancelado },
  ].filter(s => s.value > 0), [stats]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRequests.forEach(r => {
      counts[r.request_type] = (counts[r.request_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      quantidade: count,
    }));
  }, [filteredRequests]);

  const ubsData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRequests.forEach(r => {
      const shortName = r.ubs_name.length > 30 ? r.ubs_name.substring(0, 27) + '...' : r.ubs_name;
      counts[shortName] = (counts[shortName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([ubs, count]) => ({ name: ubs, chamados: count }))
      .sort((a, b) => b.chamados - a.chamados)
      .slice(0, 10);
  }, [filteredRequests]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { total: number; resolvidos: number }> = {};
    
    requests.forEach(r => {
      const date = new Date(r.created_at);
      const year = date.getFullYear();
      if (period === 'year' && year.toString() !== selectedYear) return;
      
      const monthKey = format(date, 'MMM/yy', { locale: ptBR });
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, resolvidos: 0 };
      }
      months[monthKey].total++;
      if (r.status === 'resolvido') {
        months[monthKey].resolvidos++;
      }
    });

    return Object.entries(months)
      .map(([month, data]) => ({ name: month, ...data }))
      .slice(-12);
  }, [requests, period, selectedYear]);

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRequests.forEach(r => {
      counts[r.priority] = (counts[r.priority] || 0) + 1;
    });
    const priorityLabels: Record<string, string> = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return Object.entries(counts).map(([priority, count]) => ({
      name: priorityLabels[priority] || priority,
      value: count,
    }));
  }, [filteredRequests]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary" />
              Relatórios de Suporte
            </h1>
            <p className="text-muted-foreground">
              Análise de chamados técnicos e tempo de resolução
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês Atual</SelectItem>
                <SelectItem value="last3months">Últimos 3 Meses</SelectItem>
                <SelectItem value="year">Ano Completo</SelectItem>
              </SelectContent>
            </Select>

            {period === 'year' && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Chamados</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
                    <p className="text-3xl font-bold text-green-600">{stats.resolutionRate}%</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Médio Resolução</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {stats.avgResolutionDays > 1 ? `${stats.avgResolutionDays}d` : `${stats.avgResolutionHours}h`}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Andamento</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.inProgress + stats.pending}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chamados por Status</CardTitle>
                <CardDescription>Distribuição atual dos chamados</CardDescription>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    Sem dados para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chamados por Tipo</CardTitle>
                <CardDescription>Categorias mais frequentes</CardDescription>
              </CardHeader>
              <CardContent>
                {typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={typeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    Sem dados para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolução Mensal</CardTitle>
                <CardDescription>Chamados abertos vs resolvidos por mês</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolvidos" name="Resolvidos" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    Sem dados para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chamados por Prioridade</CardTitle>
                <CardDescription>Distribuição por nível de urgência</CardDescription>
              </CardHeader>
              <CardContent>
                {priorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    Sem dados para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top UBS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Unidades com mais Chamados</CardTitle>
              <CardDescription>Unidades com maior demanda de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              {ubsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ubsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="chamados" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Sem dados para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default RelatoriosSuportePage;