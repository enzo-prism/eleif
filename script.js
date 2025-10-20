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
const modelFormError =
  modelForm instanceof HTMLFormElement ? modelForm.querySelector("[data-form-error]") : null;
const modelSubmitButton =
  modelForm instanceof HTMLFormElement ? modelForm.querySelector('button[type="submit"]') : null;
const orderForm = document.querySelector("[data-order-form]");
const orderEmailInput =
  orderForm instanceof HTMLFormElement ? orderForm.querySelector("#order-email") : null;
const orderReplyField =
  orderForm instanceof HTMLFormElement ? orderForm.querySelector('input[name="_replyto"]') : null;
const orderRedirectField =
  orderForm instanceof HTMLFormElement ? orderForm.querySelector('input[name="_redirect"]') : null;
const orderError =
  orderForm instanceof HTMLFormElement ? orderForm.querySelector("[data-order-error]") : null;
const orderSubmitButton =
  orderForm instanceof HTMLFormElement ? orderForm.querySelector('button[type="submit"]') : null;
const STORAGE_KEY = "atelier-theme";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const toAbsoluteUrl = (value) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, window.location.href).toString();
  } catch (error) {
    return value;
  }
};

const setupFormSubmission = ({
  form,
  redirectField,
  replySource,
  replyField,
  submitButton,
  errorNode,
  fallbackRedirect,
}) => {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const resolvedFallback = toAbsoluteUrl(fallbackRedirect);

  if (redirectField) {
    redirectField.value = toAbsoluteUrl(redirectField.value || fallbackRedirect) || resolvedFallback;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      return;
    }

    if (replyField && replySource) {
      const rawValue = replySource.value.trim();
      replyField.value = EMAIL_PATTERN.test(rawValue) ? rawValue : "";
    }

    if (errorNode) {
      errorNode.hidden = true;
      errorNode.textContent = "";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.loading = "true";
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (response.ok) {
        const targetUrl = redirectField?.value || resolvedFallback || toAbsoluteUrl("thank-you.html");
        window.location.href = targetUrl;
        return;
      }

      const payload = await response.json().catch(() => null);
      const message =
        payload?.errors?.[0]?.message ||
        payload?.error ||
        "something went wrong while submitting. please try again.";

      if (errorNode) {
        errorNode.textContent = message;
        errorNode.hidden = false;
      } else {
        window.alert(message);
      }
    } catch (error) {
      if (errorNode) {
        errorNode.textContent = "we couldn’t reach the server. please check your connection and try again.";
        errorNode.hidden = false;
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
};

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = (theme) => {
  const safeTheme = theme === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", safeTheme);
  localStorage.setItem(STORAGE_KEY, safeTheme);
  themeToggle.setAttribute("aria-pressed", String(safeTheme === "dark"));
  themeToggle.setAttribute("data-state", safeTheme === "dark" ? "dark" : "light");
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

const normalizeTabId = (id) => {
  if (id === "form") {
    return "model";
  }
  return id;
};

const activateTab = (targetId, { updateHash = true } = {}) => {
  const safeTargetId = normalizeTabId(targetId);

  if (!safeTargetId || !knownTabIds.includes(safeTargetId)) {
    return;
  }

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === safeTargetId;
    tab.classList.toggle("tabs__button--active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === safeTargetId;
    panel.classList.toggle("panel--active", isActive);
    panel.toggleAttribute("hidden", !isActive);
  });

  if (safeTargetId === "gallery") {
    renderGallery();
  }

  if (updateHash && typeof history.replaceState === "function") {
    history.replaceState(null, "", `#${safeTargetId}`);
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
    alt: "amie wearing a white eleif hoodie against a surf-inspired backdrop.",
    width: 3024,
    height: 4032,
  },
  {
    src: "white hoodie team usa.webp",
    alt: "eleif white hoodie styled in front of a team usa mural.",
    width: 2316,
    height: 2895,
  },
  {
    src: "black hoodie album background.webp",
    alt: "black eleif hoodie displayed against a wall of vinyl albums.",
    width: 1242,
    height: 2208,
  },
  {
    src: "enzo black hoodie with mom.webp",
    alt: "enzo and his mom matching in black eleif hoodies.",
    width: 3024,
    height: 4032,
  },
  {
    src: "hoodie and watch.webp",
    alt: "close-up of an eleif hoodie cuff paired with a sleek watch.",
    width: 1225,
    height: 1225,
  },
  {
    src: "mascot at computer.webp",
    alt: "eleif elephant mascot catching up on work at a laptop.",
    width: 2159,
    height: 2159,
  },
  {
    src: "amie polaroid white hoodie.webp",
    alt: "polaroid portrait of amie in a white eleif hoodie.",
    width: 2962,
    height: 3933,
  },
  {
    src: "model with grey hoodie.webp",
    alt: "model styling a grey eleif hoodie for a portrait session.",
    width: 720,
    height: 958,
  },
  {
    src: "max polaroid black hoodie.webp",
    alt: "max posing in a black eleif hoodie captured on polaroid film.",
    width: 3024,
    height: 4032,
  },
  {
    src: "light grey hoodie, surf background.webp",
    alt: "light grey eleif hoodie photographed in front of a surf backdrop.",
    width: 1440,
    height: 1800,
  },
  {
    src: "black hoodie in in out burger.webp",
    alt: "community member in a black eleif hoodie outside in-n-out burger.",
    width: 2316,
    height: 3088,
  },
  {
    src: "matt white hoodie.webp",
    alt: "matt modeling a white eleif hoodie with confident energy.",
    width: 3024,
    height: 4032,
  },
  {
    src: "mascot and logo.webp",
    alt: "eleif mascot celebrating with the brand's logo wall.",
    width: 3024,
    height: 4032,
  },
  {
    src: "blonde model in light grey hoodie.webp",
    alt: "blonde model showcasing a light grey eleif hoodie.",
    width: 720,
    height: 958,
  },
  {
    src: "white hoodie olympic training center.webp",
    alt: "eleif white hoodie spotted at the olympic training center.",
    width: 2316,
    height: 3088,
  },
  {
    src: "mascot with grey and black hoodies.webp",
    alt: "eleif mascot presenting both grey and black hoodies together.",
    width: 1620,
    height: 1889,
  },
  {
    src: "blonde model.webp",
    alt: "fashion portrait of a blonde model in an eleif hoodie.",
    width: 720,
    height: 958,
  },
  {
    src: "matt polaroid.webp",
    alt: "matt captured on polaroid in an eleif hoodie.",
    width: 1620,
    height: 2025,
  },
  {
    src: "black hoodie outside.webp",
    alt: "supporter layering a black eleif hoodie while outdoors.",
    width: 1242,
    height: 1552,
  },
  {
    src: "model polaroids.webp",
    alt: "collection of eleif model polaroids pinned together.",
    width: 3024,
    height: 4032,
  },
  {
    src: "matt polaroid up close.webp",
    alt: "close-up polaroid of matt in an eleif hoodie.",
    width: 3024,
    height: 4032,
  },
  {
    src: "will grey hoodie mascot.webp",
    alt: "will posing with the eleif mascot in matching grey hoodies.",
    width: 3024,
    height: 4032,
  },
  {
    src: "will grey hoodie.webp",
    alt: "will stepping out in a grey eleif hoodie.",
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

  const randomized = galleryManifest
    .map((entry) => ({ entry, rank: Math.random() }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ entry }) => entry);

  randomized.forEach(({ src, alt, width, height }, index) => {
    const figure = document.createElement("figure");
    figure.className = "gallery__item";

    const img = document.createElement("img");
    img.src = resolveGallerySrc(src);
    img.alt = alt || `eleif community member ${index + 1}`;
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
const initialHash = normalizeTabId(window.location.hash.slice(1));
const initialTab = knownTabIds.includes(initialHash) ? initialHash : defaultTab;

activateTab(initialTab, { updateHash: false });

setupFormSubmission({
  form: modelForm,
  redirectField,
  replySource: contactInput,
  replyField: replyToField,
  submitButton: modelSubmitButton,
  errorNode: modelFormError,
  fallbackRedirect: "thank-you.html",
});

setupFormSubmission({
  form: orderForm,
  redirectField: orderRedirectField,
  replySource: orderEmailInput,
  replyField: orderReplyField,
  submitButton: orderSubmitButton,
  errorNode: orderError,
  fallbackRedirect: "thank-you-order.html",
});

window.addEventListener("hashchange", () => {
  const hash = normalizeTabId(window.location.hash.slice(1));
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
    const shareUrl = new URL("index.html#model", window.location.href).toString();
    const shareData = {
      title: "eleif model application",
      text: "apply to join the eleif model community and receive your weighted hoodie.",
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

      window.prompt("copy this link to share the eleif model application:", shareUrl);
      setShareFeedback("copy the link above to share the form.");
    } catch (error) {
      setShareFeedback("we couldn’t share automatically. copy the link instead.");
    }
  });
}
