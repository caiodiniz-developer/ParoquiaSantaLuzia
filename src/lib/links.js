// Defesa em profundidade para links que vem da API.
//
// A API ja so aceita http/https (e o Instagram so do instagram.com). Mas se
// um registro entrar no banco por outro caminho -- um script, um ajuste manual
// no Supabase --, o site nao pode virar o lugar onde um "javascript:" ganha um
// botao bonito. Aqui o link so passa se for http(s) de verdade.

export function linkSeguro(url) {
  if (typeof url !== "string") return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
