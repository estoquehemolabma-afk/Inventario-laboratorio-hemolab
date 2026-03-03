# 📋 Documentação do Sistema - Inventário de Equipamentos de TI das UBS

## 1. Visão Geral

Sistema web para gerenciamento de inventário de equipamentos de Tecnologia da Informação (TI) das Unidades Básicas de Saúde (UBS). Permite o cadastro, acompanhamento e controle de equipamentos, além de um módulo de suporte técnico com rastreamento de chamados.

**Tecnologias utilizadas:**
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Backend:** Lovable Cloud (Supabase)
- **Animações:** Framer Motion
- **Gráficos:** Recharts
- **Relatórios:** jsPDF + jspdf-autotable

---

## 2. Módulos do Sistema

### 2.1 Autenticação (`/auth`)
**Arquivo:** `src/pages/AuthPage.tsx`

- Login e cadastro de usuários
- Campos de cadastro: nome completo, e-mail, telefone, senha, UBS vinculada(s)
- Confirmação de e-mail obrigatória
- Sessão persistente com refresh automático de token
- Contexto de autenticação global via `AuthContext`

---

### 2.2 Dashboard (`/`)
**Arquivo:** `src/pages/Dashboard.tsx`

Painel principal com visão geral do inventário:

- **Card "Funcionando":** Total de equipamentos em estado operacional
- **Card "Déficit":** Total de equipamentos inexistentes (estado "Sucata" no banco)
- **Card "Em Manutenção":** Equipamentos em manutenção
- **Card "Unidades":** Total de UBS cadastradas
- **Gráfico de pizza:** Distribuição visual dos estados dos equipamentos
- **Legenda:** Funcionando, Em Manutenção, Inexistente (Déficit)

> **Regra de negócio:** O total de equipamentos exibido **não inclui** os equipamentos com estado "Inexistente" (Sucata). Esses são contabilizados separadamente como "Déficit".

---

### 2.3 Unidades de Saúde (`/unidades`)
**Arquivo:** `src/pages/UnidadesPage.tsx`

Gerenciamento completo das UBS:

- **Listagem** de todas as UBS cadastradas
- **Cadastro** de nova UBS (nome, endereço, responsável, telefone, e-mail)
- **Edição** dos dados de uma UBS
- **Exclusão** de UBS
- **Busca/filtro** por nome

---

### 2.4 Detalhes da UBS (`/ubs/:id`)
**Arquivo:** `src/pages/UBSDetail.tsx`

Visão detalhada de uma unidade específica:

- Informações da UBS (nome, endereço, responsável, contato)
- Lista de equipamentos vinculados
- Resumo por tipo de equipamento
- Resumo por estado de conservação

---

### 2.5 Equipamentos (`/equipamentos`)
**Arquivo:** `src/pages/EquipamentosPage.tsx`

Gerenciamento de equipamentos de TI:

- **Listagem** de todos os equipamentos com filtros
- **Cadastro** de novo equipamento
- **Edição** de equipamento existente
- **Exclusão** de equipamento

**Campos do equipamento:**
| Campo | Descrição |
|---|---|
| UBS | Unidade vinculada |
| Tipo | PC, Impressora, Monitor, Estabilizador, Scanner, Notebook, Roteador, Switch, Nobreak |
| Marca | Fabricante do equipamento |
| Modelo | Modelo do equipamento |
| Número de Série | Identificação do fabricante |
| Número de Patrimônio | Identificação patrimonial |
| Localização | Setor/sala onde está instalado |
| Estado de Conservação | Funcionando, Em Manutenção, Inexistente (Sucata) |
| Data de Instalação | Data em que foi instalado |
| Observações | Notas adicionais |

---

### 2.6 Relatórios (`/relatorios`)
**Arquivo:** `src/pages/RelatoriosPage.tsx`

Geração de relatórios do inventário:

- Relatório geral de equipamentos
- Relatório por UBS
- Relatório por tipo de equipamento
- Relatório por estado de conservação
- **Exportação em PDF** via jsPDF

---

### 2.7 Suporte Técnico (`/suporte`)
**Arquivo:** `src/pages/SuportePage.tsx`

Portal de suporte técnico:

- Acesso à solicitação de suporte
- Acesso ao acompanhamento de chamados

---

### 2.8 Solicitar Suporte (`/solicitar-suporte`)
**Arquivo:** `src/pages/SolicitarSuportePage.tsx`

Formulário para abertura de chamado técnico:

**Campos:**
| Campo | Descrição |
|---|---|
| Nome do Solicitante | Quem está abrindo o chamado |
| E-mail | Contato do solicitante |
| Telefone | Contato telefônico |
| UBS | Unidade onde ocorreu o problema |
| Localização | Setor/sala específica |
| Tipo | Hardware, Software, Rede, Impressora, Outros |
| Prioridade | Baixa, Média, Alta, Urgente |
| Equipamento | Informações do equipamento afetado |
| Descrição | Detalhamento do problema |

**Após envio:** Sistema gera automaticamente um **código de rastreamento** no formato `SUP-YYYYMMDD-XXXXXX`.

---

### 2.9 Acompanhar Suporte (`/acompanhar-suporte`)
**Arquivo:** `src/pages/AcompanharSuportePage.tsx`

- Consulta do status de um chamado pelo código de rastreamento
- Visualização do histórico e notas de resolução
- **Status possíveis:** Recebido → Em Andamento → Resolvido / Cancelado

---

### 2.10 Relatórios de Suporte (`/relatorios-suporte`)
**Arquivo:** `src/pages/RelatoriosSuportePage.tsx`

Relatórios específicos do módulo de suporte:

- Estatísticas de chamados
- Filtros por status, tipo e período

---

## 3. Estrutura do Banco de Dados

### 3.1 Tabela `ubs`
| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único (auto-gerado) |
| name | TEXT | Sim | Nome da UBS |
| address | TEXT | Não | Endereço |
| responsible | TEXT | Não | Nome do responsável |
| phone | TEXT | Não | Telefone |
| email | TEXT | Não | E-mail |
| created_at | TIMESTAMP | Sim | Data de criação |
| updated_at | TIMESTAMP | Sim | Data de atualização |

### 3.2 Tabela `equipment`
| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| ubs_id | UUID (FK) | Sim | Referência à UBS |
| type | ENUM | Sim | Tipo do equipamento |
| brand | TEXT | Não | Marca |
| model | TEXT | Não | Modelo |
| serial_number | TEXT | Não | Número de série |
| patrimony_number | TEXT | Não | Número de patrimônio |
| location | TEXT | Sim | Localização/setor |
| conservation_state | ENUM | Sim | Estado: Funcionando, Manutenção, Sucata |
| installation_date | TEXT | Não | Data de instalação |
| observations | TEXT | Não | Observações |
| created_at | TIMESTAMP | Sim | Data de criação |
| updated_at | TIMESTAMP | Sim | Data de atualização |

> **Nota:** No banco, o estado "Sucata" é exibido como "Inexistente" na interface do sistema.

### 3.3 Tabela `profiles`
| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| user_id | UUID | Sim | Referência ao usuário autenticado |
| full_name | TEXT | Sim | Nome completo |
| email | TEXT | Não | E-mail |
| phone | TEXT | Não | Telefone |
| ubs_name | TEXT[] | Não | Array de UBS vinculadas |
| created_at | TIMESTAMP | Sim | Data de criação |
| updated_at | TIMESTAMP | Sim | Data de atualização |

### 3.4 Tabela `support_requests`
| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | UUID | Sim | Identificador único |
| tracking_code | TEXT | Sim | Código de rastreamento (auto-gerado) |
| ubs_name | TEXT | Sim | Nome da UBS |
| requester_name | TEXT | Sim | Nome do solicitante |
| requester_email | TEXT | Não | E-mail do solicitante |
| requester_phone | TEXT | Não | Telefone do solicitante |
| location | TEXT | Sim | Localização do problema |
| description | TEXT | Sim | Descrição do problema |
| equipment_info | TEXT | Não | Info do equipamento |
| request_type | ENUM | Sim | hardware, software, rede, impressora, outros |
| priority | ENUM | Sim | baixa, media, alta, urgente |
| status | ENUM | Sim | recebido, em_andamento, resolvido, cancelado |
| resolution_notes | TEXT | Não | Notas de resolução |
| resolved_at | TIMESTAMP | Não | Data de resolução |
| created_at | TIMESTAMP | Sim | Data de criação |
| updated_at | TIMESTAMP | Sim | Data de atualização |

---

## 4. Enums do Banco

| Enum | Valores |
|---|---|
| `equipment_type` | PC, Impressora, Monitor, Estabilizador, Scanner, Notebook, Roteador, Switch, Nobreak |
| `conservation_state` | Funcionando, Manutenção, Sucata |
| `support_type` | hardware, software, rede, impressora, outros |
| `support_priority` | baixa, media, alta, urgente |
| `support_status` | recebido, em_andamento, resolvido, cancelado |

---

## 5. Políticas de Segurança (RLS)

### UBS e Equipamentos
- **SELECT:** Público (qualquer pessoa pode visualizar)
- **INSERT/UPDATE/DELETE:** Apenas usuários autenticados

### Perfis (profiles)
- **SELECT/UPDATE/INSERT:** Apenas o próprio usuário (baseado em `auth.uid()`)
- **DELETE:** Não permitido

### Solicitações de Suporte
- **SELECT:** Público (permite consulta por código de rastreamento)
- **INSERT:** Público (qualquer pessoa pode abrir chamado)
- **UPDATE:** Apenas usuários autenticados
- **DELETE:** Não permitido

---

## 6. Funções do Banco de Dados

| Função | Descrição |
|---|---|
| `update_updated_at_column()` | Trigger para atualizar `updated_at` automaticamente |
| `generate_tracking_code()` | Gera código de rastreamento no formato `SUP-YYYYMMDD-XXXXXX` |
| `update_support_updated_at()` | Atualiza `updated_at` e define `resolved_at` quando status muda para "resolvido" |
| `handle_new_user()` | Cria perfil automaticamente quando um novo usuário se registra |

---

## 7. Dados Atuais (Estatísticas)

| Métrica | Valor |
|---|---|
| Total de UBS cadastradas | 36 |
| Total de equipamentos | 532 |
| Equipamentos funcionando | 353 |
| Equipamentos em manutenção | 2 |
| Equipamentos inexistentes (déficit) | 177 |
| Solicitações de suporte | 5 |
| Usuários cadastrados | 4 |

---

## 8. Navegação do Sistema

```
├── / (Dashboard)
├── /auth (Login/Cadastro)
├── /unidades (Gestão de UBS)
│   └── /ubs/:id (Detalhes da UBS)
├── /equipamentos (Gestão de Equipamentos)
├── /relatorios (Relatórios de Inventário)
├── /suporte (Portal de Suporte)
│   ├── /solicitar-suporte (Abrir Chamado)
│   └── /acompanhar-suporte (Consultar Chamado)
├── /relatorios-suporte (Relatórios de Suporte)
└── /configuracoes (Configurações)
```

---

## 9. Componentes Principais

| Componente | Descrição |
|---|---|
| `MainLayout` | Layout principal com sidebar de navegação |
| `Sidebar` | Menu lateral com links de navegação |
| `DashboardHeader` | Cabeçalho do dashboard |
| `StatCard` | Card de estatística com ícone e animação |
| `UBSCard` | Card de resumo de uma UBS |
| `EquipmentFormDialog` | Dialog para cadastro/edição de equipamento |
| `UBSFormDialog` | Dialog para cadastro/edição de UBS |
| `AuthContext` | Contexto global de autenticação |
| `InventoryContext` | Contexto global do inventário (UBS + Equipamentos) |

---

## 10. Mapeamento de Estados (Interface ↔ Banco)

| Interface (Frontend) | Banco de Dados | Exibição |
|---|---|---|
| Funcionando | Funcionando | Funcionando |
| Manutenção | Manutenção | Em Manutenção |
| Inexistente | Sucata | Inexistente (Déficit) |

---

*Documentação gerada em 03/03/2026*
