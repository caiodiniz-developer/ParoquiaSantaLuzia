import { useEffect } from "react";

const ID = "dados-estruturados-eventos";

const LOCAL_PADRAO = {
  "@type": "Place",
  name: "Igreja Matriz de Santa Luzia",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua René Fernandes, 71",
    addressLocality: "Campinas",
    addressRegion: "SP",
    addressCountry: "BR",
  },
};

/**
 * Publica os proximos eventos como dados estruturados (schema.org/Event).
 *
 * E o que permite ao Google mostrar "Festa de Santa Luzia · 13 dez" direto no
 * resultado da busca. Os eventos chegam da API depois que a pagina abre, por
 * isso o bloco e montado aqui e nao no index.html; o Google le JSON-LD
 * inserido por JavaScript. Nao e script executavel: a CSP nao o bloqueia.
 */
export function useDadosEstruturadosDeEventos(eventos) {
  useEffect(() => {
    if (!eventos.length) return undefined;

    const origem = window.location.origin;
    const dados = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: eventos.map((evento, indice) => ({
        "@type": "ListItem",
        position: indice + 1,
        item: {
          "@type": "Event",
          name: evento.titulo,
          startDate: evento.comecaEm,
          ...(evento.terminaEm && { endDate: evento.terminaEm }),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: evento.local ? { ...LOCAL_PADRAO, name: evento.local } : LOCAL_PADRAO,
          image: [evento.coverUrl],
          description: evento.resumo || evento.titulo,
          url: `${origem}/?evento=${evento.id}`,
          organizer: { "@type": "Organization", name: "Paróquia Santa Luzia", url: origem },
        },
      })),
    };

    const bloco = document.createElement("script");
    bloco.type = "application/ld+json";
    bloco.id = ID;
    bloco.textContent = JSON.stringify(dados);
    document.getElementById(ID)?.remove();
    document.head.appendChild(bloco);

    return () => bloco.remove();
  }, [eventos]);
}
