# Paróquia Santa Luzia — site e painel

O site virou uma aplicação React (Vite) e ganhou um painel em `/admin` para
cadastrar os eventos sem mexer no código.

## As três peças

```
NAVEGADOR                    API (Render)              INFRA (Supabase)
┌──────────────┐            ┌──────────────┐          ┌────────────────┐
│ site   /     │──GET──────▶│              │─────────▶│ Postgres       │
│ painel /admin│──POST─────▶│ Express      │          │ (dados)        │
│              │  +token    │ + Prisma     │─────────▶│ Storage        │
└──────────────┘            └──────────────┘          │ (fotos)        │
   Vercel                                             └────────────────┘
```

Site e painel são o mesmo bundle (rotas `/` e `/admin`, ver `src/main.jsx`); o
painel é carregado sob demanda, então quem só visita o site nunca baixa o
código do formulário. A API é um Express separado, em `server/`.

## Rodar na sua máquina

Não precisa de conta em lugar nenhum: o banco cai para SQLite e as fotos vão
para `server/uploads/`.

```bash
# Terminal 1 — API
cd server
npm install
cp .env.example .env      # o padrão de desenvolvimento já serve
npm run banco:dev         # cria o dev.db
npm run dev               # http://localhost:3333

# Terminal 2 — site
npm install
npm run dev               # http://localhost:5173
```

Entre em <http://localhost:5173/admin> com `admin@paroquia.local` / `admin123`
(os padrões de desenvolvimento, avisados no console ao subir a API).

## Como o padre usa

1. Abre `/admin` (também tem o link "Área restrita" no rodapé do site).
2. **Novo evento**: título, categoria, data/hora, local, um resumo curto para o
   card e o texto completo que aparece ao clicar. Capa é obrigatória.
3. **Vídeo (opcional)**: MP4 ou WEBM até 60 MB. No site ele toca sozinho quando
   o visitante passa o mouse sobre o card e para assim que ele tira, voltando
   ao início. Toca **sem som** — não é escolha nossa, todo navegador bloqueia
   som em vídeo que começa sozinho. No celular não existe "passar o mouse",
   então o card mostra a capa e o vídeo aparece com controles ao abrir o
   evento. Por isso a capa continua obrigatória mesmo com vídeo.
4. **Ocultar** tira do site sem apagar — para evento adiado. **Apagar** remove
   o cadastro, as fotos e o vídeo, sem volta.
5. Um evento fica anunciado **durante todo o dia em que acontece**, e some de
   "Próximos Eventos" só no dia seguinte. Se tiver data de término, vale o
   término — um tríduo em andamento continua na lista. Depois disso ele fica na
   aba "Já realizados" do painel.

### "Cadastrei e não apareceu no site"

Quase sempre é a **data**, em geral o ano errado. O formulário avisa em amarelo
quando a data escolhida já passou. Se o aviso apareceu, o evento foi salvo, mas
está em "Já realizados" — basta corrigir a data.

Se o site estava aberto noutra aba, ele recarrega sozinho quando você volta
para ela.

## Decisões que economizam tempo

**Falhar na partida, não na primeira requisição.** `server/src/env.ts` valida a
configuração e mata o processo se faltar algo em produção. Sem as chaves do
Supabase, o servidor cairia para o disco do Render — que é apagado a cada
deploy. O upload pareceria funcionar e a foto sumiria dias depois.

**Fuso carimbado no servidor.** O `<input type="datetime-local">` manda
`2026-12-13T19:30`, sem fuso. `new Date()` leria isso no fuso do processo — que
no Render é UTC — e todo evento entraria 3 horas adiantado. O
`server/src/evento.schema.ts` carimba `-03:00` quando o texto não traz fuso.

**Dois schemas Prisma.** `schema.prisma` (Postgres) e `schema.dev.prisma`
(SQLite), com modelos idênticos. É por isso que `tipo` é String em vez de enum e
`galeria` é JSON em texto: o SQLite não tem nenhum dos dois. **Mexeu num, mexa
no outro.**

**Token HMAC assinado à mão** (`server/src/auth.ts`), não JWT de biblioteca. A
comparação usa `timingSafeEqual`, não `===`: com `===` o tempo de resposta
denuncia quantos bytes bateram, e dá para descobrir a assinatura byte a byte.

**Token no cabeçalho, nunca em cookie.** Site em `vercel.app` e API em
`onrender.com` são domínios diferentes; cookie entre domínios depende do
navegador aceitar terceiros.

**`autenticar` antes do `multer`.** Sem sessão, o arquivo é recusado antes de
ocupar disco e banda.

**A URL completa vai para o banco**, não só o nome do arquivo — senão o front
teria que remontar o endereço e qualquer troca de bucket quebraria as imagens
já cadastradas.

**Uma rota de listagem só.** `GET /api/eventos` usa autenticação *opcional*: sem
token devolve os ativos (site público), com token aceita `incluirInativos`
(painel).

**CORS com lista fechada e barra final normalizada.** Uma barra sobrando na
variável do Render derruba o site inteiro por um caractere invisível.

## Publicar

### 1. Supabase (banco + fotos)

Crie o projeto, e em Storage crie um bucket **público** chamado `eventos`.
Pegue em Settings → API a URL e a chave **`service_role`** (não a `anon`).

### 2. Render (API)

Novo Web Service apontando para este repositório, **Root Directory `server`**:

- Build: `npm install && npm run build && npm run banco:prod`
- Start: `npm start`

Variáveis:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | pooler do Supabase, porta **6543** |
| `DIRECT_URL` | conexão direta, porta **5432** (só a migração usa) |
| `SUPABASE_URL` | `https://SEU_PROJETO.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | a `service_role` |
| `SUPABASE_BUCKET` | `eventos` |
| `CORS_ORIGINS` | o domínio do site na Vercel, sem barra no final |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | o acesso ao painel |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### 3. Vercel (site)

Importe o repositório na raiz (Vite é detectado sozinho). Uma variável:
`VITE_API_URL` = a URL do Render, sem barra no final.

O `vercel.json` já manda toda rota para o `index.html`, senão abrir
`/admin` direto daria 404.

## Dois avisos sobre o plano grátis

**A instância do Render dorme após 15 minutos parada.** A primeira visita do dia
leva uns 30 segundos. O site já lida com isso: mostra blocos cinzas e a
mensagem "acordando o servidor" em vez de parecer quebrado. Para evitar,
aponte um monitor de uptime (UptimeRobot, por exemplo) para
`SUA_API/api/saude` a cada 10 minutos.

**A `SUPABASE_SERVICE_ROLE_KEY` dá acesso total ao banco.** Ela só pode existir
no Render. Nunca numa variável `VITE_*` — tudo que começa com `VITE_` vai para
dentro do bundle que o visitante baixa.

## Mapa dos arquivos

```
src/
  Site.jsx                 monta a página pública
  components/              uma seção por arquivo
  admin/                   Login, ListaDeEventos, FormularioDeEvento
  hooks/                   scroll, revelação, liturgia, eventos
  lib/api.js               cliente único da API (site e painel)
  lib/datas.js             formatação no fuso de São Paulo
  styles.css               o CSS original, intacto

server/src/
  env.ts                   validação da configuração na partida
  auth.ts                  token HMAC + middlewares
  storage.ts               Supabase ou disco local, mesma interface
  evento.schema.ts         validação com Zod
  evento.service.ts        regras (corte por data, ordenação)
  rotas/
```
