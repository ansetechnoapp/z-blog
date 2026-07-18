/* ELEVARE — SPA de démonstration multi-pages, sans dépendance externe. */
(function () {
  "use strict";

  const apiPromise = import("./elevare-api.js");
  let articles = [];
  let categories = [];
  let authors = [];
  let bootstrapPromise;

  function toArticle(post) {
    const firstCategory = post.categories?.[0];
    const author = post.author || {};
    return {
      ...post,
      id: post.id,
      slug: post.slug,
      title: post.title || "",
      category: firstCategory?.name || post.category || "Blog",
      categorySlug: firstCategory?.slug || "",
      image: post.featuredImage || "",
      excerpt: post.excerpt || "",
      author: author.name || post.authorName || "Équipe ELEVARE",
      authorSlug: author.slug || "",
      authorImage: author.avatar || author.avatarUrl || author.image || "",
      date: formatDate(post.publishedAt || post.createdAt),
      time: `${post.readingTimeMinutes || 1} min`,
    };
  }

  function toCategory(category) {
    return {
      ...category,
      name: category.name || category.title || "",
      slug: category.slug || "",
    };
  }

  function toAuthor(author) {
    return {
      ...author,
      name: author.name || "Auteur ELEVARE",
      role: author.role || "Auteur",
      image: author.avatar || author.avatarUrl || author.image || "",
    };
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
      .format(date)
      .replace(".", "");
  }

  async function loadBootstrap() {
    if (!bootstrapPromise) {
      bootstrapPromise = apiPromise.then(async (api) => {
        const aggregate = await api.getAggregate();
        articles = (aggregate.posts || []).map(toArticle);
        categories = (aggregate.categories || []).map(toCategory);
        authors = (aggregate.authors || []).map(toAuthor);
      });
    }
    return bootstrapPromise;
  }

  async function loadPosts(params) {
    const api = await apiPromise;
    const result = await api.getPosts(params);
    return (result.posts || []).map(toArticle);
  }

  function dataUnavailable(title = "Les articles sont momentanément indisponibles.") {
    return `<div class="empty-state">${esc(title)}</div>`;
  }

  const esc = (value) =>
    String(value).replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[c],
    );
  const qs = (selector, root = document) => root.querySelector(selector);
  const pageNames = {
    home: "Accueil",
    articles: "Liste des articles",
    post: "Page article",
    category: "Page catégorie",
    author: "Page auteur",
    search: "Recherche / résultats",
    archives: "Archives",
    about: "À propos",
    contact: "Contact",
    newsletter: "Newsletter",
    login: "Connexion",
    signup: "Inscription",
    account: "Espace lecteur / compte",
    admin: "Espace auteur / administration",
    404: "Page introuvable",
    maintenance: "Maintenance",
  };

  function image(url, alt, className) {
    return url
      ? `<img class="${className || ""}" src="${esc(url)}" alt="${esc(alt || "")}" loading="lazy">`
      : "";
  }
  function icon(name) {
    return `<span class="icon" aria-hidden="true">${name}</span>`;
  }
  function topbar() {
    return `<header class="topbar"><button class="mobile-menu" aria-label="Ouvrir le menu">☰</button><a class="brand" href="#/home"><span class="brand-mark">E</span><span><strong>ÉLEVARE</strong><small>Le blog qui élève vos idées.</small></span></a><nav class="topnav"><a href="#/home">Accueil</a><a href="#/articles">Catégories</a><a href="#/about">À propos</a><a href="#/newsletter">Newsletter</a></nav><div class="top-actions"><button data-action="search" aria-label="Rechercher">⌕</button><a class="button button-dark small" href="#/login">Connexion</a><button data-action="theme" aria-label="Changer le thème">◐</button></div></header>`;
  }
  function sidebar(current) {
    return `<aside class="sidebar"><div class="side-brand"><div class="feather">❧</div><div class="side-logo">ÉLEVARE</div><p>Le blog qui élève vos idées.</p><p class="side-intro">Un blog moderne et élégant pour partager, apprendre et s'inspirer chaque jour.</p><ul class="benefits"><li>✥ Design premium</li><li>▢ 100% responsive</li><li>◌ Expérience lecteur optimale</li><li>⌁ SEO & Performance</li><li>⌘ Facile à personnaliser</li></ul><div class="swatches"><i></i><i></i><i></i></div></div><nav class="side-nav"><a class="${current === "home" ? "active" : ""}" href="#/home">${icon("⌂")} Accueil</a><a class="${current === "articles" ? "active" : ""}" href="#/articles">${icon("▤")} Tous les articles</a><a href="#/category">${icon("▦")} Catégories</a><a href="#/author">${icon("◉")} Auteur</a><a href="#/search">${icon("⌕")} Recherche</a><a href="#/archives">${icon("◷")} Archives</a><a href="#/about">${icon("○")} À propos</a><a href="#/contact">${icon("✉")} Contact</a></nav></aside>`;
  }
  function shell(view, content, title) {
    document.title = `ELEVARE — ${title || pageNames[view] || "Le blog qui élève vos idées."}`;
    qs("#app").innerHTML =
      `<div class="site-shell">${topbar()}<div class="layout">${sidebar(view)}<main class="main-content"><div class="breadcrumb">ELEVARE <span>/</span> ${esc(title || pageNames[view])}</div>${content}</main></div></div><div id="toast" role="status"></div>`;
    bindCommon(view);
  }
  function card(article, compact) {
    return `<article class="article-card ${compact ? "compact" : ""}" data-article="${esc(article.slug || article.id)}">${image(article.image, article.title, "card-image")}<div class="card-body"><span class="eyebrow">${esc(article.category)}</span><h3>${esc(article.title)}</h3>${compact ? "" : `<p>${esc(article.excerpt)}</p>`}<div class="meta">${esc(article.date)} <span>·</span> ${esc(article.time)}</div></div></article>`;
  }
  function newsletterForm(id) {
    return `<form class="newsletter-form" id="${id || "newsletterForm"}"><input type="email" placeholder="Votre adresse e-mail" required><button class="button button-gold" type="submit">S'abonner</button></form>`;
  }
  async function home() {
    try {
      await loadBootstrap();
    } catch (error) {
      console.error(error);
      shell("home", dataUnavailable(), "Accueil");
      return;
    }
    if (!articles.length) {
      shell("home", dataUnavailable("Aucun article publié pour le moment."), "Accueil");
      return;
    }
    const featured = articles[0];
    const featuredCards = articles
      .slice(1, 4)
      .map((a) => card(a))
      .join("");
    const recent = articles
      .slice(4, 8)
      .map((a) => card(a, true))
      .join("");
    shell(
      "home",
      `<section class="hero panel"><div class="hero-copy"><span class="eyebrow">À LA UNE</span><h1>${esc(featured.title)}</h1><p>${esc(featured.excerpt)} L'essentiel, avec nuance et clarté.</p><div class="meta">${esc(featured.author)} <span>·</span> ${esc(featured.time)}</div><a class="button button-gold" href="#/post/${encodeURIComponent(featured.slug)}">Lire l'article</a></div>${image(featured.image, featured.title, "hero-image")}</section><section class="section"><div class="section-heading"><div><span class="eyebrow">EN VEDETTE</span><h2>Les idées du moment</h2></div><a href="#/articles">Voir tous les articles →</a></div><div class="cards-grid three">${featuredCards}</div></section><section class="section"><div class="section-heading"><div><span class="eyebrow">DERNIERS ARTICLES</span><h2>À lire maintenant</h2></div></div><div class="cards-grid four">${recent}</div></section><section class="subscribe-bar"><div><strong>Recevez le meilleur d'Elevare</strong><span>Chaque semaine, une sélection d'articles qui comptent vraiment.</span></div>${newsletterForm("homeNewsletter")}</section><footer class="dark-footer"><div><strong>ÉLEVARE</strong><small>Le blog qui élève vos idées.</small></div><div><strong>Explorer</strong><a href="#/articles">Tous les articles</a><a href="#/category">Catégories</a></div><div><strong>Ressources</strong><a href="#/about">À propos</a><a href="#/contact">Contact</a></div><div><strong>Catégories</strong><a href="#/category/Technologie">Technologie</a><a href="#/category/Design">Design</a></div></footer>`,
      "Accueil",
    );
  }
  async function articlesPage() {
    try {
      await loadBootstrap();
    } catch (error) {
      console.error(error);
      shell("articles", dataUnavailable(), "Liste des articles");
      return;
    }
    shell(
      "articles",
      `<section class="page-heading"><span class="eyebrow">ELEVARE</span><h1>Tous les articles</h1><p>Des idées pour comprendre, apprendre et avancer.</p></section><div class="filter-row"><button class="filter active" data-filter="Tous">Tous</button>${categories.map((c) => `<button class="filter" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div><div class="content-with-aside"><div class="cards-list" id="articleList">${articles.map((a) => card(a, true)).join("")}</div><aside class="filter-aside"><strong>FILTRES</strong>${categories.map((c) => `<a href="#/category/${encodeURIComponent(c)}">${esc(c)} <span>›</span></a>`).join("")}</aside></div>`,
      "Liste des articles",
    );
  }
  async function post(slug) {
    let detail;
    try {
      const api = await apiPromise;
      detail = await api.getPostBySlug(decodeURIComponent(slug));
    } catch (error) {
      console.error(error);
      statusPage("404");
      return;
    }
    const a = toArticle(detail.post || detail);
    const content = a.content || "";
    if (!a.title || !content) {
      statusPage("404");
      return;
    }
    shell(
      "post",
      `<article class="post-page"><div class="post-title"><span class="eyebrow">${esc(a.category)}</span><h1>${esc(a.title)}</h1><p>${esc(a.excerpt)}</p><div class="meta">Par ${esc(a.author)} <span>·</span> ${esc(a.date)} <span>·</span> ${esc(a.time)} de lecture</div></div>${image(a.image, a.title, "post-image")}<div class="post-layout"><div class="prose">${content}</div><aside class="post-aside"><strong>Sommaire</strong>${(detail.relatedPosts || []).slice(0, 3).map((related) => `<a href="#/post/${encodeURIComponent(related.slug)}">${esc(related.title)}</a>`).join("")}<div class="share-box"><strong>Partager</strong><div class="share-buttons"><button data-share="Lien">↗</button><button data-share="Réseau">◎</button><button data-share="Mail">✉</button></div></div></aside></div></article>`,
      "Page article",
    );
  }
  async function category(name) {
    try {
      await loadBootstrap();
      const requested = decodeURIComponent(name || "");
      const selected =
        categories.find(
          (item) =>
            item.slug === requested ||
            item.name.toLowerCase() === requested.toLowerCase(),
        ) || categories[0];
      if (!selected) {
        shell("category", dataUnavailable("Aucune catégorie disponible."), "Page catégorie");
        return;
      }
      const api = await apiPromise;
      const result = await api.getCategoryBySlug(selected.slug);
      const categoryName = result.category?.name || selected.name;
      const filtered = (result.posts || []).map(toArticle);
      const popular = articles.slice(0, 4);
      shell(
        "category",
        `<section class="category-hero"><div><span class="eyebrow">CATÉGORIE</span><h1>${esc(categoryName)}</h1><p>Actualités, analyses et idées autour de cette thématique.</p></div></section><div class="stats-row"><strong>${filtered.length} <small>articles</small></strong><strong>12K <small>lecteurs</small></strong><strong>4.8/5 <small>note moyenne</small></strong></div><div class="section-heading"><h2>Articles récents</h2><span>Les plus populaires</span></div><div class="category-columns"><div class="cards-list">${filtered.length ? filtered.map((a) => card(a, true)).join("") : dataUnavailable("Aucun article dans cette catégorie.")}</div><div class="popular-panel"><h3>Populaires</h3>${popular
          .map(
            (a, i) =>
              `<a class="popular-item" href="#/post/${encodeURIComponent(a.slug)}"><b>0${i + 1}</b><span>${esc(a.title)}</span></a>`,
          )
          .join("")}</div></div>`,
        "Page catégorie",
      );
    } catch (error) {
      console.error(error);
      shell("category", dataUnavailable(), "Page catégorie");
    }
  }
  async function author() {
    try {
      await loadBootstrap();
      const a = authors[0];
      if (!a) {
        shell("author", dataUnavailable("Aucun auteur disponible."), "Page auteur");
        return;
      }
      const api = await apiPromise;
      const detail = a.slug ? await api.getAuthorBySlug(a.slug) : { posts: [] };
      const authorPosts = (detail.posts || []).map(toArticle);
    shell(
      "author",
      `<section class="author-head panel">${image(a.image, a.name)}<div><span class="eyebrow">AUTEUR</span><h1>${esc(a.name)}</h1><p>${esc(a.role)} chez ELEVARE. J'écris sur la technologie, la créativité et les habitudes qui changent nos vies.</p></div></section><div class="stats-row"><strong>${authorPosts.length} <small>articles</small></strong><strong>12K <small>lecteurs</small></strong><strong>4.9/5 <small>note moyenne</small></strong></div><div class="section-heading"><h2>Ses articles</h2><span>Articles populaires</span></div><div class="cards-list">${authorPosts.length ? authorPosts.slice(0, 4).map((x) => card(x, true)).join("") : dataUnavailable("Aucun article publié pour cet auteur.")}</div>`,
      "Page auteur",
    );
    } catch (error) {
      console.error(error);
      shell("author", dataUnavailable(), "Page auteur");
    }
  }
  async function search(query) {
    const q = query || "";
    let results = [];
    try {
      await loadBootstrap();
      results = q ? await loadPosts({ q: decodeURIComponent(q) }) : articles.slice(0, 4);
    } catch (error) {
      console.error(error);
      shell("search", dataUnavailable(), "Recherche / résultats");
      return;
    }
    shell(
      "search",
      `<section class="page-heading align-left"><span class="eyebrow">RECHERCHE</span><h1>Recherche / résultats</h1><form class="search-form" id="searchForm"><input id="searchQuery" value="${esc(q)}" placeholder="Rechercher un article, un auteur…"><button class="button button-dark">Rechercher</button></form></section><p class="result-count">${results.length} résultats ${q ? `pour « ${esc(q)} »` : ""}</p><div class="cards-list">${results.map((a) => card(a, true)).join("") || '<div class="empty-state">Aucun résultat trouvé.</div>'}</div>`,
      "Recherche / résultats",
    );
  }
  async function archives() {
    let archiveBuckets = [];
    try {
      await loadBootstrap();
      const api = await apiPromise;
      archiveBuckets = await api.getArchives();
      archiveBuckets = await Promise.all(
        archiveBuckets.map(async (bucket) => ({
          ...bucket,
          posts: await loadPosts({ year: bucket.year, month: bucket.month }),
        })),
      );
    } catch (error) {
      console.error(error);
      shell("archives", dataUnavailable(), "Archives");
      return;
    }
    shell(
      "archives",
      `<section class="page-heading align-left"><span class="eyebrow">ARCHIVES</span><h1>Archives</h1><p>Retrouvez nos articles par mois de publication.</p></section><div class="archive-list">${archiveBuckets
        .map(
          (bucket, i) =>
            `<details ${i === 0 ? "open" : ""}><summary>${esc(bucket.label || `${bucket.month}/${bucket.year}`)}<span>${bucket.count || bucket.posts.length} articles</span></summary><div>${bucket.posts
              .map(
                (a) =>
                  `<a href="#/post/${encodeURIComponent(a.slug)}">${esc(a.title)} <small>${esc(a.date)}</small></a>`,
              )
              .join("")}</div></details>`,
        )
        .join("")}</div>`,
      "Archives",
    );
  }
  async function about() {
    try {
      await loadBootstrap();
    } catch (error) {
      console.error(error);
      shell("about", dataUnavailable(), "À propos");
      return;
    }
    shell(
      "about",
      `<section class="page-heading align-left"><span class="eyebrow">À PROPOS</span><h1>Notre mission</h1><p>Élever les idées, partager des perspectives et créer une communauté de lecteurs curieux.</p></section><div class="about-grid"><div class="prose"><p>ELEVARE est un blog moderne et élégant qui prend le temps de comprendre les transformations du monde.</p><p>Nous croyons aux textes utiles, aux images qui respirent et aux interfaces qui rendent la lecture plus simple.</p><h2>Notre histoire</h2><p>Créé en 2021, ELEVARE rassemble des auteurs qui écrivent sur la technologie, le design, la productivité et les nouveaux modes de vie.</p></div><div class="team-grid">${authors.map((a) => `<div class="team-card">${image(a.image, a.name)}<strong>${a.name}</strong><small>${a.role}</small></div>`).join("")}</div></div>`,
      "À propos",
    );
  }
  function contact() {
    shell(
      "contact",
      `<div class="form-page"><div><span class="eyebrow">CONTACT</span><h1>Discutons ensemble</h1><p>Une question, une idée ou un partenariat ? Écrivez-nous.</p></div><form class="form-card" id="contactForm"><label>Nom<input required></label><label>Email<input type="email" required></label><label>Votre message<textarea required rows="5"></textarea></label><button class="button button-dark">Envoyer le message</button><p class="form-success" hidden>Merci, votre message est prêt à être envoyé.</p></form></div>`,
      "Contact",
    );
  }
  function newsletter() {
    shell(
      "newsletter",
      `<div class="auth-card newsletter-card"><span class="eyebrow">NEWSLETTER</span><h1>Rejoignez la communauté ELEVARE</h1><p>Chaque dimanche, recevez trois idées utiles, sans publicité et sans bruit.</p>${newsletterForm("newsletterPage")}<ul><li>Des articles choisis avec soin</li><li>Une lecture courte et inspirante</li><li>Désabonnement en un clic</li></ul></div>`,
      "Newsletter",
    );
  }
  function auth(type) {
    const login = type === "login";
    shell(
      type,
      `<div class="auth-card"><span class="eyebrow">${login ? "CONNEXION" : "INSCRIPTION"}</span><h1>${login ? "Bienvenue de retour" : "Créer un compte"}</h1><p>${login ? "Retrouvez vos articles favoris et vos commentaires." : "Rejoignez les lecteurs qui aiment prendre de la hauteur."}</p><form class="form-card plain" id="authForm">${!login ? "<label>Nom<input required></label>" : ""}<label>Email<input type="email" required></label><label>Mot de passe<input type="password" required></label>${login ? '<label class="check"><input type="checkbox"> Se souvenir de moi</label>' : ""}<button class="button button-dark">${login ? "Se connecter" : "S'inscrire"}</button></form><div class="auth-links">${login ? '<a href="#/signup">Créer un compte</a>' : '<a href="#/login">J’ai déjà un compte</a>'}</div></div>`,
      login ? "Connexion" : "Inscription",
    );
  }
  async function account() {
    try {
      await loadBootstrap();
    } catch (error) {
      console.error(error);
      shell("account", dataUnavailable(), "Espace lecteur / compte");
      return;
    }
    const accountAuthor = authors[0] || { name: "Lecteur ELEVARE", image: "" };
    shell(
      "account",
      `<div class="account-layout"><nav class="account-nav"><div class="user-chip">${image(accountAuthor.image, accountAuthor.name)}<strong>${esc(accountAuthor.name)}</strong><small>Lecteur ELEVARE</small></div><a class="active" href="#/account">${icon("⌂")} Tableau de bord</a><a href="#/articles">${icon("♡")} Mes favoris</a><a href="#/account">${icon("◌")} Mes commentaires</a><a href="#/account">${icon("⚙")} Paramètres</a><a href="#/home">${icon("↪")} Déconnexion</a></nav><div class="account-main"><span class="eyebrow">ESPACE LECTEUR / COMPTE</span><h1>Tableau de bord</h1><div class="metric-grid"><div><small>Articles lus</small><b>56</b></div><div><small>Favoris</small><b>24</b></div><div><small>Commentaires</small><b>12</b></div></div><h2>Recommandé pour vous</h2><div class="cards-list">${articles
        .slice(0, 3)
        .map((a) => card(a, true))
        .join("")}</div></div></div>`,
      "Espace lecteur / compte",
    );
  }
  function admin() {
    shell(
      "admin",
      `<div class="admin-layout"><nav class="account-nav"><strong>ÉLEVARE</strong><a class="active" href="#/admin">Tableau de bord</a><a href="#/articles">Articles</a><a href="#/category">Catégories</a><a href="#/admin">Commentaires</a><a href="#/admin">Médias</a><a href="#/admin">SEO</a></nav><div class="account-main"><div class="section-heading"><div><span class="eyebrow">ESPACE AUTEUR / ADMINISTRATION DU BLOG</span><h1>Tableau de bord</h1></div><span>Bonjour, Claire 👋</span></div><div class="metric-grid four"><div><small>Articles</small><b>128</b><em>+12%</em></div><div><small>Vues ce mois</small><b>56.8K</b><em>+8%</em></div><div><small>Lecteurs</small><b>12.4K</b><em>+15%</em></div><div><small>Commentaires</small><b>342</b><em>+6%</em></div></div><div class="dashboard-grid"><div class="chart-card"><h2>Vues sur les 30 derniers jours</h2><div class="fake-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="activity-card"><h2>Activité récente</h2><p>✦ Nouveau commentaire</p><p>✦ Article publié</p><p>✦ Nouveau lecteur inscrit</p></div></div></div></div>`,
      "Espace auteur / administration",
    );
  }
  function statusPage(type) {
    const is404 = type === "404";
    shell(
      type,
      `<div class="status-page"><div class="status-art">${is404 ? "404" : "⚙"}</div><span class="eyebrow">${is404 ? "PAGE INTROUVABLE" : "SITE EN MAINTENANCE"}</span><h1>${is404 ? "Cette page n’existe pas" : "Nous revenons bientôt"}</h1><p>${is404 ? "La page demandée a été déplacée ou supprimée." : "Une petite mise à jour est en cours. Merci de revenir dans quelques instants."}</p><a class="button button-dark" href="#/home">Retour à l’accueil</a></div>`,
      is404 ? "Page introuvable" : "Maintenance",
    );
  }

  function bindCommon(view) {
    document.querySelectorAll("[data-article]").forEach((el) => {
      el.addEventListener("click", () => go(`post/${el.dataset.article}`));
    });
    document
      .querySelectorAll('[data-action="theme"]')
      .forEach((el) =>
        el.addEventListener("click", () =>
          document.body.classList.toggle("dark-mode"),
        ),
      );
    document
      .querySelectorAll('[data-action="search"]')
      .forEach((el) => el.addEventListener("click", () => go("search")));
    document
      .querySelectorAll(".mobile-menu")
      .forEach((el) =>
        el.addEventListener("click", () =>
          document.querySelector(".sidebar").classList.toggle("open"),
        ),
      );
    document.querySelectorAll(".filter").forEach((button) =>
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".filter")
          .forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        document
          .querySelectorAll("#articleList .article-card")
          .forEach((cardEl) => {
            const a = articles.find(
              (x) => String(x.slug || x.id) === cardEl.dataset.article,
            );
            cardEl.hidden =
              button.dataset.filter !== "Tous" &&
              a?.category !== button.dataset.filter;
          });
      }),
    );
    const searchForm = qs("#searchForm");
    if (searchForm)
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        go(`search/${encodeURIComponent(qs("#searchQuery").value)}`);
      });
    const contactForm = qs("#contactForm");
    if (contactForm)
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        qs(".form-success", contactForm).hidden = false;
        contactForm.reset();
      });
    document
      .querySelectorAll("form.newsletter-form, #authForm")
      .forEach((form) =>
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          toast("Merci ! Votre demande a bien été prise en compte.");
          form.reset();
        }),
      );
    document.querySelectorAll("[data-share]").forEach((button) =>
      button.addEventListener("click", () => {
        const copy = navigator.clipboard?.writeText
          ? navigator.clipboard.writeText(location.href)
          : Promise.resolve();
        copy.finally(() =>
          toast(`${button.dataset.share} prêt à être partagé.`),
        );
      }),
    );
  }
  function toast(message) {
    const el = qs("#toast");
    if (!el) return;
    el.textContent = message;
    el.className = "show";
    setTimeout(() => (el.className = ""), 2600);
  }
  function go(path) {
    location.hash = `#/${path}`;
  }
  let renderVersion = 0;
  async function render() {
    const currentVersion = ++renderVersion;
    const parts = (location.hash.replace(/^#\/?/, "") || "home").split("/");
    const route = parts[0];
    const arg = parts.slice(1).join("/");
    const routes = {
      home,
      articles: articlesPage,
      post: () => post(arg),
      category: () => category(arg),
      author,
      search: () => search(arg),
      archives,
      about,
      contact,
      newsletter,
      login: () => auth("login"),
      signup: () => auth("signup"),
      account,
      admin,
      404: () => statusPage("404"),
      maintenance: () => statusPage("maintenance"),
    };
    await (routes[route] || routes["404"])();
    if (currentVersion !== renderVersion) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  window.addEventListener("hashchange", () => void render());
  void render();
})();
