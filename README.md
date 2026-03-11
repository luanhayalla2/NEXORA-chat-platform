

<h1 align="center">NEXORA</h1>
<p align="center"><strong>Bem-vindo ao futuro do chat</strong></p>
<p align="center">
  Aplicativo de mensagens moderno, rápido e seguro — inspirado no Telegram e Discord.<br/>
  Construído com React, TypeScript e Supabase.
</p>


---

## 📸 Telas do App

<p align="center">
  <img src="public/screenshots/welcome.png" alt="Tela de Boas-vindas" width="200" />
  <img src="public/screenshots/login.png" alt="Tela de Login" width="200" />
  <img src="public/screenshots/chat.png" alt="Tela de Chat" width="200" />
  <img src="public/screenshots/status.png" alt="Tela de Status" width="200" />
</p>
<p align="center">
  <img src="public/screenshots/communities.png" alt="Tela de Comunidades" width="200" />
  <img src="public/screenshots/calls.png" alt="Tela de Ligações" width="200" />
  <img src="public/screenshots/profile.png" alt="Tela de Perfil" width="200" />
  <img src="public/screenshots/settings.png" alt="Tela de Configurações" width="200" />
</p>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Funcionalidades](#-funcionalidades)
  - [Onboarding & Autenticação](#-onboarding--autenticação)
  - [Chat & Mensagens](#-chat--mensagens)
  - [Status / Atualizações](#-status--atualizações)
  - [Comunidades](#-comunidades)
  - [Ligações](#-ligações)
  - [Perfil do Usuário](#-perfil-do-usuário)
  - [Configurações do App](#-configurações-do-app)
  - [Tema & Aparência](#-tema--aparência)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Rodar](#-como-rodar)
- [Banco de Dados](#-banco-de-dados)
- [Licença](#-licença)

---

## 🌟 Visão Geral

**NEXORA** é um aplicativo de chat completo com interface profissional e moderna. O app oferece mensagens em tempo real, compartilhamento de status, comunidades, ligações de voz/vídeo, e um sistema robusto de autenticação — tudo em uma experiência fluida com animações suaves e tema claro/escuro.

---

## 🛠 Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **React 18** | Framework de UI |
| **TypeScript** | Tipagem estática |
| **Vite** | Bundler e dev server |
| **Tailwind CSS** | Estilização utilitária |
| **shadcn/ui** | Componentes de UI (Button, Input, Avatar, Dialog, etc.) |
| **Framer Motion** | Animações e transições |
| **Lucide React** | Biblioteca de ícones |
| **React Router DOM** | Roteamento SPA |
| **TanStack React Query** | Gerenciamento de estado assíncrono |
| **date-fns** | Formatação de datas |
| **Sonner** | Notificações toast |
| **Supabase** | Backend (autenticação, banco de dados, storage) |

---

## 🚀 Funcionalidades

### 🔐 Onboarding & Autenticação

- **Tela de boas-vindas** com carrossel animado de slides (swipe por toque)
- **Cadastro** com email, senha, nome de exibição e username
- **Login** com email e senha
- **Verificação de email** obrigatória antes do primeiro acesso
- **Sessão persistente** — o usuário permanece logado entre sessões
- **Logout** seguro com limpeza de sessão
- **Loading state** com spinner durante verificação de autenticação

### 💬 Chat & Mensagens

- **Conversas privadas** (1:1) com indicador de online/offline
- **Grupos** com contagem de membros
- **Canais** com contagem de inscritos
- **Envio de mensagens de texto** em tempo real
- **Status de mensagem**: enviando → enviado (✓) → entregue (✓✓) → lido (✓✓ azul)
- **Timestamps** inteligentes (HH:mm, dia da semana, dd/MM)
- **Pesquisa de conversas** por nome
- **Fixar conversas** (pin) no topo da lista
- **Silenciar notificações** de conversas específicas
- **Badge de mensagens não lidas** com contador
- **Indicador de "Você:"** para mensagens próprias na lista
- **Avatar colorido** gerado automaticamente com iniciais
- **Animações de entrada** nas mensagens e na lista de conversas

#### Barra de Entrada (Input)
- **Campo de texto** com placeholder e foco automático
- **Envio por Enter** (Shift+Enter para nova linha)
- **Emoji Picker** — seletor de emojis por categorias (Smileys, Gestos, Corações, Animais, Comidas, Atividades, Objetos)
- **Anexar arquivos** — dropdown com opções:
  - 📷 Imagem
  - 🎬 Vídeo
  - 📄 Documento (PDF, DOC, XLS, TXT, ZIP)
- **Câmera** — captura de foto/vídeo direto do dispositivo
- **Gravação de áudio** — botão de microfone com animação pulse durante gravação
- **Botão contextual** — alterna entre microfone (quando vazio) e envio (quando há texto)

#### Cabeçalho do Chat
- **Botão voltar** (mobile) para retornar à lista
- **Avatar e nome** do contato/grupo
- **Status** (online / visto por último recentemente / X membros / X inscritos)
- **Botão de chamada de voz** (protocolo `tel:` ou toast informativo)
- **Botão de vídeo chamada** com notificação de início
- **Menu de opções** (⋮):
  - 👤 Ver perfil
  - 🔍 Buscar na conversa
  - 📌 Fixar/Desafixar conversa
  - 🔇 Silenciar/Ativar notificações
  - 🗑️ Limpar conversa
  - 🚫 Bloquear contato

### 📡 Status / Atualizações

- **Criar status de texto** com editor visual:
  - Área de escrita com até 500 caracteres
  - **8 cores de fundo** em gradiente para escolher
  - Pré-visualização em tempo real
  - Botão publicar
- **Status com foto/imagem**:
  - Captura pela **câmera** do dispositivo
  - Seleção pela **galeria** de imagens
  - Adicionar **legenda** à foto
  - Pré-visualização antes de publicar
- **Visualizar status** de contatos com animação
- **Meus status** — seção separada com lista dos seus status publicados
- **Excluir status** individualmente
- **Contador de visualizações** por status
- **Anel de gradiente** indicando status não visto
- **Tempo relativo** (ex: "30min atrás", "2h atrás")

### 🏘️ Comunidades

- **Lista de comunidades** com avatar, descrição, membros e última atividade
- **Criar nova comunidade**:
  - Nome (até 50 caracteres)
  - Descrição (até 150 caracteres)
  - Escolha de **cor do ícone** (8 opções)
  - Toggle **comunidade privada** (apenas convidados)
  - Pré-visualização do avatar
- **Descobrir comunidades**:
  - Lista de comunidades disponíveis para entrar
  - **Busca** por nome ou descrição
  - Botão **"Entrar"** para ingressar
  - Estado vazio quando não há resultados
- **Detalhes da comunidade**:
  - Avatar, nome, descrição e contagem de membros
  - Última atividade
  - **Convidar membros**
  - **Enviar mensagem**
  - **Sair da comunidade**
  - **Excluir comunidade** (apenas para o criador)
- **Indicador de privacidade** (ícone de cadeado)

### 📞 Ligações

- **Histórico de chamadas** com tipos:
  - 📲 Recebida (ícone verde)
  - 📤 Realizada (ícone azul)
  - ❌ Perdida (ícone vermelho, nome em vermelho)
- **Tipo de mídia**: chamada de voz ou vídeo chamada
- **Duração** da chamada exibida
- **Filtros**: Todas / Perdidas
- **Pesquisa** por nome do contato
- **Botões de ação rápida**: ligar (voz) ou vídeo chamada direta
- **Timestamps** inteligentes (hora, dia da semana, data completa)
- **Estado vazio** quando não há ligações

### 👤 Perfil do Usuário

- **Cover gradient** decorativo no topo
- **Avatar grande** com iniciais e botão de câmera para trocar foto
- **Edição inline de perfil**:
  - Nome de exibição
  - Bio
  - Telefone
  - Salvar/Cancelar com feedback via toast
- **Estatísticas**:
  - 💬 Total de mensagens
  - ⏱️ Tempo ativo hoje
  - 🌐 Número de comunidades
- **Informações**:
  - 📧 Email
  - 📱 Telefone
  - 👤 Username (@usuario)
- **Configurações rápidas**:
  - 🌙 Alternar tema claro/escuro
  - 🔔 Notificações
  - 🛡️ Privacidade e Segurança
- **Logout** com confirmação

### ⚙️ Configurações do App

Painel completo acessível pelo ícone ⚙️:

- **Conta**: edição de nome, bio e telefone com salvamento no backend
- **Aparência**: toggle de tema (claro/escuro)
- **Privacidade**: switches para confirmação de leitura e visto por último
- **Notificações**: switch para sons de notificação
- **Sistema**:
  - Limpar cache (localStorage)
  - Sair da conta

### 🎨 Tema & Aparência

- **Tema claro** com paleta azul-cyan limpa
- **Tema escuro** com tons de cinza-azulado
- **Design tokens semânticos** via CSS variables (HSL):
  - `--primary`, `--secondary`, `--accent`, `--muted`
  - `--chat-outgoing`, `--chat-incoming` (bolhas de mensagem)
  - `--sidebar-*` (sidebar customizada)
  - `--destructive`, `--success`, `--warning`
- **Transição suave** entre temas
- **Scrollbar customizada** (6px, arredondada)
- **Tipografia**: Inter + JetBrains Mono

---

## 📁 Estrutura do Projeto

```
src/
├── assets/              # Imagens e assets
├── components/
│   ├── chat/
│   │   ├── ChatView.tsx         # Tela de conversa principal
│   │   ├── ChatHeaderMenu.tsx   # Menu dropdown do cabeçalho
│   │   ├── ConversationList.tsx  # Lista de conversas
│   │   ├── EmojiPicker.tsx      # Seletor de emojis
│   │   ├── StatusView.tsx       # Tela de status/atualizações
│   │   ├── CommunityView.tsx    # Tela de comunidades
│   │   ├── CallsView.tsx        # Tela de ligações
│   │   ├── ProfilePanel.tsx     # Painel de perfil lateral
│   │   └── AppSettingsPanel.tsx # Painel de configurações
│   ├── auth/
│   │   ├── LoginForm.tsx        # Formulário de login
│   │   └── SignupForm.tsx       # Formulário de cadastro
│   └── ui/                      # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx           # Autenticação e perfil
│   ├── ChatContext.tsx           # Estado do chat e mensagens
│   └── ThemeContext.tsx          # Tema claro/escuro
├── hooks/
│   ├── use-mobile.tsx           # Detecção de mobile
│   └── use-toast.ts             # Hook de toast
├── integrations/
│   └── supabase/
│       ├── client.ts            # Cliente Supabase (auto-gerado)
│       └── types.ts             # Tipos do banco (auto-gerado)
├── pages/
│   ├── Index.tsx                # Rota principal (auth gate)
│   ├── AuthPage.tsx             # Página de autenticação
│   ├── ChatPage.tsx             # Layout principal do chat
│   ├── WelcomePage.tsx          # Tela de onboarding
│   └── NotFound.tsx             # Página 404
├── types/
│   └── index.ts                 # Tipos TypeScript do domínio
├── App.tsx                      # Providers e rotas
├── main.tsx                     # Entry point
└── index.css                    # Design tokens e estilos globais
```

---

## 💻 Como Rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar testes
npm run test
```

---

## 🗄️ Banco de Dados

O NEXORA utiliza **Supabase** como backend com as seguintes tabelas:

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis dos usuários (nome, username, avatar, bio, telefone, status online) |
| `conversations` | Conversas (tipo: private, group, channel) |
| `conversation_participants` | Participantes de cada conversa (mute, pin, unread) |
| `messages` | Mensagens (conteúdo, tipo, status, reply) |

### Segurança (RLS)
- Usuários só podem ver conversas das quais participam
- Usuários só podem enviar mensagens em conversas das quais participam
- Usuários só podem editar seu próprio perfil
- Todos os perfis são visíveis para leitura (para exibir nomes e avatares)
- Criação automática de perfil via trigger `handle_new_user`


---

## 📄 Licença

NEXORA © 2025 — Todos os direitos reservados.
