const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const tabs = Array.from(document.querySelectorAll(".tabs__button"));
const panels = Array.from(document.querySelectorAll(".panel"));
const galleryRoot = document.querySelector("[data-gallery]");
const galleryEmptyState = document.querySelector("[data-gallery-empty]");
const modelForm = document.querySelector("[data-model-form]");
const shareButton = document.querySelector("[data-share-form]");
const shareFeedback = document.querySelector("[data-share-feedback]");
const contactInput =
  modelForm instanceof HTMLFormElement ? modelForm.querySelector("[data-contact-input]") : null;
const replyToField =
  modelForm instanceof HTMLFormElement ? modelForm.querySelector('input[name="_replyto"]') : null;
const redirectField =
  modelForm instanceof HTMLFormElement ? modelForm.querySelector('input[name="_redirect"]') : null;
const formError =
  modelForm instanceof HTMLFormElement ? modelForm.querySelector("[data-form-error]") : null;
const submitButton =
  modelForm instanceof HTMLFormElement ? modelForm.querySelector('button[type="submit"]') : null;
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

const knownTabIds = tabs.map((tab) => tab.dataset.tab);

const activateTab = (targetId, { updateHash = true } = {}) => {
  if (!targetId || !knownTabIds.includes(targetId)) {
    return;
  }

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

  if (updateHash && typeof history.replaceState === "function") {
    history.replaceState(null, "", `#${targetId}`);
  }
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.tab);
  });
});

const GALLERY_BASE_PATH = "assets/gallery/";
const galleryManifest = Object.freeze([
  {
    src: "amie polaroid white hoodie surf background.webp",
    alt: "Amie wearing a white Eleif hoodie against a surf-inspired backdrop.",
    width: 3024,
    height: 4032,
  },
  {
    src: "white hoodie team usa.webp",
    alt: "Eleif white hoodie styled in front of a Team USA mural.",
    width: 2316,
    height: 2895,
  },
  {
    src: "black hoodie album background.webp",
    alt: "Black Eleif hoodie displayed against a wall of vinyl albums.",
    width: 1242,
    height: 2208,
  },
  {
    src: "enzo black hoodie with mom.webp",
    alt: "Enzo and his mom matching in black Eleif hoodies.",
    width: 3024,
    height: 4032,
  },
  {
    src: "hoodie and watch.webp",
    alt: "Close-up of an Eleif hoodie cuff paired with a sleek watch.",
    width: 1225,
    height: 1225,
  },
  {
    src: "mascot at computer.webp",
    alt: "Eleif elephant mascot catching up on work at a laptop.",
    width: 2159,
    height: 2159,
  },
  {
    src: "amie polaroid white hoodie.webp",
    alt: "Polaroid portrait of Amie in a white Eleif hoodie.",
    width: 2962,
    height: 3933,
  },
  {
    src: "model with grey hoodie.webp",
    alt: "Model styling a grey Eleif hoodie for a portrait session.",
    width: 720,
    height: 958,
  },
  {
    src: "max polaroid black hoodie.webp",
    alt: "Max posing in a black Eleif hoodie captured on Polaroid film.",
    width: 3024,
    height: 4032,
  },
  {
    src: "light grey hoodie, surf background.webp",
    alt: "Light grey Eleif hoodie photographed in front of a surf backdrop.",
    width: 1440,
    height: 1800,
  },
  {
    src: "black hoodie in in out burger.webp",
    alt: "Community member in a black Eleif hoodie outside In-N-Out Burger.",
    width: 2316,
    height: 3088,
  },
  {
    src: "matt white hoodie.webp",
    alt: "Matt modeling a white Eleif hoodie with confident energy.",
    width: 3024,
    height: 4032,
  },
  {
    src: "mascot and logo.webp",
    alt: "Eleif mascot celebrating with the brand's logo wall.",
    width: 3024,
    height: 4032,
  },
  {
    src: "blonde model in light grey hoodie.webp",
    alt: "Blonde model showcasing a light grey Eleif hoodie.",
    width: 720,
    height: 958,
  },
  {
    src: "white hoodie olympic training center.webp",
    alt: "Eleif white hoodie spotted at the Olympic Training Center.",
    width: 2316,
    height: 3088,
  },
  {
    src: "mascot with grey and black hoodies.webp",
    alt: "Eleif mascot presenting both grey and black hoodies together.",
    width: 1620,
    height: 1889,
  },
  {
    src: "blonde model.webp",
    alt: "Fashion portrait of a blonde model in an Eleif hoodie.",
    width: 720,
    height: 958,
  },
  {
    src: "matt polaroid.webp",
    alt: "Matt captured on Polaroid in an Eleif hoodie.",
    width: 1620,
    height: 2025,
  },
  {
    src: "black hoodie outside.webp",
    alt: "Supporter layering a black Eleif hoodie while outdoors.",
    width: 1242,
    height: 1552,
  },
  {
    src: "model polaroids.webp",
    alt: "Collection of Eleif model polaroids pinned together.",
    width: 3024,
    height: 4032,
  },
  {
    src: "matt polaroid up close.webp",
    alt: "Close-up polaroid of Matt in an Eleif hoodie.",
    width: 3024,
    height: 4032,
  },
  {
    src: "will grey hoodie mascot.webp",
    alt: "Will posing with the Eleif mascot in matching grey hoodies.",
    width: 3024,
    height: 4032,
  },
  {
    src: "will grey hoodie.webp",
    alt: "Will stepping out in a grey Eleif hoodie.",
    width: 3024,
    height: 4032,
  },
]);

const resolveGallerySrc = (src) => {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return encodeURI(`${GALLERY_BASE_PATH}${src}`);
};

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

  galleryManifest.forEach(({ src, alt, width, height }, index) => {
    const figure = document.createElement("figure");
    figure.className = "gallery__item";

    const img = document.createElement("img");
    img.src = resolveGallerySrc(src);
    img.alt = alt || `Eleif community member ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";

    if (Number.isFinite(width) && Number.isFinite(height)) {
      img.setAttribute("width", String(width));
      img.setAttribute("height", String(height));
      img.style.aspectRatio = `${width} / ${height}`;
      figure.style.aspectRatio = `${width} / ${height}`;
    }

    figure.appendChild(img);
    galleryRoot.appendChild(figure);
  });
};

renderGallery();

const defaultTab = "gallery";
const initialHash = window.location.hash.slice(1);
const initialTab = knownTabIds.includes(initialHash) ? initialHash : defaultTab;

activateTab(initialTab, { updateHash: false });

if (modelForm) {
  if (redirectField) {
    const thankYouUrl = new URL("thank-you.html", window.location.href);
    redirectField.value = thankYouUrl.toString();
  }

  modelForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (replyToField && contactInput) {
      const rawValue = contactInput.value.trim();
      const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(rawValue);
      replyToField.value = looksLikeEmail ? rawValue : "";
    }

    if (formError) {
      formError.hidden = true;
      formError.textContent = "";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.loading = "true";
    }

    const formData = new FormData(modelForm);

    try {
      const response = await fetch(modelForm.action, {
        method: modelForm.method || "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (response.ok) {
        const targetUrl = redirectField?.value || new URL("thank-you.html", window.location.href).toString();
        window.location.href = targetUrl;
        return;
      }

      const payload = await response.json().catch(() => null);
      const message =
        payload?.errors?.[0]?.message ||
        payload?.error ||
        "something went wrong while submitting. please try again.";
      if (formError) {
        formError.textContent = message;
        formError.hidden = false;
      } else {
        window.alert(message);
      }
    } catch (error) {
      if (formError) {
        formError.textContent = "we couldn’t reach the server. please check your connection and try again.";
        formError.hidden = false;
      } else {
        window.alert("we couldn’t reach the server. please try again.");
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.dataset.loading = "false";
      }
    }
  });
}

window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1);
  if (knownTabIds.includes(hash)) {
    activateTab(hash, { updateHash: false });
  }
});

let shareFeedbackTimeoutId;

const setShareFeedback = (message) => {
  if (!shareFeedback) {
    return;
  }

  shareFeedback.textContent = message;
  shareFeedback.hidden = false;

  if (shareFeedbackTimeoutId) {
    window.clearTimeout(shareFeedbackTimeoutId);
  }

  shareFeedbackTimeoutId = window.setTimeout(() => {
    shareFeedback.hidden = true;
  }, 4200);
};

if (shareButton) {
  shareButton.addEventListener("click", async () => {
    const shareUrl = new URL("index.html#form", window.location.href).toString();
    const shareData = {
      title: "Eleif Model Application",
      text: "Apply to join the Eleif model community and receive your weighted hoodie.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareFeedback("thanks for sharing the application.");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback("link copied to your clipboard.");
        return;
      }

      window.prompt("Copy this link to share the Eleif model application:", shareUrl);
      setShareFeedback("copy the link above to share the form.");
    } catch (error) {
      setShareFeedback("we couldn’t share automatically. copy the link instead.");
    }
  });
}
