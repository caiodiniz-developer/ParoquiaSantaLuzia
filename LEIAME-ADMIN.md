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

Entre em <http://localhost:5173/admin> com o `ADMIN_EMAIL` e o `ADMIN_PASSWORD`
do seu `server/.env`. Se você apagar essas duas linhas, valem os padrões de
desenvolvimento `admin@paroquia.local` / `admin123`, avisados no console ao
subir a API.

**Puxou uma versão nova do código?** Rode `npm run banco:dev` de novo dentro de
`server/`: ele acrescenta ao `dev.db` as colunas novas (como o `instagramUrl`)
sem apagar os eventos que já estão lá. Em produção não precisa fazer nada — o
build do Render já roda o `banco:prod`.

### Testes

```bash
cd server
npm test        # 33 testes: login, bloqueio, eventos, Instagram, galeria, config
```

Os testes sobem a API numa porta livre, usam o `dev.db` e apagam tudo o que
criam (eventos e fotos). O GitHub roda os mesmos testes e a build do site a
cada push na `main` (`.github/workflows/ci.yml`).

## Como o padre usa

1. Abre `/admin` (também tem o link "Área restrita" no rodapé do site).
2. **Novo evento**: título, categoria, data/hora, local, um resumo curto para o
   card e o texto completo que aparece ao clicar. Capa é obrigatória. À direita
   do formulário aparece a **prévia do card** exatamente como ficará no site.
   **Instagram (opcional)**: cole o link do post sobre o evento — também vale
   `instagram.com/...` sem o `https://` ou só o `@perfil`. No site, o card ganha
   um selo do Instagram e o evento aberto mostra o botão "Ver no Instagram". Só
   links do Instagram são aceitos.
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

### Link de um evento (para o Instagram e o WhatsApp)

Na lista do painel, **Copiar link** copia o endereço do evento, no formato
`https://SEU_SITE/?evento=...`. Quem abre esse link cai direto no site com o
evento aberto na tela — é o link para pôr na legenda do post ou mandar no grupo
da comunidade. Evento oculto não tem link: o botão fica desligado.

### Eventos que se repetem: Duplicar

Terço de toda quarta, missa de todo dia 13: em vez de cadastrar de novo, use
**Duplicar**. A cópia leva texto, fotos, vídeo e links, e nasce **oculta** e sem
destaque, com "(cópia)" no título — senão ela apareceria repetida no site. O
painel já abre a cópia para você trocar a data, ajustar o título e marcar
"Visível no site". As fotos da cópia são arquivos próprios: apagar uma das
versões não apaga as fotos da outra.

### Configurações

Em **Configurações**, no topo do painel, você escolhe quantos eventos aparecem
em "Próximos Eventos" no site (de 1 a 24; o padrão é 6). Os que ficarem de fora
continuam cadastrados e entram sozinhos conforme as datas passam.

### "Cadastrei e não apareceu no site"

Quase sempre é a **data**, em geral o ano errado. O formulário avisa em amarelo
quando a data escolhida já passou. Se o aviso apareceu, o evento foi salvo, mas
está em "Já realizados" — basta corrigir a data.

Se o site estava aberto noutra aba, ele recarrega sozinho quando você volta
para ela. Ao salvar, o painel também diz onde o evento foi parar: no site,
oculto ou em "Já realizados".

### "O painel me mandou entrar de novo"

A sessão dura 12 horas. Quando ela vence, o painel volta sozinho para a tela de
login com o aviso "Sua sessão expirou" — antes disso acontecer no meio de um
cadastro, porque o formulário pede confirmação se você tentar sair com coisa
não salva. Clicar em **Sair** numa aba encerra a sessão em todas as abas.

Ele também sai sozinho depois de **30 minutos sem uso** (nenhum clique nem
tecla), para o painel não ficar aberto no computador da secretaria. E se a
senha for trocada no Render, todo mundo que estava logado precisa entrar de
novo — de propósito.

Na tela de login, **Mostrar** revela a senha digitada, e um aviso aparece se o
**Caps Lock** estiver ligado: cada senha errada conta para o bloqueio.

### "Muitas tentativas de login"

Depois de 8 senhas erradas seguidas, aquele computador espera 15 minutos para
tentar de novo. É a proteção contra quem tenta adivinhar a senha. Acertar a
senha zera a contagem.

### "A foto foi recusada"

Cada imagem pode ter até 8 MB (JPG, PNG, WEBP, AVIF ou GIF), e a galeria até 6
fotos. O formulário avisa na hora em que a foto é escolhida, antes de enviar.
Foto de celular costuma passar de 8 MB: mande pelo WhatsApp para você mesmo e
use a versão que ele devolve, que já vem reduzida.

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

**Evento oculto é invisível de verdade.** O detalhe `GET /api/eventos/:id` sem
token responde 404 para evento oculto — igual a um que não existe, para não
confirmar que o id é válido.

### Rotas da API

| Método | Rota | Sessão | O que faz |
|---|---|---|---|
| GET | `/api/saude` | — | responde se a API está no ar (monitor de uptime) |
| POST | `/api/auth/login` | — | troca e-mail e senha por um token de 12 horas |
| GET | `/api/auth/eu` | sim | confere o token e diz quando ele expira |
| GET | `/api/eventos?escopo=proximos|realizados|todos` | opcional | lista; com sessão aceita `incluirInativos=true` |
| GET | `/api/eventos/:id` | opcional | detalhe; oculto só com sessão |
| POST | `/api/eventos` | sim | cria (multipart: `capa`, `video`, `galeria`) |
| PATCH | `/api/eventos/:id` | sim | edita só o que veio; `galeriaMantida` e `removerVideo` controlam arquivos |
| PATCH | `/api/eventos/:id/ativo` | sim | mostra ou oculta no site |
| POST | `/api/eventos/:id/duplicar` | sim | cria cópia oculta com arquivos próprios |
| DELETE | `/api/eventos/:id` | sim | apaga o evento e os arquivos |
| GET | `/api/config` | — | ajustes do site |
| PUT | `/api/config` | sim | salva ajustes |

### Segurança do painel

- **Limite de tentativas** (`server/src/limitador.ts`): 8 senhas erradas seguidas
  bloqueiam o IP por 15 minutos. Em produção a API confia no proxy do Render
  (`trust proxy`) para ler o IP real; sem isso todo visitante dividiria o mesmo
  contador.
- **Senha fraca não sobe**: em produção, `ADMIN_PASSWORD` com menos de 10
  caracteres ou igual à do exemplo derruba a partida, como variável faltando.
- **Senha comparada por resumo** SHA-256, de tamanho fixo: o tempo de resposta
  não denuncia quantos caracteres ela tem.
- **Links**: o de inscrição só aceita `http`/`https` (o `.url()` do Zod aceitaria
  `javascript:`), e o do Instagram só domínios do Instagram.
- **Extensão pelo tipo, não pelo nome**: um arquivo enviado como `foto.html` com
  tipo `image/png` é gravado como `.png`. Junto com o `nosniff`, nenhum upload
  vira página executável.
- **Uploads desfeitos em caso de erro**: se o banco falhar depois do envio, as
  fotos que já subiram são apagadas; temporários do multer também são limpos
  quando o formulário é recusado.
- **Conteúdo conferido, não só o rótulo** (`server/src/assinaturas.ts`): os
  primeiros bytes de cada arquivo precisam ser de JPG, PNG, WEBP, AVIF, GIF,
  MP4 ou WEBM. Um HTML ou executável com o rótulo `image/png` é recusado.
- **Limite geral de requisições**: 300 por minuto por IP em toda a API e 60 por
  minuto no que grava (cadastro, edição, upload, apagar). A rota `/api/saude`
  fica fora da conta, para o monitor de uptime.
- **Sessão amarrada à senha**: a assinatura do token usa o `AUTH_SECRET` junto
  com o e-mail e a senha do admin. Trocar `ADMIN_PASSWORD` no Render derruba
  na hora todas as sessões abertas — o remédio certo se a senha vazar.
- **Login mais lento para quem erra**: cada senha errada espera 0,4 s, e toda
  tentativa vai para o log do Render (`[auth] login-falhou ip=... email=...`),
  sem a senha.
- **Painel parado sai sozinho** em 30 minutos sem clique ou tecla, pensando no
  computador da secretaria usado por outras pessoas.
- **Cabeçalhos**: HSTS em produção, `Cache-Control: no-store` em toda resposta
  para quem está logado, JSON de até 100 KB e CORS só com os métodos e
  cabeçalhos usados.

### Segurança do site (Vercel)

O `vercel.json` manda, em toda página: CSP (só scripts do próprio domínio;
imagens, vídeos e dados só das origens que o site usa), HSTS, `X-Frame-Options:
DENY` (o site não pode ser embutido em outra página para golpe de clique),
`nosniff`, `Referrer-Policy` e `Permissions-Policy` (sem câmera, microfone,
localização nem pagamento). O `/admin` vai com `X-Robots-Tag: noindex`.

### Dependências

O Dependabot (`.github/dependabot.yml`) abre um pull request por semana com as
atualizações, e o CI roda `npm audit` nas dependências de produção: falha alta
ou crítica deixa o CI vermelho. As falhas que restam no Vite atingem só o
servidor de desenvolvimento, não o site publicado.

## Publicar

### 1. Supabase (banco + fotos)

Crie o projeto, e em Storage crie um bucket **público** chamado `eventos`.
Pegue em Settings → API a URL e a chave **`service_role`** (não a `anon`).

### 2. Render (API)

Existe um `render.yaml` na raiz. No Render: **New → Blueprint**, aponte para
este repositório e ele monta o serviço sozinho (root `server`, build, start,
health check em `/api/saude` e região Virginia, a gratuita mais perto do
Brasil). O `AUTH_SECRET` é gerado automaticamente.

Ele vai pedir só os valores que não podem morar no repositório: `DATABASE_URL`,
`DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`,
`ADMIN_EMAIL` e `ADMIN_PASSWORD`.

**A ordem importa:** o `CORS_ORIGINS` precisa do domínio da Vercel, e o
`VITE_API_URL` da Vercel precisa da URL do Render. Suba o Render primeiro com
um `CORS_ORIGINS` provisório, pegue a URL, configure a Vercel, e então volte e
corrija o `CORS_ORIGINS` com o domínio final.

Se preferir criar na mão em vez do Blueprint, é Web Service com **Root
Directory `server`**, build `npm ci && npm run build && npm run banco:prod` e
start `npm start`. As variáveis são estas:

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

Importe o repositório na raiz. Uma variável: `VITE_API_URL` = a URL do Render,
sem barra no final.

> **Atenção à CSP.** O `vercel.json` manda uma política de segurança (CSP) que
> só deixa o site buscar dados em endereços conhecidos: `*.onrender.com`,
> `*.supabase.co` e as duas APIs da liturgia. Se um dia a API for para um
> domínio próprio (ex.: `api.paroquia.com.br`), acrescente esse domínio no
> `connect-src` do `vercel.json` — senão o site não carrega os eventos e o
> painel não consegue entrar, com "Refused to connect" no console.

Sobre o `vercel.json` — ele é validado por um schema estrito, e **qualquer chave
a mais faz o deploy falhar antes do build**, com "Invalid request". Não dá para
deixar comentário dentro dele; por isso a explicação está aqui:

```json
"rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
```

Toda rota vai para o `index.html`, senão abrir `/admin` direto daria 404. O
`(?!api/)` exclui a API de propósito: sem ele, um `VITE_API_URL` esquecido faria
`/api/eventos` devolver a própria página HTML com status 200, e o erro apareceria
como "JSON inválido" em vez de "API não configurada".

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
    Eventos.jsx            cards de "Próximos Eventos"
    ModalDeEvento.jsx      evento aberto (Instagram, inscrição, galeria)
    VideoDeFundoDoHero.jsx vídeo da primeira tela (ver a seção acima)
  admin/
    Admin.jsx              sessão, menu e rotas do painel
    Login.jsx
    ListaDeEventos.jsx     busca, copiar link, duplicar, ocultar, apagar
    FormularioDeEvento.jsx cadastro e edição, com validação das fotos
    PreviaDoCard.jsx       o card como vai ficar no site
    Configuracoes.jsx      quantos eventos aparecem no site
  hooks/
    useEventos.js          lista de eventos (com aviso de servidor acordando)
    useEventoDaUrl.js      o ?evento=ID que abre um evento direto
    useConfiguracoes.js    ajustes salvos pelo painel
  lib/api.js               cliente único da API (site e painel)
  lib/datas.js             formatação no fuso de São Paulo
  estilos/                 o visual do site, um arquivo por seção

server/src/
  env.ts                   validação da configuração na partida
  auth.ts                  token HMAC + middlewares
  limitador.ts             limite de tentativas de login
  storage.ts               Supabase ou disco local, mesma interface
  evento.schema.ts         validação com Zod (datas, links, Instagram)
  evento.service.ts        regras (corte por data, ordenação, duplicar)
  rotas/                   auth, eventos, configurações

server/test/               testes da API (npm test)
.github/workflows/ci.yml   testes e build a cada push
```
