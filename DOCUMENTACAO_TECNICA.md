# 📋 Documentação Técnica Completa — Sistema Chamados Hemolab

> **Versão:** 2.0  
> **Data:** 08/03/2026  
> **Plataforma de Hospedagem:** Lovable Cloud (Supabase)

---

## 1. Visão Geral

Sistema web para gerenciamento de inventário de equipamentos de TI e abertura/acompanhamento de chamados de suporte técnico para unidades de saúde (UBS). O sistema possui dois fluxos principais:

1. **Painel Administrativo** (protegido por autenticação) — gestão de unidades, equipamentos, relatórios e suporte.
2. **Portal Público** — solicitação e acompanhamento de chamados de suporte via código de rastreamento.

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | ^18.3.1 | Biblioteca UI principal |
| TypeScript | ^5.8.3 | Tipagem estática |
| Vite | ^5.4.19 | Bundler e dev server |
| Tailwind CSS | ^3.4.17 | Framework de estilos utilitários |
| shadcn/ui (Radix UI) | Diversos | Componentes de interface acessíveis |
| Framer Motion | ^12.23.26 | Animações e transições |
| Recharts | ^2.15.4 | Gráficos e visualização de dados |
| React Router DOM | ^6.30.1 | Roteamento SPA |
| React Query (TanStack) | ^5.83.0 | Cache e gerenciamento de estado server-side |
| React Hook Form | ^7.61.1 | Formulários |
| Zod | ^3.25.76 | Validação de schemas |
| jsPDF + jspdf-autotable | ^3.0.4 / ^5.0.2 | Geração de relatórios PDF |
| date-fns | ^3.6.0 | Manipulação de datas |
| Lucide React | ^0.462.0 | Ícones |
| Sonner | ^1.7.4 | Toasts/notificações |

### 2.2 Backend / Banco de Dados

| Tecnologia | Detalhes |
|---|---|
| **Plataforma** | Lovable Cloud (baseado em Supabase) |
| **Banco de Dados** | PostgreSQL (hospedado na infraestrutura Supabase) |
| **Autenticação** | Supabase Auth (e-mail + senha) |
| **API** | PostgREST (API REST automática gerada pelo Supabase) |
| **Segurança** | Row-Level Security (RLS) em todas as tabelas |
| **Project ID** | `cfelyseagxpbmsrlxhfo` |
| **URL do Banco** | `https://cfelyseagxpbmsrlxhfo.supabase.co` |

---

## 3. Arquitetura do Projeto

```
src/
├── assets/                  # Imagens e recursos estáticos
│   └── logogota.png         # Logo oficial Hemolab
├── components/
│   ├── dashboard/           # Componentes do painel principal
│   │   ├── DashboardHeader.tsx
│   │   ├── StatCard.tsx
│   │   └── UBSCard.tsx
│   ├── dialogs/             # Diálogos/modais de formulários
│   │   ├── EquipmentFormDialog.tsx
│   │   └── UBSFormDialog.tsx
│   ├── layout/              # Layout e navegação
│   │   ├── MainLayout.tsx
│   │   └── Sidebar.tsx
│   ├── ui/                  # Componentes shadcn/ui
│   ├── NavLink.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx       # Autenticação global
│   └── InventoryContext.tsx  # Estado do inventário (UBS + Equipamentos)
├── data/
│   ├── cidadesMA.ts         # Lista de cidades do Maranhão
│   └── mockData.ts          # Dados de exemplo
├── hooks/
│   ├── use-mobile.tsx       # Detecção de dispositivo móvel
│   └── use-toast.ts         # Hook de notificações
├── integrations/
│   └── supabase/
│       ├── client.ts        # Cliente Supabase (auto-gerado)
│       └── types.ts         # Tipos do banco (auto-gerado)
├── lib/
│   ├── equipmentUtils.ts    # Utilitários de equipamentos
│   ├── pdfGenerator.ts      # Geração de PDFs
│   └── utils.ts             # Utilitários gerais
├── pages/
│   ├── AcompanharSuportePage.tsx  # Consulta de chamados
│   ├── AdminLoginPage.tsx         # Login administrativo
│   ├── AuthPage.tsx               # Login/cadastro público
│   ├── Dashboard.tsx              # Painel principal
│   ├── EquipamentosPage.tsx       # Gestão de equipamentos
│   ├── Index.tsx                  # Página inicial
│   ├── NotFound.tsx               # 404
│   ├── RelatoriosPage.tsx         # Relatórios de inventário
│   ├── RelatoriosSuportePage.tsx  # Relatórios de suporte
│   ├── SolicitarSuportePage.tsx   # Abertura de chamados
│   ├── SuportePage.tsx            # Portal de suporte
│   ├── UBSDetail.tsx              # Detalhes de uma unidade
│   └── UnidadesPage.tsx           # Gestão de unidades
└── types/
    ├── inventory.ts          # Tipos do inventário
    └── support.ts            # Tipos do suporte
```

---

## 4. Rotas da Aplicação

| Rota | Componente | Acesso | Descrição |
|---|---|---|---|
| `/` | Dashboard | 🔒 Autenticado | Painel principal |
| `/admin-login` | AdminLoginPage | 🌐 Público | Login administrativo |
| `/auth` | AuthPage | 🌐 Público | Login/cadastro de usuários |
| `/unidades` | UnidadesPage | 🔒 Autenticado | Gestão de unidades |
| `/unidade/:id` | UBSDetail | 🔒 Autenticado | Detalhes da unidade |
| `/equipamentos` | EquipamentosPage | 🔒 Autenticado | Gestão de equipamentos |
| `/relatorios` | RelatoriosPage | 🔒 Autenticado | Relatórios de inventário |
| `/relatorios-suporte` | RelatoriosSuportePage | 🔒 Autenticado | Relatórios de suporte |
| `/suporte` | SuportePage | 🔒 Autenticado | Portal de suporte |
| `/solicitar-suporte` | SolicitarSuportePage | 🌐 Público | Abrir chamado |
| `/acompanhar-suporte` | AcompanharSuportePage | 🌐 Público | Consultar chamado |
| `/acompanhar-suporte/:trackingCode` | AcompanharSuportePage | 🌐 Público | Chamado específico |

---

## 5. Estrutura do Banco de Dados

### 5.1 Tabela `ubs` — Unidades de Saúde

```sql
CREATE TABLE public.ubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    responsible TEXT DEFAULT '',
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.2 Tabela `equipment` — Equipamentos

```sql
CREATE TABLE public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ubs_id UUID NOT NULL REFERENCES public.ubs(id),
    type TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    serial_number TEXT DEFAULT '',
    patrimony_number TEXT DEFAULT '',
    location TEXT NOT NULL,
    municipality TEXT DEFAULT '',
    conservation_state conservation_state NOT NULL DEFAULT 'Funcionando',
    installation_date TEXT DEFAULT '',
    observations TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    deactivation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.3 Tabela `equipment_types` — Tipos de Equipamento (dinâmico)

```sql
CREATE TABLE public.equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.4 Tabela `profiles` — Perfis de Usuário

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    ubs_name TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.5 Tabela `support_requests` — Chamados de Suporte

```sql
CREATE TABLE public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT NOT NULL,
    ubs_name TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requester_email TEXT,
    requester_phone TEXT,
    request_type TEXT NOT NULL DEFAULT 'outros',
    priority support_priority NOT NULL DEFAULT 'media',
    status support_status NOT NULL DEFAULT 'recebido',
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    equipment_info TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.6 Tabela `admin_invite_codes` — Códigos de Convite Admin

```sql
CREATE TABLE public.admin_invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. Enums do Banco

```sql
CREATE TYPE public.conservation_state AS ENUM ('Funcionando', 'Manutenção', 'Sucata');
CREATE TYPE public.support_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE public.support_status AS ENUM ('recebido', 'em_andamento', 'resolvido', 'cancelado');
CREATE TYPE public.support_type AS ENUM ('hardware', 'software', 'rede', 'impressora', 'outros');
```

> **Mapeamento Frontend ↔ Banco:** O estado `Sucata` no banco é exibido como `Inexistente` na interface.

---

## 7. Funções do Banco de Dados

### 7.1 Atualizar `updated_at` automaticamente

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### 7.2 Gerar código de rastreamento

```sql
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.tracking_code := 'SUP-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
  RETURN NEW;
END;
$$;
```

### 7.3 Atualizar suporte (updated_at + resolved_at)

```sql
CREATE OR REPLACE FUNCTION public.update_support_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'resolvido' AND OLD.status != 'resolvido' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$;
```

### 7.4 Validar código de convite

```sql
CREATE OR REPLACE FUNCTION public.validate_invite_code(input_code text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_invite_codes
    WHERE code = input_code AND is_active = true
  )
$$;
```

### 7.5 Criar perfil ao registrar novo usuário

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ubs_array text[];
BEGIN
  IF new.raw_user_meta_data ->> 'ubs_name' IS NOT NULL AND new.raw_user_meta_data ->> 'ubs_name' != '' THEN
    ubs_array := string_to_array(new.raw_user_meta_data ->> 'ubs_name', '|||');
  ELSE
    ubs_array := NULL;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, phone, ubs_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    ubs_array
  );
  RETURN new;
END;
$$;
```

---

## 8. Políticas de Segurança (Row-Level Security)

### 8.1 Tabela `ubs`

| Operação | Política | Quem |
|---|---|---|
| SELECT | Público | Todos |
| INSERT | Autenticado | Usuários logados |
| UPDATE | Autenticado | Usuários logados |
| DELETE | Autenticado | Usuários logados |

### 8.2 Tabela `equipment`

| Operação | Política | Quem |
|---|---|---|
| SELECT | Público | Todos |
| INSERT | Autenticado | Usuários logados |
| UPDATE | Autenticado | Usuários logados |
| DELETE | Autenticado | Usuários logados |

### 8.3 Tabela `equipment_types`

| Operação | Política | Quem |
|---|---|---|
| SELECT | Público | Todos |
| INSERT | Autenticado | Usuários logados |
| DELETE | Autenticado | Usuários logados |
| UPDATE | ❌ Não permitido | — |

### 8.4 Tabela `profiles`

| Operação | Política | Quem |
|---|---|---|
| SELECT | Próprio usuário | `auth.uid() = user_id` |
| INSERT | Próprio usuário | `auth.uid() = user_id` |
| UPDATE | Próprio usuário | `auth.uid() = user_id` |
| DELETE | ❌ Não permitido | — |

### 8.5 Tabela `support_requests`

| Operação | Política | Quem |
|---|---|---|
| SELECT | Público | Todos |
| INSERT | Público | Todos (qualquer pessoa abre chamado) |
| UPDATE | Autenticado | Usuários logados |
| DELETE | ❌ Não permitido | — |

### 8.6 Tabela `admin_invite_codes`

| Operação | Política | Quem |
|---|---|---|
| SELECT | ❌ Bloqueado | `false` (acesso via function) |
| INSERT/UPDATE/DELETE | ❌ Não permitido | — |

---

## 9. Autenticação

- **Método:** E-mail + Senha via Supabase Auth
- **Confirmação de e-mail:** Obrigatória
- **Trigger automático:** Ao criar conta, a function `handle_new_user()` insere automaticamente um registro na tabela `profiles`
- **Metadados no signup:** `full_name`, `phone`, `ubs_name` (separados por `|||`)
- **Login Admin:** Rota `/admin-login` com código de convite validado via `validate_invite_code()`
- **Sessão:** Gerenciada via `AuthContext` com listener `onAuthStateChange` + `getSession()`

---

## 10. Módulos Funcionais

### 10.1 Dashboard
- Cards de estatísticas (Funcionando, Déficit, Manutenção, Unidades)
- Gráfico de pizza com distribuição de estados
- Equipamentos com estado "Sucata" não entram no total, são contados como "Déficit"

### 10.2 Gestão de Unidades
- CRUD completo de UBS
- Busca/filtro por nome
- Detalhes com resumo de equipamentos por tipo e estado

### 10.3 Gestão de Equipamentos
- CRUD completo
- Tipos dinâmicos (tabela `equipment_types`)
- Ativação/desativação com motivo
- Filtros por UBS, tipo, estado

### 10.4 Relatórios
- Relatório geral, por UBS, por tipo, por estado
- Exportação em PDF

### 10.5 Suporte Técnico
- Abertura pública de chamados
- Código de rastreamento automático (`SUP-YYYYMMDD-XXXXXX`)
- Acompanhamento por código
- Fluxo: Recebido → Em Andamento → Resolvido/Cancelado
- Relatórios de chamados com filtros

---

## 11. Localização Atual do Banco de Dados

| Item | Valor |
|---|---|
| **Serviço** | Lovable Cloud (infraestrutura Supabase) |
| **Engine** | PostgreSQL 15+ |
| **Região** | Definida pelo Lovable Cloud |
| **Project ID** | `cfelyseagxpbmsrlxhfo` |
| **URL da API** | `https://cfelyseagxpbmsrlxhfo.supabase.co` |
| **Chave Anon (pública)** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## 12. Query Completa para Migração do Banco

Use o SQL abaixo para recriar toda a estrutura do banco em outro serviço PostgreSQL (Neon, Railway, Render, local, etc.).

> ⚠️ **IMPORTANTE:** Este script cria apenas a **estrutura** (schema). Os dados devem ser exportados separadamente via `pg_dump` ou exportação CSV.

```sql
-- ============================================
-- QUERY DE MIGRAÇÃO — CHAMADOS HEMOLAB
-- Compatível com PostgreSQL 14+
-- ============================================

-- 1. CRIAÇÃO DOS ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE conservation_state AS ENUM ('Funcionando', 'Manutenção', 'Sucata');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE support_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE support_status AS ENUM ('recebido', 'em_andamento', 'resolvido', 'cancelado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE support_type AS ENUM ('hardware', 'software', 'rede', 'impressora', 'outros');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 2. CRIAÇÃO DAS TABELAS
-- ============================================

-- 2.1 Unidades de Saúde (UBS)
CREATE TABLE IF NOT EXISTS public.ubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT DEFAULT '',
    responsible TEXT DEFAULT '',
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Equipamentos
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ubs_id UUID NOT NULL REFERENCES public.ubs(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    serial_number TEXT DEFAULT '',
    patrimony_number TEXT DEFAULT '',
    location TEXT NOT NULL,
    municipality TEXT DEFAULT '',
    conservation_state conservation_state NOT NULL DEFAULT 'Funcionando',
    installation_date TEXT DEFAULT '',
    observations TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    deactivation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Tipos de Equipamento (dinâmico)
CREATE TABLE IF NOT EXISTS public.equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    ubs_name TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 Solicitações de Suporte
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT NOT NULL,
    ubs_name TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requester_email TEXT,
    requester_phone TEXT,
    request_type TEXT NOT NULL DEFAULT 'outros',
    priority support_priority NOT NULL DEFAULT 'media',
    status support_status NOT NULL DEFAULT 'recebido',
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    equipment_info TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 Códigos de Convite Admin
CREATE TABLE IF NOT EXISTS public.admin_invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_equipment_ubs_id ON public.equipment(ubs_id);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON public.equipment(type);
CREATE INDEX IF NOT EXISTS idx_equipment_conservation_state ON public.equipment(conservation_state);
CREATE INDEX IF NOT EXISTS idx_equipment_is_active ON public.equipment(is_active);
CREATE INDEX IF NOT EXISTS idx_support_tracking_code ON public.support_requests(tracking_code);
CREATE INDEX IF NOT EXISTS idx_support_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);


-- 4. FUNÇÕES
-- ============================================

-- 4.1 Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4.2 Gerar código de rastreamento
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.tracking_code := 'SUP-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
  RETURN NEW;
END;
$$;

-- 4.3 Atualizar suporte (updated_at + resolved_at)
CREATE OR REPLACE FUNCTION public.update_support_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'resolvido' AND OLD.status != 'resolvido' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- 4.4 Validar código de convite
CREATE OR REPLACE FUNCTION public.validate_invite_code(input_code text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_invite_codes
    WHERE code = input_code AND is_active = true
  )
$$;


-- 5. TRIGGERS
-- ============================================

-- updated_at automático para UBS
DROP TRIGGER IF EXISTS update_ubs_updated_at ON public.ubs;
CREATE TRIGGER update_ubs_updated_at
  BEFORE UPDATE ON public.ubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- updated_at automático para equipment
DROP TRIGGER IF EXISTS update_equipment_updated_at ON public.equipment;
CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- updated_at automático para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gerar tracking_code automático ao inserir chamado
DROP TRIGGER IF EXISTS generate_support_tracking_code ON public.support_requests;
CREATE TRIGGER generate_support_tracking_code
  BEFORE INSERT ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.generate_tracking_code();

-- Atualizar updated_at e resolved_at do suporte
DROP TRIGGER IF EXISTS update_support_request_updated_at ON public.support_requests;
CREATE TRIGGER update_support_request_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_support_updated_at();


-- 6. ROW-LEVEL SECURITY (RLS)
-- ============================================
-- NOTA: RLS é específico do Supabase/PostgreSQL com autenticação.
-- Se migrar para outro serviço sem Supabase Auth, implemente
-- a segurança na camada de aplicação ou adapte as policies.

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.ubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invite_codes ENABLE ROW LEVEL SECURITY;

-- UBS: leitura pública, escrita autenticada
CREATE POLICY "ubs_select_public" ON public.ubs FOR SELECT USING (true);
CREATE POLICY "ubs_insert_auth" ON public.ubs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ubs_update_auth" ON public.ubs FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "ubs_delete_auth" ON public.ubs FOR DELETE USING (auth.uid() IS NOT NULL);

-- Equipment: leitura pública, escrita autenticada
CREATE POLICY "equipment_select_public" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "equipment_insert_auth" ON public.equipment FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "equipment_update_auth" ON public.equipment FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "equipment_delete_auth" ON public.equipment FOR DELETE USING (auth.uid() IS NOT NULL);

-- Equipment Types: leitura pública, insert/delete autenticado
CREATE POLICY "eq_types_select_public" ON public.equipment_types FOR SELECT USING (true);
CREATE POLICY "eq_types_insert_auth" ON public.equipment_types FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "eq_types_delete_auth" ON public.equipment_types FOR DELETE USING (auth.uid() IS NOT NULL);

-- Profiles: apenas próprio usuário
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Support Requests: leitura e inserção pública, update autenticado
CREATE POLICY "support_select_public" ON public.support_requests FOR SELECT USING (true);
CREATE POLICY "support_insert_public" ON public.support_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "support_update_auth" ON public.support_requests FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Admin Invite Codes: sem acesso direto (apenas via function)
CREATE POLICY "invite_codes_no_access" ON public.admin_invite_codes FOR SELECT USING (false);


-- ============================================
-- FIM DA QUERY DE MIGRAÇÃO
-- ============================================

-- NOTAS PARA MIGRAÇÃO:
--
-- 1. Se NÃO usar Supabase Auth no destino:
--    - Remova todas as policies que usam auth.uid()
--    - Implemente autenticação e autorização na aplicação
--    - Remova a function handle_new_user() (trigger em auth.users)
--    - A tabela profiles precisará de inserção manual
--
-- 2. Para exportar DADOS do Supabase atual:
--    pg_dump -h db.cfelyseagxpbmsrlxhfo.supabase.co -U postgres -d postgres \
--      --data-only --table=public.ubs --table=public.equipment \
--      --table=public.equipment_types --table=public.profiles \
--      --table=public.support_requests --table=public.admin_invite_codes \
--      > dados_hemolab.sql
--
-- 3. Para Neon DB:
--    - Use a connection string do Neon no pg_dump/psql
--    - Neon suporta PostgreSQL 15+, totalmente compatível
--    - Exemplo: psql "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb" < migration.sql
--
-- 4. Para PostgreSQL local:
--    - Instale PostgreSQL 14+ 
--    - Crie o banco: createdb hemolab
--    - Execute: psql -d hemolab -f migration.sql
--    - Atualize VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env
--    - Ou substitua o cliente Supabase por conexão direta (pg, Prisma, Drizzle, etc.)
```

---

## 13. Variáveis de Ambiente

```env
VITE_SUPABASE_PROJECT_ID="<project_id>"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon_key>"
VITE_SUPABASE_URL="<supabase_url>"
```

Se migrar para outro serviço, atualize estas variáveis com as credenciais do novo banco.

---

## 14. Como Executar Localmente

```bash
# 1. Clone o repositório
git clone <repo_url>
cd <projeto>

# 2. Instale as dependências
npm install   # ou bun install

# 3. Configure o .env com as credenciais do banco

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Acesse no navegador
# http://localhost:5173
```

---

*Documentação gerada em 08/03/2026*
