const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const tabs = Array.from(document.querySelectorAll(".tabs__button"));
const panels = Array.from(document.querySelectorAll(".panel"));
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

activateTab("gallery");
