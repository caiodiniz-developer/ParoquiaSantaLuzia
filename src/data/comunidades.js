// Horarios das comunidades. Sao fixos e mudam uma ou duas vezes por ano, entao
// vivem no codigo mesmo -- nao valeria uma tabela no banco e uma tela no painel.
export const comunidades = [
  {
    nome: "Igreja Matriz de Santa Luzia",
    endereco: "Rua Rene Fernandes, n.71 - Jardim dos Oliveiras",
    destaque: true,
    horarios: [
      { dia: "Domingo", itens: ["7hs: Missa", "10hs: Missa"] },
      {
        dia: "Segunda-feira",
        itens: ["4a Segunda do mes, 19h30: Escola da Fe"],
      },
      {
        dia: "Quarta-feira",
        itens: ["7h30: Missa com Novena de Nossa Senhora do Perpetuo Socorro"],
      },
      {
        dia: "Quinta-feira",
        itens: ["14hs as 17hs: Brecho no Salao Paroquial"],
      },
      {
        dia: "Sexta-feira",
        itens: [
          "1a Sexta do mes, 7h30: Missa do Sagrado Coracao de Jesus, com Adoracao e Bencao do Santissimo Sacramento",
          "19hs: Terco dos Homens",
        ],
      },
      {
        dia: "Sabado",
        itens: [
          "9hs as 12: Brecho no Salao Paroquial",
          "9hs: Aula de Violao",
          "10hs: Aula de Tecnica Vocal",
          "18h30: Missa",
        ],
      },
    ],
    extra:
      "Missa com Novena de Santa Luzia: Dia 13 de cada mes - Quando as segundas-feiras, as 19h30. Quando as tercas, quartas, quintas ou sextas-feiras, as 7h30.",
  },
  {
    nome: "Comunidade Sao Francisco de Assis",
    endereco: "Rua Kokira, n. 99 - Jardim Amazonas",
    horarios: [
      { dia: "Quarta-feira", itens: ["2a Quarta do mes, 19h30: Missa"] },
      {
        dia: "Quinta-feira",
        itens: ["15hs: Terco da Misericordia e Terco Mariano"],
      },
      { dia: "Domingo", itens: ["08h30: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    nome: "Comunidade Sao Nicolau de Flue",
    endereco: "Rua Vicente Celestino, n.353 - Jardim Antonio Von Zuben",
    horarios: [
      { dia: "Quarta-feira", itens: ["19h30: Santo Terco"] },
      {
        dia: "Sexta-feira",
        itens: [
          "1a Sexta do mes, 19h30: Missa do Sagrado Coracao de Jesus, com Adoracao e Bencao do Santissimo Sacramento",
        ],
      },
      { dia: "Domingo", itens: ["8h30: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    nome: "Comunidade Bom Pastor",
    endereco: "Rua Francisco de Campos Abreu, n.1.411 - Vila Georgina",
    horarios: [
      { dia: "Quarta-feira", itens: ["19hs: Santo Terco"] },
      {
        dia: "Sexta-feira",
        itens: ["1a Sexta do mes, 19hs: Devocao do Sagrado Coracao de Jesus"],
      },
      { dia: "Domingo", itens: ["08h30: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    nome: "Betania Franciscana",
    endereco: "Rua Praxiteles Ferreira Neves, n.101 - Vila Georgina",
    horarios: [
      { dia: "Segunda a sabado", itens: ["7h: Missa"] },
      { dia: "Domingo", itens: ["16h: Missa"] },
    ],
  },
  {
    nome: "Comunidade Nossa Senhora Aparecida",
    endereco: "Rua Caminho da Administracao, n. 17 - Bairro da Vitoria",
    horarios: [
      { dia: "Quarta-feira", itens: ["1a Quarta, 19h30: Missa"] },
      { dia: "Sexta-feira", itens: ["19hs: Santo Terco"] },
      { dia: "Sabado", itens: ["17hs: Missa"] },
    ],
  },
  {
    nome: "Comunidade Nossa Senhora de Fatima",
    endereco: "Rua Agnaldo Macedo, n. 412 - Vila Ipe",
    horarios: [
      { dia: "Terca-feira", itens: ["15hs: Santo Terco"] },
      {
        dia: "Quarta-feira",
        itens: [
          "15hs: Adoracao ao Santissimo Sacramento",
          "4a Quarta de mes, 19:30hs: Missa",
        ],
      },
      { dia: "Sabado", itens: ["17hs: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    nome: "Comunidade Nossa Senhora de Lourdes",
    endereco: "Rua Francisco de Campos Abreu, n. 223 - Vila Georgina",
    horarios: [
      { dia: "Segunda, Quarta e Sexta", itens: ["7h30: Santo Terco"] },
      {
        dia: "Terca-feira",
        itens: [
          "14h: Artesanato no Salao Social",
          "19h30: Momento de Oracao, Forca e Fe",
        ],
      },
      {
        dia: "Sabado",
        itens: ["16h30: Santo Terco", "17hs: Missa/Celebracao da Palavra"],
      },
    ],
  },
  {
    nome: "Comunidade Santa Teresinha do Menino Jesus",
    endereco: "Rua Irineu Chechia, n.57 - Vila Marieta",
    horarios: [
      {
        dia: "Terca-feira",
        itens: ["14h30 as 17h30: Clubinho do Artesanato no Salao Social"],
      },
      { dia: "Quarta-feira", itens: ["3a Quarta do mes, 19h30: Missa"] },
      {
        dia: "Quinta-feira",
        itens: ["15hs: Adoracao ao Santissimo Sacramento"],
      },
      { dia: "Domingo", itens: ["8h30: Missa/Celebracao da Palavra"] },
    ],
  },
];
