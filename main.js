/* =========================================================
   DATA - COMUNIDADES
   ========================================================= */
var communities = [
  {
    name: "Igreja Matriz de Santa Luzia",
    address: "Rua Rene Fernandes, n.71 - Jardim dos Oliveiras",
    featured: true,
    schedule: [
      { day: "Domingo", items: ["7hs: Missa", "10hs: Missa"] },
      {
        day: "Segunda-feira",
        items: ["4a Segunda do mes, 19h30: Escola da Fe"],
      },
      {
        day: "Quarta-feira",
        items: ["7h30: Missa com Novena de Nossa Senhora do Perpetuo Socorro"],
      },
      {
        day: "Quinta-feira",
        items: ["14hs as 17hs: Brecho no Salao Paroquial"],
      },
      {
        day: "Sexta-feira",
        items: [
          "1a Sexta do mes, 7h30: Missa do Sagrado Coracao de Jesus, com Adoracao e Bencao do Santissimo Sacramento",
          "19hs: Terco dos Homens",
        ],
      },
      {
        day: "Sabado",
        items: [
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
    name: "Comunidade Sao Francisco de Assis",
    address: "Rua Kokira, n. 99 - Jardim Amazonas",
    schedule: [
      { day: "Quarta-feira", items: ["2a Quarta do mes, 19h30: Missa"] },
      {
        day: "Quinta-feira",
        items: ["15hs: Terco da Misericordia e Terco Mariano"],
      },
      { day: "Domingo", items: ["08h30: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    name: "Comunidade Sao Nicolau de Flue",
    address: "Rua Vicente Celestino, n.353 - Jardim Antonio Von Zuben",
    schedule: [
      { day: "Quarta-feira", items: ["19h30: Santo Terco"] },
      {
        day: "Sexta-feira",
        items: [
          "1a Sexta do mes, 19h30: Missa do Sagrado Coracao de Jesus, com Adoracao e Bencao do Santissimo Sacramento",
        ],
      },
      { day: "Domingo", items: ["8h30: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    name: "Comunidade Bom Pastor",
    address: "Rua Francisco de Campos Abreu, n.1.411 - Vila Georgina",
    schedule: [
      { day: "Quarta-feira", items: ["19hs: Santo Terco"] },
      {
        day: "Sexta-feira",
        items: ["1a Sexta do mes, 19hs: Devocao do Sagrado Coracao de Jesus"],
      },
      { day: "Domingo", items: ["08h30: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    name: "Betania Franciscana",
    address: "Rua Praxiteles Ferreira Neves, n.101 - Vila Georgina",
    schedule: [
      { day: "Segunda a sabado", items: ["7h: Missa"] },
      { day: "Domingo", items: ["16h: Missa"] },
    ],
  },
  {
    name: "Comunidade Nossa Senhora Aparecida",
    address: "Rua Caminho da Administracao, n. 17 - Bairro da Vitoria",
    schedule: [
      { day: "Quarta-feira", items: ["1a Quarta, 19h30: Missa"] },
      { day: "Sexta-feira", items: ["19hs: Santo Terco"] },
      { day: "Sabado", items: ["17hs: Missa"] },
    ],
  },
  {
    name: "Comunidade Nossa Senhora de Fatima",
    address: "Rua Agnaldo Macedo, n. 412 - Vila Ipe",
    schedule: [
      { day: "Terca-feira", items: ["15hs: Santo Terco"] },
      {
        day: "Quarta-feira",
        items: [
          "15hs: Adoracao ao Santissimo Sacramento",
          "4a Quarta de mes, 19:30hs: Missa",
        ],
      },
      { day: "Sabado", items: ["17hs: Missa/Celebracao da Palavra"] },
    ],
  },
  {
    name: "Comunidade Nossa Senhora de Lourdes",
    address: "Rua Francisco de Campos Abreu, n. 223 - Vila Georgina",
    schedule: [
      { day: "Segunda, Quarta e Sexta", items: ["7h30: Santo Terco"] },
      {
        day: "Terca-feira",
        items: [
          "14h: Artesanato no Salao Social",
          "19h30: Momento de Oracao, Forca e Fe",
        ],
      },
      {
        day: "Sabado",
        items: ["16h30: Santo Terco", "17hs: Missa/Celebracao da Palavra"],
      },
    ],
  },
  {
    name: "Comunidade Santa Teresinha do Menino Jesus",
    address: "Rua Irineu Chechia, n.57 - Vila Marieta",
    schedule: [
      {
        day: "Terca-feira",
        items: ["14h30 as 17h30: Clubinho do Artesanato no Salao Social"],
      },
      { day: "Quarta-feira", items: ["3a Quarta do mes, 19h30: Missa"] },
      {
        day: "Quinta-feira",
        items: ["15hs: Adoracao ao Santissimo Sacramento"],
      },
      { day: "Domingo", items: ["8h30: Missa/Celebracao da Palavra"] },
    ],
  },
];

/* =========================================================
   HERO INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  // Hero loaded animation
  setTimeout(function () {
    document.querySelector(".hero").classList.add("loaded");
  }, 300);

  // Create particles
  createParticles();
  // Build carousel
  initCarousel();
  // Init all event listeners
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initActiveNav();
  initBackToTop();
  initScrollProgress();
  initCharCounter();
  initContactForm();
  initParallax();
  // Load Liturgia do Dia
  loadLiturgia();
});

/* =========================================================
   HERO PARTICLES
   ========================================================= */
function createParticles() {
  var container = document.getElementById("heroParticles");
  if (!container) return;
  for (var i = 0; i < 20; i++) {
    var p = document.createElement("div");
    p.className = "particle";
    var size = Math.random() * 6 + 3;
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.top = Math.random() * 100 + "%";
    p.style.animationDuration = Math.random() * 4 + 4 + "s";
    p.style.animationDelay = Math.random() * 3 + "s";
    p.style.opacity = Math.random() * 0.4 + 0.1;
    container.appendChild(p);
  }
}

/* =========================================================
   CAROUSEL
   ========================================================= */
function buildCard(c) {
  var card = document.createElement("div");
  card.className = "community-card" + (c.featured ? " featured" : "");

  var scheduleHTML = "";
  c.schedule.forEach(function (s) {
    scheduleHTML += '<p class="schedule-day">' + s.day + "</p>";
    s.items.forEach(function (item) {
      scheduleHTML += '<p class="schedule-item">- ' + item + "</p>";
    });
  });

  var extraHTML = c.extra
    ? '<div class="card-extra">' + c.extra + "</div>"
    : "";
  var badgeHTML = c.featured
    ? '<span class="card-badge">Sede da Paroquia</span>'
    : "";

  card.innerHTML =
    '<div class="card-header">' +
    '<div class="card-header-inner">' +
    '<span class="card-cross"><svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="10" y1="0" x2="10" y2="28"/><line x1="3" y1="8" x2="17" y2="8"/></svg></span>' +
    "<div>" +
    '<p class="card-name">' +
    c.name +
    "</p>" +
    '<p class="card-address"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
    c.address +
    "</p>" +
    "</div>" +
    "</div>" +
    badgeHTML +
    "</div>" +
    '<div class="card-body">' +
    '<p class="card-body-label">Horarios da Comunidade</p>' +
    scheduleHTML +
    extraHTML +
    "</div>" +
    '<div class="card-footer">Clique para ver todos os horarios</div>';

  card.addEventListener("click", function () {
    var isExpanded = card.classList.contains("expanded");
    document
      .querySelectorAll(".community-card.expanded")
      .forEach(function (c2) {
        c2.classList.remove("expanded");
        c2.querySelector(".card-footer").textContent =
          "Clique para ver todos os horarios";
      });
    if (!isExpanded) {
      card.classList.add("expanded");
      card.querySelector(".card-footer").textContent = "Clique para recolher";
    }
  });

  card.addEventListener("mouseenter", function () {
    document.getElementById("carouselTrack").classList.add("paused");
  });
  card.addEventListener("mouseleave", function () {
    document.getElementById("carouselTrack").classList.remove("paused");
  });

  return card;
}

function initCarousel() {
  var track = document.getElementById("carouselTrack");
  if (!track) return;
  var all = communities.concat(communities);
  all.forEach(function (c) {
    track.appendChild(buildCard(c));
  });
}

/* =========================================================
   NAVBAR SCROLL
   ========================================================= */
function initNavbar() {
  var navbar = document.getElementById("navbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

/* =========================================================
   MOBILE MENU
   ========================================================= */
function initMobileMenu() {
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
    document.body.style.overflow = mobileMenu.classList.contains("open")
      ? "hidden"
      : "";
  });

  document.querySelectorAll(".mobile-link").forEach(function (link) {
    link.addEventListener("click", function () {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
      document.body.style.overflow = "";
    });
  });
}

/* =========================================================
   SCROLL REVEAL (IntersectionObserver)
   ========================================================= */
function initScrollReveal() {
  var observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate",
    )
    .forEach(function (el) {
      observer.observe(el);
    });
}

/* =========================================================
   COUNTER ANIMATION
   ========================================================= */
function initCounters() {
  var countersAnimated = false;
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          document.querySelectorAll(".stat-number").forEach(function (counter) {
            var target = parseInt(counter.getAttribute("data-target"));
            var suffix = counter.getAttribute("data-suffix") || "";
            var duration = 2000;
            var startTime = null;

            function animate(currentTime) {
              if (!startTime) startTime = currentTime;
              var progress = Math.min((currentTime - startTime) / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              var current = Math.floor(eased * target);
              counter.textContent = current + suffix;
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                counter.textContent = target + suffix;
              }
            }
            requestAnimationFrame(animate);
          });
        }
      });
    },
    { threshold: 0.5 },
  );

  var statsBar = document.querySelector(".stats-bar");
  if (statsBar) counterObserver.observe(statsBar);
}

/* =========================================================
   ACTIVE NAV LINK
   ========================================================= */
function initActiveNav() {
  var sections = document.querySelectorAll("section[id]");
  var navLinksAll = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", function () {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute("id");
      if (scrollY >= top && scrollY < top + height) {
        navLinksAll.forEach(function (a) {
          a.classList.remove("active");
          if (a.getAttribute("href") === "#" + id) {
            a.classList.add("active");
          }
        });
      }
    });
  });
}

/* =========================================================
   BACK TO TOP
   ========================================================= */
function initBackToTop() {
  var backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 500) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================================================
   SCROLL PROGRESS BAR
   ========================================================= */
function initScrollProgress() {
  var progressBar = document.getElementById("scrollProgress");
  if (!progressBar) return;

  window.addEventListener("scroll", function () {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + "%";
  });
}

/* =========================================================
   COPY PIX
   ========================================================= */
function copyPix(text, btn) {
  navigator.clipboard.writeText(text).then(function () {
    btn.classList.add("copied");
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copiado!';
    setTimeout(function () {
      btn.classList.remove("copied");
      btn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copiar';
    }, 2000);
  });
}

/* =========================================================
   CHAR COUNTER
   ========================================================= */
function initCharCounter() {
  var mensagemEl = document.getElementById("mensagem");
  var charCountEl = document.getElementById("charCount");
  if (mensagemEl && charCountEl) {
    mensagemEl.addEventListener("input", function () {
      charCountEl.textContent = mensagemEl.value.length;
    });
  }
}

/* =========================================================
   CONTACT FORM -> WHATSAPP
   ========================================================= */
function initContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nome = document.getElementById("nome").value.trim();
    var assunto = document.getElementById("assunto").value;
    var mensagem = document.getElementById("mensagem").value.trim();
    if (!nome || !assunto) return;

    var msg = "Ola, meu nome e *" + nome + "*.\nGostaria de: *" + assunto + "*";
    if (mensagem) msg += "\n\nMensagem: " + mensagem;

    // Show success animation
    form.style.display = "none";
    var success = document.getElementById("formSuccess");
    success.classList.add("show");

    setTimeout(function () {
      var url = "https://wa.me/5519992410546?text=" + encodeURIComponent(msg);
      window.open(url, "_blank");
      setTimeout(function () {
        form.style.display = "";
        form.reset();
        success.classList.remove("show");
        var charCountEl = document.getElementById("charCount");
        if (charCountEl) charCountEl.textContent = "0";
      }, 1500);
    }, 800);
  });
}

/* =========================================================
   PARALLAX ON HERO (subtle)
   ========================================================= */
function initParallax() {
  window.addEventListener("scroll", function () {
    var scrollY = window.scrollY;
    var heroBg = document.querySelector(".hero-bg");
    if (heroBg && scrollY < window.innerHeight) {
      heroBg.style.transform =
        "scale(1.05) translateY(" + scrollY * 0.3 + "px)";
    }
  });
}

/* =========================================================
   LITURGIA DO DIA - API
   ========================================================= */
async function loadLiturgia() {
  var liturgiaDateEl = document.getElementById("liturgiaDate");
  var evangelhoRefEl = document.getElementById("evangelhoRef");
  var evangelhoTextEl = document.getElementById("evangelhoText");
  var salmoRefEl = document.getElementById("salmoRef");
  var salmoTextEl = document.getElementById("salmoText");
  var salmoRefraoEl = document.getElementById("salmoRefrao");

  if (evangelhoTextEl) {
    evangelhoTextEl.innerHTML = "<p>Carregando o evangelho do dia...</p>";
  }
  if (salmoTextEl) {
    salmoTextEl.innerHTML = "<p>Carregando o salmo do dia...</p>";
  }

  try {
    // API principal
    var response = await fetch("https://liturgia.up.railway.app/v2/", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Erro HTTP na API principal: " + response.status);
    }

    var data = await response.json();
    console.log("Liturgia API principal:", data);

    preencherLiturgiaPrincipal(data);
  } catch (error) {
    console.warn("Falha na API principal, tentando reserva...", error);

    try {
      // API reserva
      var hoje = new Date().toISOString().split("T")[0];
      var responseBackup = await fetch(
        "https://api-liturgia-diaria.vercel.app/?date=" + hoje,
        {
          method: "GET",
        },
      );

      if (!responseBackup.ok) {
        throw new Error("Erro HTTP na API reserva: " + responseBackup.status);
      }

      var backupData = await responseBackup.json();
      console.log("Liturgia API reserva:", backupData);

      preencherLiturgiaReserva(backupData);
    } catch (backupError) {
      console.error("Erro ao carregar liturgia:", backupError);

      if (liturgiaDateEl) {
        liturgiaDateEl.textContent = "Liturgia indisponivel no momento";
      }

      if (evangelhoRefEl) evangelhoRefEl.textContent = "Indisponivel";
      if (salmoRefEl) salmoRefEl.textContent = "Indisponivel";

      if (evangelhoTextEl) {
        evangelhoTextEl.innerHTML =
          '<p style="color: var(--muted-fg); text-align: center;">Nao foi possivel carregar o evangelho. Tente novamente mais tarde.</p>';
      }

      if (salmoTextEl) {
        salmoTextEl.innerHTML =
          '<p style="color: var(--muted-fg); text-align: center;">Nao foi possivel carregar o salmo. Tente novamente mais tarde.</p>';
      }

      if (salmoRefraoEl) {
        salmoRefraoEl.querySelector(".refrao-text").textContent =
          "Indisponivel";
      }
    }
  }

  function preencherLiturgiaPrincipal(data) {
    if (liturgiaDateEl) {
      var dateStr = data.data || "";
      var liturgiaStr = data.liturgia || "";
      var corStr = data.cor || "";
      liturgiaDateEl.innerHTML =
        "<strong>" +
        dateStr +
        "</strong> - " +
        liturgiaStr +
        ' <span style="color: ' +
        getCorLiturgica(corStr) +
        ';">(' +
        corStr +
        ")</span>";
    }

    if (
      data.leituras &&
      data.leituras.evangelho &&
      data.leituras.evangelho.length > 0
    ) {
      var evangelho = data.leituras.evangelho[0];

      if (evangelhoRefEl) {
        evangelhoRefEl.textContent = evangelho.referencia || "Evangelho do dia";
      }

      if (evangelhoTextEl) {
        evangelhoTextEl.innerHTML =
          "<p>" +
          formatLiturgiaText(evangelho.texto || "Texto nao disponivel.") +
          "</p>";
      }
    } else {
      if (evangelhoRefEl) evangelhoRefEl.textContent = "Evangelho do dia";
      if (evangelhoTextEl)
        evangelhoTextEl.innerHTML = "<p>Evangelho nao encontrado.</p>";
    }

    if (
      data.leituras &&
      data.leituras.salmo &&
      data.leituras.salmo.length > 0
    ) {
      var salmo = data.leituras.salmo[0];

      if (salmoRefEl) {
        salmoRefEl.textContent = salmo.referencia || "Salmo do dia";
      }

      if (salmoTextEl) {
        salmoTextEl.innerHTML = formatSalmoText(
          salmo.texto || "Texto nao disponivel.",
        );
      }

      if (salmoRefraoEl) {
        salmoRefraoEl.querySelector(".refrao-text").textContent =
          salmo.refrao || "Refrao nao disponivel.";
      }
    } else {
      if (salmoRefEl) salmoRefEl.textContent = "Salmo do dia";
      if (salmoTextEl) salmoTextEl.innerHTML = "<p>Salmo nao encontrado.</p>";
      if (salmoRefraoEl)
        salmoRefraoEl.querySelector(".refrao-text").textContent =
          "Refrao nao encontrado.";
    }
  }

  function preencherLiturgiaReserva(data) {
    if (liturgiaDateEl) {
      liturgiaDateEl.innerHTML =
        "<strong>" + (data.data || "Hoje") + "</strong>";
    }

    if (evangelhoRefEl) {
      evangelhoRefEl.textContent =
        data.referencia_evangelho || "Evangelho do dia";
    }

    if (evangelhoTextEl) {
      evangelhoTextEl.innerHTML =
        "<p>" +
        formatLiturgiaText(data.evangelho || "Evangelho nao encontrado.") +
        "</p>";
    }

    if (salmoRefEl) {
      salmoRefEl.textContent = data.referencia_salmo || "Salmo do dia";
    }

    if (salmoTextEl) {
      salmoTextEl.innerHTML = formatSalmoText(
        data.salmo || "Salmo nao encontrado.",
      );
    }

    if (salmoRefraoEl) {
      salmoRefraoEl.querySelector(".refrao-text").textContent =
        data.refrao || "Refrao nao encontrado.";
    }
  }
}

function getCorLiturgica(cor) {
  var cores = {
    Roxo: "#8B008B",
    Verde: "#1a5c2a",
    Branco: "#888",
    Vermelho: "#8b1a1a",
    Rosa: "#DB7093",
  };
  return cores[cor] || "#666";
}

function formatLiturgiaText(texto) {
  if (!texto) return "";
  return texto.replace(/\n/g, "</p><p>").replace(/(\d+)/g, "<sup>$1</sup>");
}

function formatSalmoText(texto) {
  if (!texto) return "<p>Texto nao disponivel.</p>";

  var linhas = texto.split("\n");
  var html = "";

  linhas.forEach(function (linha) {
    var limpa = linha.trim();
    if (limpa) {
      html += "<p>" + limpa.replace(/^[-—]\s*/, "") + "</p>";
    }
  });

  return html || "<p>Texto nao disponivel.</p>";
}

function toggleLiturgiaExpand(cardId) {
  var card = document.getElementById(cardId);
  if (!card) return;

  card.classList.toggle("expanded");

  var btnText = card.querySelector(".liturgia-btn span");
  if (btnText) {
    btnText.textContent = card.classList.contains("expanded")
      ? "Recolher"
      : "Ler mais";
  }
}

function getCorLiturgica(cor) {
  var cores = {
    Roxo: "#8B008B",
    Verde: "#1a5c2a",
    Branco: "#888",
    Vermelho: "#8b1a1a",
    Rosa: "#DB7093",
  };
  return cores[cor] || "#666";
}

function formatLiturgiaText(texto) {
  // Format verse numbers as superscript
  return texto.replace(/(\d+)/g, "<sup>$1</sup>");
}

function formatSalmoText(texto) {
  // Split by line breaks and format each verse
  var lines = texto.split("\n");
  var formatted = "";
  lines.forEach(function (line) {
    if (line.trim()) {
      formatted += "<p>" + line.replace(/^—\s*/, "") + "</p>";
    }
  });
  return formatted;
}

function toggleLiturgiaExpand(cardId) {
  var card = document.getElementById(cardId);
  if (card) {
    card.classList.toggle("expanded");
  }
}

/* =========================================================
   MODAL EVENTO SEMANA SANTA
   ========================================================= */
function openEventoModal() {
  var modal = document.getElementById("eventoModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeEventoModal(event) {
  if (event) {
    event.stopPropagation();
  }
  var modal = document.getElementById("eventoModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Fechar modal com tecla ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeEventoModal();
  }
});

var eventosData = {
  "aprender-a-orar": {
    badge: "Oficinas de Oração",
    titulo: "Aprender a Orar para Aprender a Viver",
    imagem: "assets/aprenda a orar.jpeg",
    texto: [
      "As <strong>Oficinas de Oração e Vida</strong> são um caminho de fé que transforma corações e ensina a arte de orar como uma conversa de amizade com Deus.",
      "Nas oficinas você irá manusear a Bíblia, orar com ela e sentir a presença de Deus, Seu consolo e Sua paz.",
      "Aprenda a lidar com tristezas e ansiedades, a conciliar as relações na família, no trabalho e na comunidade.",
      "Inscrições gratuitas na secretaria da paróquia, pelo WhatsApp (19) 99792-3845 ou pelo site oficinasdeoracaoevida.org.br",
      "<strong>Compareça dia 03/08 para mais informações e venha viver essa experiência transformadora!</strong>",
    ],
    bencao: "Que a oração transforme seu coração e ilumine sua caminhada.",
    destaques: [
      {
        icone: "calendario",
        titulo: "Início",
        valor: "Segunda-feira, 03/08 • 16 encontros semanais",
      },
      {
        icone: "relogio",
        titulo: "Horário e Local",
        valor: "Segundas, 15h às 17h • Paróquia Santa Luzia - Jd. dos Oliveiras",
      },
    ],
  },
  "programacao-juc": {
    badge: "Juventude",
    titulo: "Programação de Agosto - JUC",
    imagem: "assets/programacao juc.jpeg",
    texto: [
      "Confira a agenda de agosto dos <strong>Jovens Unidos em Cristo</strong>.",
      "Dia <strong>07/08</strong>: Missa com a Banda do JUC, às 19h30, na Comunidade São Nicolau de Flüe.",
      "Dia <strong>15/08</strong>: Visita ao Instituto Amor e Vida, às 9h, com ponto de encontro na Paróquia Santa Luzia.",
      "Um mês de louvor, serviço e comunhão entre os jovens da nossa paróquia.",
      "<strong>Participe e traga seus amigos!</strong>",
    ],
    bencao: "Que a juventude da nossa paróquia seja sempre luz e esperança.",
    destaques: [
      {
        icone: "calendario",
        titulo: "07/08",
        valor: "Missa com a Banda do JUC • 19h30 • Comunidade São Nicolau de Flüe",
      },
      {
        icone: "relogio",
        titulo: "15/08",
        valor: "Visita ao Instituto Amor e Vida • 9h • Saída da Paróquia Santa Luzia",
      },
    ],
  },
  peregrinacao: {
    badge: "Peregrinação",
    titulo: "Peregrinação da Paróquia",
    imagem: "assets/peregrinacao.jpeg",
    texto: [
      "Participe da <strong>Peregrinação</strong> de nossa comunidade.",
      "Um caminho de fé, oração e comunhão entre as nossas comunidades.",
      "Caminharemos juntos celebrando a presença de Deus em cada passo.",
      "Traga sua família e amigos para este momento especial de espiritualidade.",
      "<strong>Venha viver a peregrinação conosco!</strong>",
    ],
    bencao: "Que nossa jornada seja abençoada e iluminada pelo Espírito Santo.",
    destaques: [
      {
        icone: "calendario",
        titulo: "Informações",
        valor: "Acompanhe nossas redes sociais",
      },
    ],
  },
};

function getIconeSvg(tipo) {
  var icones = {
    calendario:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    relogio:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    cruz: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>',
  };
  return icones[tipo] || icones["calendario"];
}

function openEventoModalDinamico(eventoId) {
  var evento = eventosData[eventoId];
  if (!evento) return;

  var modalBody = document.getElementById("eventoModalBody");
  if (!modalBody) return;

  var textoParagrafos = evento.texto
    .map(function (p) {
      return "<p>" + p + "</p>";
    })
    .join("");

  var destaquesHtml = evento.destaques
    .map(function (d) {
      return (
        '<div class="evento-modal-destaque">' +
        '<div class="destaque-icon">' +
        getIconeSvg(d.icone) +
        "</div>" +
        "<div><strong>" +
        d.titulo +
        "</strong><span>" +
        d.valor +
        "</span></div>" +
        "</div>"
      );
    })
    .join("");

  modalBody.innerHTML =
    '<div class="evento-modal-imagem">' +
    '<img src="' +
    evento.imagem +
    '" alt="' +
    evento.titulo +
    '" />' +
    "</div>" +
    '<div class="evento-modal-info">' +
    '<div class="evento-modal-badge">' +
    evento.badge +
    "</div>" +
    '<h3 class="evento-modal-titulo">' +
    evento.titulo +
    "</h3>" +
    '<div class="evento-modal-texto">' +
    textoParagrafos +
    '<p class="evento-modal-bencao">' +
    evento.bencao +
    "</p>" +
    "</div>" +
    '<div class="evento-modal-destaques">' +
    destaquesHtml +
    "</div>" +
    "</div>";

  var modal = document.getElementById("eventoModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeEventoModal(event) {
  if (event) {
    event.stopPropagation();
  }
  var modal = document.getElementById("eventoModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Fechar modal com tecla ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeEventoModal();
  }
});
