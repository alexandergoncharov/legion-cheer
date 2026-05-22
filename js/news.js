function getNewsById(id) {
  return NEWS.find((item) => item.id === id);
}

function renderNewsList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sorted = [...NEWS].sort((a, b) => {
    const da = a.date.split(".").reverse().join("");
    const db = b.date.split(".").reverse().join("");
    return db.localeCompare(da);
  });

  container.innerHTML = sorted
    .map(
      (item) => `
    <a href="news/article.html?id=${item.id}" class="news-item">
      <div class="news-item-thumb">
        <img src="${item.cover}" alt="" loading="lazy">
      </div>
      <div class="news-item-body">
        <time class="news-date" datetime="${item.dateFull}">${item.date}</time>
        <h3>${item.title}</h3>
        <p>${item.excerpt}</p>
        <span class="news-read-more">Читать полностью →</span>
      </div>
    </a>
  `
    )
    .join("");
}

function renderArticle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const article = id ? getNewsById(id) : null;
  const root = document.getElementById("articleRoot");

  if (!article || !root) {
    if (root) {
      root.innerHTML = `
        <div class="article-not-found">
          <h1>Новость не найдена</h1>
          <p>Возможно, ссылка устарела или статья была удалена.</p>
          <a href="../index.html#news" class="btn btn-primary">Все новости</a>
        </div>
      `;
    }
    document.title = "Новость не найдена — СК «Легион»";
    return;
  }

  document.title = `${article.title} — СК «Легион»`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = article.excerpt;

  const others = NEWS.filter((n) => n.id !== article.id).slice(0, 3);

  root.innerHTML = `
    <nav class="article-breadcrumb">
      <a href="../index.html">Главная</a>
      <span>/</span>
      <a href="../index.html#news">Новости</a>
      <span>/</span>
      <span>${article.title}</span>
    </nav>

    <article class="article">
      <header class="article-header">
        <time class="article-date" datetime="${article.dateFull}">${article.dateFull}</time>
        <h1 class="article-title">${article.title}</h1>
      </header>

      <div class="article-cover">
        <img src="../${article.cover}" alt="${article.title}">
      </div>

      <div class="article-content">
        ${article.content.map((p) => `<p>${p}</p>`).join("")}
      </div>

      <section class="article-gallery">
        <h2 class="article-gallery-title">Фотогалерея</h2>
        <div class="article-gallery-grid">
          ${article.images
            .map(
              (src, i) => `
            <button type="button" class="article-gallery-item" data-index="${i}" aria-label="Открыть фото ${i + 1}">
              <img src="../${src}" alt="${article.title} — фото ${i + 1}" loading="lazy">
            </button>
          `
            )
            .join("")}
        </div>
      </section>
    </article>

    ${
      others.length
        ? `
    <aside class="article-more">
      <h2 class="article-more-title">Другие новости</h2>
      <div class="article-more-list">
        ${others
          .map(
            (item) => `
          <a href="article.html?id=${item.id}" class="article-more-card">
            <img src="../${item.cover}" alt="">
            <div>
              <time>${item.date}</time>
              <h3>${item.title}</h3>
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </aside>
    `
        : ""
    }
  `;

  initArticleGallery(article.images);
}

function initArticleGallery(images) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  let currentIndex = 0;

  document.querySelectorAll(".article-gallery-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentIndex = Number(btn.dataset.index);
      lightboxImg.src = `../${images[currentIndex]}`;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  function close() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  lightboxClose?.addEventListener("click", close);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = `../${images[currentIndex]}`;
    }
    if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = `../${images[currentIndex]}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNewsList("newsList");
  if (document.getElementById("articleRoot")) {
    renderArticle();
  }
});
