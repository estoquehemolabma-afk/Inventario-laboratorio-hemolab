import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Shield, Headphones, RefreshCw, Search, Pencil } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPhone } from '@/lib/phoneMask';
import { useInventory } from '@/contexts/InventoryContext';
import { X } from 'lucide-react';

interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  ubs_name: string[];
  roles: string[];
  created_at: string;
}

const UsuariosPage: React.FC = () => {
  const { toast } = useToast();
  const { ubsList } = useInventory();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<string>('user');
  const [newUbsName, setNewUbsName] = useState<string>('');

  // Edit form state
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<string>('user');
  const [editUbsName, setEditUbsName] = useState<string>('');
  const [editPassword, setEditPassword] = useState('');

  const callManageUsers = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');
    const res = await supabase.functions.invoke('manage-users', { body });
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await callManageUsers({ action: 'list' });
      setUsers(data as ManagedUser[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({ title: 'Erro ao carregar usuários', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword || !newFullName) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      await callManageUsers({
        action: 'create',
        email: newEmail,
        password: newPassword,
        full_name: newFullName,
        phone: newPhone,
        ubs_names: newUbsName ? [newUbsName] : [],
        role: newRole,
      });
      toast({ title: 'Usuário criado com sucesso!' });
      setShowCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Erro ao criar usuário', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !editFullName) {
      toast({ title: 'Preencha o nome', variant: 'destructive' });
      return;
    }
    setEditing(true);
    try {
      await callManageUsers({
        action: 'update',
        user_id: editingUser.id,
        full_name: editFullName,
        phone: editPhone,
        ubs_names: editUbsName ? [editUbsName] : [],
        role: editRole,
      });
      toast({ title: 'Usuário atualizado com sucesso!' });
      setShowEditDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar usuário', description: error.message, variant: 'destructive' });
    } finally {
      setEditing(false);
    }
  };

  const openEditDialog = (user: ManagedUser) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditPhone(user.phone || '');
    setEditRole(user.roles.includes('admin') ? 'admin' : 'user');
    setEditUbsName(user.ubs_name?.[0] || '');
    setEditPassword('');
    setShowEditDialog(true);
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await callManageUsers({ action: 'update_role', user_id: userId, role });
      toast({ title: 'Perfil atualizado!' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await callManageUsers({ action: 'delete', user_id: userId });
      toast({ title: 'Usuário removido!' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Erro ao remover usuário', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setNewEmail(''); setNewPassword(''); setNewFullName(''); setNewPhone(''); setNewRole('user'); setNewUbsName('');
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('admin')) {
      return <Badge className="bg-primary/20 text-primary border-primary/30"><Shield className="w-3 h-3 mr-1" />Administrador</Badge>;
    }
    return <Badge variant="secondary"><Headphones className="w-3 h-3 mr-1" />Suporte</Badge>;
  };

  const renderUnitSelector = (value: string, onChange: (v: string) => void, label?: string) => (
    <div className="space-y-2">
      <Label>{label || 'Unidade Vinculada'}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Selecione uma unidade" /></SelectTrigger>
        <SelectContent>
          {ubsList.map(u => (
            <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">Cadastre e gerencie usuários do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Atualizar
            </Button>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />Novo Usuário
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/50"><CardContent className="pt-4"><div className="text-2xl font-bold">{users.length}</div><div className="text-sm text-muted-foreground">Total de Usuários</div></CardContent></Card>
          <Card className="border-primary/30 bg-primary/5"><CardContent className="pt-4"><div className="text-2xl font-bold text-primary">{users.filter(u => u.roles.includes('admin')).length}</div><div className="text-sm text-primary/80">Administradores</div></CardContent></Card>
          <Card className="border-border/50 bg-card/50"><CardContent className="pt-4"><div className="text-2xl font-bold">{users.filter(u => !u.roles.includes('admin')).length}</div><div className="text-sm text-muted-foreground">Suporte</div></CardContent></Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou e-mail..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Mobile cards */}
        <div className="grid md:hidden grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border/50">Nenhum usuário encontrado</div>
          ) : filteredUsers.map(user => (
            <Card key={user.id} className="border-border/50 bg-card/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-sm block">{user.full_name}</strong>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    {user.ubs_name?.[0] && <span className="text-xs text-muted-foreground block">Unidade: {user.ubs_name[0]}</span>}
                  </div>
                  {getRoleBadge(user.roles)}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEditDialog(user)}>
                    <Pencil className="w-3 h-3 mr-1" />Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Remover usuário?</AlertDialogTitle><AlertDialogDescription>O usuário {user.full_name} será removido permanentemente.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop table */}
        <Card className="hidden md:block border-border/50 bg-card/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</TableCell></TableRow>
                ) : filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{user.ubs_name?.[0] || '-'}</TableCell>
                    <TableCell>{getRoleBadge(user.roles)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}><Pencil className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Remover usuário?</AlertDialogTitle><AlertDialogDescription>O usuário {user.full_name} será removido permanentemente.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Cadastre um novo usuário no sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome Completo *</Label><Input placeholder="Nome completo" value={newFullName} onChange={e => setNewFullName(e.target.value)} /></div>
            <div className="space-y-2"><Label>E-mail *</Label><Input type="email" placeholder="email@exemplo.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label>Senha *</Label><Input type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input type="tel" placeholder="(00) 00000-0000" value={newPhone} onChange={e => setNewPhone(formatPhone(e.target.value))} /></div>
            <div className="space-y-2">
              <Label>Perfil *</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (acesso total + suporte)</SelectItem>
                  <SelectItem value="user">Suporte (somente área de suporte)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderUnitSelector(newUbsName, setNewUbsName)}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleCreateUser} disabled={creating}>{creating ? 'Criando...' : 'Criar Usuário'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>{editingUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome Completo *</Label><Input placeholder="Nome completo" value={editFullName} onChange={e => setEditFullName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input type="tel" placeholder="(00) 00000-0000" value={editPhone} onChange={e => setEditPhone(formatPhone(e.target.value))} /></div>
            <div className="space-y-2">
              <Label>Perfil *</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (acesso total + suporte)</SelectItem>
                  <SelectItem value="user">Suporte (somente área de suporte)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderUnitSelector(editUbsName, setEditUbsName)}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleEditUser} disabled={editing}>{editing ? 'Salvando...' : 'Salvar Alterações'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UsuariosPage;
