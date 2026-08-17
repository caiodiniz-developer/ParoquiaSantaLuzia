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

## Vídeo de fundo na primeira tela

A primeira tela do site (o "hero") está preparada para receber um vídeo de fundo
da igreja. **Hoje não há nenhum**, e por isso ela mostra a foto — que continua
sendo o fundo em todos os casos em que o vídeo não entra. Nada precisa ser
ligado ou desligado: o site descobre sozinho se o arquivo existe.

### Como colocar

Ponha o arquivo em `public/assets/` com este nome exato:

| Arquivo | Precisa? |
|---|---|
| `public/assets/hero.mp4` | **Sim.** É o que toca em iPhone e iPad. |
| `public/assets/hero.webm` | Opcional. Se existir, o Chrome e o Firefox usam ele, que fica menor com a mesma qualidade. |

Depois é só publicar (commit + push). O site passa a usar o vídeo no próximo
deploy da Vercel. Para tirar o vídeo do ar, apague o arquivo e publique de novo.

> Se você puser **só** o `hero.webm`, quem usa iPhone continuará vendo a foto —
> o Safari não toca WEBM. Na dúvida, mande só o `hero.mp4`: funciona em todos.

### Como o vídeo precisa ser

| | Recomendado |
|---|---|
| Enquadramento | Deitado (paisagem), 16:9 |
| Resolução | 1920×1080, ou 1280×720 se o arquivo ficar pesado |
| Duração | 12 a 25 segundos |
| Peso | **até 4 MB.** Acima disso, corte a duração ou baixe a resolução |
| Som | não precisa; pode remover. O vídeo toca **sempre mudo** |
| Movimento | câmera parada ou movimento bem lento |

Três avisos que mudam o resultado:

1. **Ele fica em laço.** Termina e recomeça, sem parar. Escolha um trecho em que
   o fim e o começo pareçam o mesmo lugar — uma câmera parada na fachada, ou um
   giro lento que volta de onde saiu. Um trecho que termina num lugar diferente
   dá um "pulo" visível a cada volta.
2. **Ele fica escurecido, atrás do texto de boas-vindas.** Filme algo que
   funcione como cenário, não como informação: a fachada, o altar, a luz
   entrando pelas janelas. Um vídeo com pessoas falando ou com letreiro não vai
   dar certo, porque metade dele fica coberta.
3. **Precisa ser filmagem da nossa igreja.** Vídeo de banco de imagens ou de
   outra paróquia apresentado como sendo daqui é mentira com a comunidade.

### Quando ele NÃO toca (e isso é de propósito)

O vídeo só entra quando não atrapalha ninguém. Em todos os casos abaixo o
visitante vê a foto de fundo de sempre, sem nada quebrado e sem esperar:

- **No celular.** São megabytes num plano que costuma ser pré-pago, para um
  fundo que na tela em pé aparece cortado em uma tira estreita. O celular fica
  com a foto, que foi enquadrada para isso.
- **Com "economia de dados" ligada**, ou em conexão de 2G.
- **Quando a pessoa pediu menos animação** nas configurações do celular ou do
  computador (é comum em quem sente tontura com movimento na tela, e liga
  sozinho no modo de economia de bateria do Windows).
- **Enquanto o vídeo não estiver pronto para tocar.** Ele só aparece depois de
  já estar rodando, e entra com uma transição de um segundo e meio. Se o
  arquivo estiver corrompido ou num formato que aquele navegador não conhece,
  ele simplesmente nunca aparece — a foto fica.

### Para quem for mexer no código

A existência do arquivo é decidida **na build**, em `vite.config.js`, e chega ao
site como a constante `__FONTES_DO_VIDEO_DO_HERO__`. Não há nenhuma verificação
pela rede: sem o arquivo, o elemento `<video>` nem chega a existir na página.
Isso é o que garante que hoje, sem vídeo nenhum, o console do visitante fique
limpo. O resto da lógica está em `src/components/VideoDeFundoDoHero.jsx`.

Rodando `npm run dev`, largar ou apagar o arquivo reinicia o servidor sozinho.

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
    VideoDeFundoDoHero.jsx vídeo da primeira tela (ver a seção acima)
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
