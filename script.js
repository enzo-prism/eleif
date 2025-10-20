const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const tabs = Array.from(document.querySelectorAll(".tabs__button"));
const panels = Array.from(document.querySelectorAll(".panel"));
const galleryRoot = document.querySelector("[data-gallery]");
const galleryEmptyState = document.querySelector("[data-gallery-empty]");
const STORAGE_KEY = "atelier-theme";

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = (theme) => {
  const safeTheme = theme === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", safeTheme);
  localStorage.setItem(STORAGE_KEY, safeTheme);
  themeToggle.setAttribute("aria-pressed", String(safeTheme === "dark"));
};

const currentTheme =
  localStorage.getItem(STORAGE_KEY) || (prefersDark.matches ? "dark" : "light");

applyTheme(currentTheme);

prefersDark.addEventListener("change", (event) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

themeToggle.addEventListener("click", () => {
  const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});

const activateTab = (targetId) => {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === targetId;
    tab.classList.toggle("tabs__button--active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === targetId;
    panel.classList.toggle("panel--active", isActive);
    panel.toggleAttribute("hidden", !isActive);
  });
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.tab);
  });
});

const GALLERY_BASE_PATH = "assets/gallery/";
const galleryManifest = Object.freeze([
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    alt: "Eleif community member wearing a weighted hoodie in natural light.",
  },
  {
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    alt: "Supporter styling an Eleif hoodie during morning coffee.",
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    alt: "Outdoor portrait of a community member in a weighted hoodie.",
  },
  {
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    alt: "Close-up of Eleif hoodie details worn by a supporter.",
  },
]);

const resolveGallerySrc = (src) =>
  src.startsWith("http://") || src.startsWith("https://") ? src : `${GALLERY_BASE_PATH}${src}`;

const renderGallery = () => {
  if (!galleryRoot) {
    return;
  }

  galleryRoot.innerHTML = "";

  if (!galleryManifest.length) {
    if (galleryEmptyState) {
      galleryEmptyState.hidden = false;
    }
    return;
  }

  if (galleryEmptyState) {
    galleryEmptyState.hidden = true;
  }

  galleryManifest.forEach(({ src, alt }, index) => {
    const figure = document.createElement("figure");
    figure.className = "gallery__item";

    const img = document.createElement("img");
    img.src = resolveGallerySrc(src);
    img.alt = alt || `Eleif community member ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";

    figure.appendChild(img);
    galleryRoot.appendChild(figure);
  });
};

renderGallery();
activateTab("gallery");
