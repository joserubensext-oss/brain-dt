# Brain DT - Sistema de Gerenciamento de Day Trade

## Visão Geral

**Brain DT** é uma plataforma web completa de gerenciamento de operações em Day Trade, desenvolvida para traders que buscam aprovação em mesas proprietárias nacionais e internacionais.

### Objetivos

- ✅ **Dashboard Diário de Risco**: Monitoramento em tempo real do status operacional, metas, perdas e limites
- ✅ **Diário de Trade**: Registro estruturado e análise de cada operação com contexto de mercado
- ✅ **Simuladores**: Cálculos de resultados para diferentes ativos (Mini Índice, Mini Dólar, Bitfut, Solana)
- ✅ **Gerenciamento de Risco**: Configuração de planos, mesas proprietárias e limites operacionais
- ✅ **Sistema de Autenticação**: Acesso por usuário com níveis de permissão (MVP → Comercialização futura)
- ✅ **Análise de Performance**: Consistência, win rate, sequências de loss, detecção de padrões de reprovação

---

## Arquitetura Técnica

```
brain-dt/
├── public/
│   ├── index.html           # Entry point - Login + Dashboard
│   └── pages/
│       ├── dashboard.html
│       ├── trade-diary.html
│       ├── simulators.html
│       └── settings.html
├── assets/
│   ├── css/
│   │   ├── style.css        # Global + Glassmorphism
│   │   ├── components.css   # Componentes reutilizáveis
│   │   └── themes.css       # Dark/Light tema
│   ├── js/
│   │   ├── auth.js          # Autenticação + Access Control
│   │   ├── storage.js       # localStorage Manager
│   │   ├── modules.js       # Dashboard, Trade Diary, Simulators
│   │   ├── utils.js         # Funções auxiliares
│   │   └── init.js          # Bootstrap da aplicação
│   └── images/
│       └── icons/
├── docs/
│   ├── DATABASE_SCHEMA.md   # Schema para futura integração back-end
│   ├── API_DESIGN.md        # Especificação de API REST
│   └── USER_FLOWS.md        # Fluxos de usuário e permissões
├── .gitignore
├── README.md
└── package.json             # (opcional - para NPM scripts futuros)
```

---

## Stack Tecnológico

**MVP (Fase 1)**
- HTML5 (Semântico)
- CSS3 (Glassmorphism, Dark Theme)
- JavaScript Vanilla (ES6+)
- localStorage (Persistência local)

**Futura Expansão**
- Back-end: Node.js + Express
- Banco de Dados: PostgreSQL / MongoDB
- Autenticação: JWT
- Hospedagem: Vercel / GitHub Pages (MVP)

---

## Módulos Principais

### 1️⃣ **Dashboard Diário de Risco** (Módulo A)
- Status atual: Em Jogo / Meta Batida / Stop Dia / 3 Dias Negativos
- Painel de limites: perda diária, perda total, % meta, % overtrading
- Indicadores: Win Rate, Payoff, Maior Sequência de Losses
- Alertas automáticos: violações de risco

### 2️⃣ **Diário de Trade** (Módulo B)
- Registro por operação: ativo, horário, setup (3 candles, pullback, rompimento)
- Contexto: Tendência primária, acumulação/movimentação/distribuição, prior cote
- Resultado: P&L em R$, em múltiplos de Risco, ganho/perda
- Tags de erro: overtrading, contra-tendência, revenge trade, desrespeito a regra
- Campo psicológico: emoção (medo, ganância, ego)

### 3️⃣ **Simuladores** (Módulo C)
- Mini Índice (WIN): 1 ponto = R$ 1,00
- Mini Dólar (WDO): 0,5 ponto = R$ 5,00
- Bitfut (BIT): 20 pontos = R$ 0,20
- Solana (SOL): 10 pontos = R$ 0,10
- Simulador de campanha: meta + drawdown + dias mínimos

### 4️⃣ **Configuração de Planos/Mesas** (Módulo D)
- Cadastro de contextos: Starter/Pro/Master/Black/Platinum/Infinity (LTX)
- Limites: meta, perda total, perda diária, contratos máximos
- Regulamento: período máximo, mínimo de preges, dias de loss consecutivos
- Reset diário: ativa/desativa, análise de uso

---

## Sistema de Autenticação e Acesso

### Estrutura de Usuários (MVP)

```javascript
{
  id: "user_123",
  email: "trader@example.com",
  password: "hash_bcrypt", // Será implementado no back-end
  accessLevel: "FULL", // FULL, TRADER, ANALYST, VIEWER
  modulesAccess: {
    dashboard: true,
    tradeDiary: true,
    simulators: true,
    settings: true
  },
  createdAt: "2026-01-29T12:00:00Z",
  lastLogin: "2026-01-29T14:30:00Z"
}
```

### Níveis de Acesso

| Nível | Dashboard | Trade Diary | Simulators | Settings | Descrição |
|-------|-----------|-------------|-----------|----------|----------|
| **FULL** | ✅ Ler/Escrever | ✅ Ler/Escrever | ✅ Ler/Escrever | ✅ Ler/Escrever | Acesso completo (Criador/Admin) |
| **TRADER** | ✅ Ler/Escrever | ✅ Ler/Escrever | ✅ Usar | ⚠️ Leitura | Trader em operação |
| **ANALYST** | ✅ Ler | ✅ Ler | ✅ Usar | ❌ | Análise de performance |
| **VIEWER** | ✅ Ler | ✅ Ler | ❌ | ❌ | Visualização apenas |

---

## Data Model (localStorage → Futura Migração para Banco)

### Users Collection
```json
{
  "users": [
    {
      "id": "user_001",
      "email": "jose@braindt.com",
      "password_hash": "$2b$10$...",
      "access_level": "FULL",
      "modules_access": { ... },
      "created_at": "2026-01-29T12:00:00Z"
    }
  ]
}
```

### Plans Collection
```json
{
  "plans": [
    {
      "id": "plan_ltx_pro",
      "name": "LTX Pro",
      "type": "B3",
      "meta_ganho": 5500,
      "meta_perda_total": 5800,
      "meta_perda_diaria": 1160,
      "limite_win": 12,
      "limite_wdo": 8,
      "limite_bit": 4,
      "limite_sol": 20
    }
  ]
}
```

### Trades Collection
```json
{
  "trades": [
    {
      "id": "trade_20260129_001",
      "user_id": "user_001",
      "plan_id": "plan_ltx_pro",
      "ativo": "WIN",
      "tipo": "COMPRA",
      "setup": "3_CANDLES",
      "entrada": 123450,
      "saida": 123480,
      "contratos": 3,
      "resultado_pontos": 30,
      "resultado_reais": 90,
      "resultado_r_multiplos": 1.5,
      "contexto": "Tendência de alta, movimentação",
      "emocao_pre": "Confiante",
      "emocao_pos": "Ganância",
      "tags": ["SETUP_VALIDADO", "CONTEXTO_OK"],
      "horario_abertura": "2026-01-29T10:30:00Z",
      "horario_fechamento": "2026-01-29T10:45:00Z"
    }
  ]
}
```

---

## Guia de Uso (MVP)

### 1. Login
- Acesso com email/senha (armazenado em localStorage por enquanto)
- Redirecionamento para Dashboard se autenticado

### 2. Dashboard
- Visualização de status do dia em tempo real
- Indicadores de risco (vermelho/amarelo/verde)
- Botões de acesso a módulos

### 3. Trade Diary
- Formulário para registro de cada operação
- Cálculo automático de P&L
- Filtros por data, ativo, resultado

### 4. Simulators
- Selecionar ativo e calcular resultados
- Simular campanhas de aprovação

### 5. Settings
- Cadastro de planos/mesas
- Configuração de limite de risco
- Exportar/importar dados

---

## Roadmap

### 🟢 Fase 1 (Atual) - MVP
- [x] Criar repositório
- [ ] Estrutura de pastas e arquivos iniciais
- [ ] Autenticação básica (localStorage)
- [ ] Dashboard operacional
- [ ] Diário de trade
- [ ] Simuladores
- [ ] Glassmorphism design

### 🔵 Fase 2 - Back-end & Persistência
- [ ] API REST (Node.js + Express)
- [ ] Banco de dados (PostgreSQL)
- [ ] Autenticação JWT
- [ ] CRUD operations

### 🟣 Fase 3 - Advanced
- [ ] Relatórios avançados (PDF export)
- [ ] Integração com Profit/Nelogica API
- [ ] Análise de estatísticas (gráficos dinâmicos)
- [ ] Notificações de alertas
- [ ] Dark/Light mode dinâmico

### 🟠 Fase 4 - Comercialização
- [ ] Sistema de subscrição
- [ ] Planos com acesso por níveis
- [ ] Payment gateway (Stripe/PagSeguro)
- [ ] Dashboard de admin para gerenciar usuários

---

## Contribuição

Este é um projeto pessoal em desenvolvimento. Sugestões e melhorias são bem-vindas.

---

## Licença

MIT - Veja LICENSE para detalhes.

---

**Desenvolvido com foco em excelência operacional para traders profissionais.** 🚀
