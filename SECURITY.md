# Segurança

## Encontrou uma falha?

Avise em particular, pelo site do desenvolvedor: <https://caiodiniz.dev.br>.
Por favor, **não abra uma issue pública** com os detalhes antes da correção —
o painel guarda o acesso da paróquia e os dados dos eventos.

Ajuda muito mandar:

- o endereço afetado (site, `/admin` ou a API);
- o passo a passo para reproduzir;
- o que um atacante conseguiria fazer.

## O que já existe de proteção

| Camada | Proteção |
|---|---|
| Site (Vercel) | CSP só com as origens usadas, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy`, painel fora dos buscadores |
| Login | 8 erros bloqueiam o IP por 15 min, pausa em cada erro, comparação em tempo constante, log de auditoria |
| Sessão | token HMAC de 12 h, amarrado à senha atual: trocar `ADMIN_PASSWORD` derruba todas as sessões |
| API | limite de 300 requisições/min por IP (60/min para gravar), JSON de até 100 KB, CORS fechado |
| Uploads | tipo e **conteúdo** conferidos (assinatura binária), extensão pelo tipo, 8 MB por imagem, temporários sempre apagados |
| Configuração | em produção a API não sobe com senha fraca ou variável faltando |
| Dependências | Dependabot semanal e `npm audit` no CI |

Os detalhes de cada decisão estão em `LEIAME-ADMIN.md`, na seção
"Segurança do painel".
