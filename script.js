const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const tabs = Array.from(document.querySelectorAll(".tabs__button"));
const panels = Array.from(document.querySelectorAll(".panel"));
const galleryRoot = document.querySelector("[data-gallery]");
const galleryEmptyState = document.querySelector("[data-gallery-empty]");
const modelForm = document.querySelector("[data-model-form]");
const shareButton = document.querySelector("[data-share-form]");
const shareFeedback = document.querySelector("[data-share-feedback]");
const howItWorksTrigger = document.querySelector("[data-how-it-works-trigger]");
const howItWorksDialog = document.querySelector("[data-how-it-works-dialog]");
const howItWorksCloseButtons = Array.from(document.querySelectorAll("[data-how-it-works-close]"));
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
const orderMedia = document.querySelector("[data-order-media]");
const orderMainImage =
  orderMedia instanceof HTMLElement ? orderMedia.querySelector("[data-order-main]") : null;
const orderThumbButtons = orderMedia
  ? Array.from(orderMedia.querySelectorAll("[data-order-thumb]"))
  : [];
const STORAGE_KEY = "atelier-theme";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const storage = (() => {
  const fallback = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  if (!("localStorage" in window)) {
    return fallback;
  }

  try {
    const testKey = "__eleif_storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    return fallback;
  }
})();

const getMatchMedia = (query) => {
  if (typeof window.matchMedia !== "function") {
    return null;
  }

  return window.matchMedia(query);
};

const addMediaListener = (mediaQuery, handler) => {
  if (!mediaQuery || typeof handler !== "function") {
    return;
  }

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handler);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handler);
  }
};

const resolveOrderThumbData = (button) => {
  const img = button.querySelector("img");
  const imgWidth = img ? img.getAttribute("width") : null;
  const imgHeight = img ? img.getAttribute("height") : null;
  const imgSrc = img ? img.getAttribute("src") : null;
  const imgAlt = img ? img.getAttribute("alt") : null;
  const width = Number(button.dataset.imageWidth || imgWidth);
  const height = Number(button.dataset.imageHeight || imgHeight);
  return {
    src: button.dataset.imageSrc || imgSrc,
    alt: button.dataset.imageAlt || imgAlt,
    width: Number.isFinite(width) && width > 0 ? width : null,
    height: Number.isFinite(height) && height > 0 ? height : null,
  };
};

const setOrderMainFromThumb = (button) => {
  if (!(orderMainImage instanceof HTMLImageElement)) {
    return;
  }

  const { src, alt, width, height } = resolveOrderThumbData(button);
  if (!src) {
    return;
  }

  orderMainImage.src = src;
  if (alt) {
    orderMainImage.alt = alt;
  }

  if (width && height) {
    orderMainImage.setAttribute("width", String(width));
    orderMainImage.setAttribute("height", String(height));
  }

  orderThumbButtons.forEach((thumb) => {
    const isActive = thumb === button;
    thumb.classList.toggle("order-media__thumb--active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
  });
};

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

const setHidden = (element, shouldHide) => {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  if (shouldHide) {
    element.setAttribute("hidden", "");
  } else {
    element.removeAttribute("hidden");
  }
};

const clearChildren = (element) => {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  if (typeof element.replaceChildren === "function") {
    element.replaceChildren();
    return;
  }

  while (element.firstChild) {
    element.removeChild(element.firstChild);
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
        const redirectValue = redirectField && redirectField.value ? redirectField.value : null;
        const targetUrl = redirectValue || resolvedFallback || toAbsoluteUrl("thank-you.html");
        window.location.href = targetUrl;
        return;
      }

      const payload = await response.json().catch(() => null);
      const payloadErrors = payload && Array.isArray(payload.errors) ? payload.errors : null;
      const firstError = payloadErrors && payloadErrors[0] ? payloadErrors[0].message : null;
      const message =
        firstError ||
        (payload && payload.error) ||
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

const hasDialogElement = typeof HTMLDialogElement !== "undefined";
const canUseNativeHowItWorksDialog =
  hasDialogElement &&
  howItWorksDialog instanceof HTMLDialogElement &&
  typeof howItWorksDialog.showModal === "function" &&
  typeof howItWorksDialog.close === "function";

let howItWorksOverlay = null;
let howItWorksLastFocus = null;
let releaseFallbackFocusTrap = null;

const focusableDialogSelector =
  'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

if (!canUseNativeHowItWorksDialog && howItWorksDialog instanceof HTMLElement) {
  howItWorksDialog.setAttribute("role", "dialog");
  howItWorksDialog.setAttribute("aria-modal", "true");
  howItWorksDialog.setAttribute("tabindex", "-1");
  howItWorksDialog.setAttribute("aria-hidden", "true");
  howItWorksDialog.hidden = true;

  const existingOverlay = document.querySelector(".dialog-overlay");
  if (existingOverlay instanceof HTMLElement) {
    howItWorksOverlay = existingOverlay;
  } else {
    const fallbackOverlay = document.createElement("div");
    fallbackOverlay.className = "dialog-overlay";
    document.body.appendChild(fallbackOverlay);
    howItWorksOverlay = fallbackOverlay;
  }
}

const setHowItWorksExpanded = (expanded) => {
  if (howItWorksTrigger) {
    howItWorksTrigger.setAttribute("aria-expanded", String(Boolean(expanded)));
  }
};

const isHowItWorksOpen = () => {
  if (!(howItWorksDialog instanceof HTMLElement)) {
    return false;
  }

  if (canUseNativeHowItWorksDialog) {
    return howItWorksDialog.open;
  }

  return howItWorksDialog.dataset.state === "open";
};

const activateFallbackFocusTrap = () => {
  if (!(howItWorksDialog instanceof HTMLElement)) {
    return;
  }

  const focusable = Array.from(
    howItWorksDialog.querySelectorAll(focusableDialogSelector)
  ).filter((element) => element instanceof HTMLElement && element.tabIndex !== -1);

  const fallbackTarget = (focusable[0] || howItWorksDialog);

  const handleFocus = (event) => {
    if (!howItWorksDialog.contains(event.target)) {
      fallbackTarget.focus({ preventScroll: true });
      event.stopPropagation();
    }
  };

  const handleKeydown = (event) => {
    if (event.key !== "Tab") {
      return;
    }

    if (!focusable.length) {
      event.preventDefault();
      fallbackTarget.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      (last || fallbackTarget).focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      (first || fallbackTarget).focus({ preventScroll: true });
    }
  };

  document.addEventListener("focus", handleFocus, true);
  howItWorksDialog.addEventListener("keydown", handleKeydown);

  releaseFallbackFocusTrap = () => {
    document.removeEventListener("focus", handleFocus, true);
    howItWorksDialog.removeEventListener("keydown", handleKeydown);
    releaseFallbackFocusTrap = null;
  };
};

const finalizeHowItWorksClose = () => {
  if (document.body) {
    document.body.classList.remove("dialog-open");
  }

  if (howItWorksOverlay) {
    howItWorksOverlay.dataset.visible = "false";
  }

  setHowItWorksExpanded(false);

  if (typeof releaseFallbackFocusTrap === "function") {
    releaseFallbackFocusTrap();
  }

  if (howItWorksLastFocus instanceof HTMLElement) {
    howItWorksLastFocus.focus({ preventScroll: true });
  }

  howItWorksLastFocus = null;

  if (!canUseNativeHowItWorksDialog && howItWorksDialog instanceof HTMLElement) {
    howItWorksDialog.setAttribute("aria-hidden", "true");
  }
};

const openHowItWorksDialog = () => {
  if (!(howItWorksDialog instanceof HTMLElement) || isHowItWorksOpen()) {
    return;
  }

  howItWorksLastFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (document.body) {
    document.body.classList.add("dialog-open");
  }

  setHowItWorksExpanded(true);

  if (howItWorksOverlay) {
    howItWorksOverlay.dataset.visible = "true";
  }

  if (canUseNativeHowItWorksDialog) {
    howItWorksDialog.showModal();
    return;
  }

  howItWorksDialog.hidden = false;
  howItWorksDialog.removeAttribute("aria-hidden");
  howItWorksDialog.setAttribute("open", "");
  howItWorksDialog.dataset.state = "open";

  activateFallbackFocusTrap();

  const focusTarget = howItWorksDialog.querySelector(focusableDialogSelector);

  if (focusTarget instanceof HTMLElement) {
    focusTarget.focus({ preventScroll: true });
  } else {
    howItWorksDialog.focus({ preventScroll: true });
  }
};

const closeHowItWorksDialog = () => {
  if (!(howItWorksDialog instanceof HTMLElement) || !isHowItWorksOpen()) {
    return;
  }

  if (canUseNativeHowItWorksDialog) {
    howItWorksDialog.close();
    return;
  }

  howItWorksDialog.dataset.state = "closed";
  howItWorksDialog.removeAttribute("open");
  howItWorksDialog.hidden = true;
  howItWorksDialog.setAttribute("aria-hidden", "true");

  finalizeHowItWorksClose();
};

const handleFallbackKeydown = (event) => {
  if (event.key === "Escape" && !event.defaultPrevented && isHowItWorksOpen()) {
    event.preventDefault();
    closeHowItWorksDialog();
  }
};

if (howItWorksTrigger && howItWorksDialog) {
  howItWorksTrigger.addEventListener("click", () => {
    openHowItWorksDialog();
  });
}

howItWorksCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeHowItWorksDialog();
  });
});

if (howItWorksDialog instanceof HTMLElement) {
  howItWorksDialog.addEventListener("click", (event) => {
    if (event.target === howItWorksDialog) {
      closeHowItWorksDialog();
    }
  });
}

if (canUseNativeHowItWorksDialog && howItWorksDialog) {
  howItWorksDialog.addEventListener("close", () => {
    finalizeHowItWorksClose();
  });

  howItWorksDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeHowItWorksDialog();
  });
} else if (howItWorksDialog instanceof HTMLElement) {
  window.addEventListener("keydown", handleFallbackKeydown, true);
  if (howItWorksOverlay) {
    howItWorksOverlay.addEventListener("click", () => {
      closeHowItWorksDialog();
    });
  }
}

const prefersDark = getMatchMedia("(prefers-color-scheme: dark)");

const applyTheme = (theme) => {
  const safeTheme = theme === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", safeTheme);
  storage.setItem(STORAGE_KEY, safeTheme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(safeTheme === "dark"));
    themeToggle.setAttribute("data-state", safeTheme === "dark" ? "dark" : "light");
  }
};

const storedTheme = storage.getItem(STORAGE_KEY);
const prefersDarkMode = prefersDark ? prefersDark.matches : false;
const currentTheme = storedTheme || (prefersDarkMode ? "dark" : "light");

applyTheme(currentTheme);

addMediaListener(prefersDark, (event) => {
  const stored = storage.getItem(STORAGE_KEY);
  if (!stored) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

const knownTabIds = tabs.map((tab) => tab.dataset.tab);
const TAB_TITLES = Object.freeze({
  gallery: "eleif · gallery",
  model: "eleif · model application",
  order: "eleif · order",
  adopt: "eleif · adopt an elephant",
});
const DEFAULT_TITLE = "eleif · premium weighted hoodies";

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
    if (isActive) {
      panel.classList.add("panel--active");
    } else {
      panel.classList.remove("panel--active");
    }
    setHidden(panel, !isActive);
  });

  if (safeTargetId === "gallery") {
    renderGallery();
  }

  if (typeof document !== "undefined" && "title" in document) {
    document.title = TAB_TITLES[safeTargetId] || DEFAULT_TITLE;
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

let galleryIdleHandle = null;

const cancelGalleryIdle = () => {
  if (!galleryIdleHandle) {
    return;
  }

  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(galleryIdleHandle);
  } else {
    window.clearTimeout(galleryIdleHandle);
  }

  galleryIdleHandle = null;
};

const createGalleryItem = ({ src, alt, width, height }, index) => {
  const figure = document.createElement("figure");
  figure.className = "gallery__item";

  const img = document.createElement("img");
  img.src = resolveGallerySrc(src);
  img.alt = alt || `eleif community member ${index + 1}`;
  img.loading = index === 0 ? "eager" : "lazy";
  img.decoding = "async";

  if (index === 0) {
    img.setAttribute("fetchpriority", "high");
  }

  if (Number.isFinite(width) && Number.isFinite(height)) {
    img.setAttribute("width", String(width));
    img.setAttribute("height", String(height));
    img.style.aspectRatio = `${width} / ${height}`;
    figure.style.aspectRatio = `${width} / ${height}`;
  }

  figure.appendChild(img);
  return figure;
};

const appendGalleryItems = (items, startIndex = 0) => {
  if (!galleryRoot) {
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((entry, offset) => {
    fragment.appendChild(createGalleryItem(entry, startIndex + offset));
  });

  galleryRoot.appendChild(fragment);
};

const renderGallery = () => {
  if (!galleryRoot) {
    return;
  }

  cancelGalleryIdle();
  clearChildren(galleryRoot);

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

  const initialCount = Math.min(6, randomized.length);
  appendGalleryItems(randomized.slice(0, initialCount));

  if (randomized.length > initialCount) {
    const appendRemaining = () => {
      appendGalleryItems(randomized.slice(initialCount), initialCount);
      galleryIdleHandle = null;
    };

    if (typeof window.requestIdleCallback === "function") {
      galleryIdleHandle = window.requestIdleCallback(appendRemaining, { timeout: 1200 });
    } else {
      galleryIdleHandle = window.setTimeout(appendRemaining, 200);
    }
  }
};

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

if (orderThumbButtons.length) {
  orderThumbButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setOrderMainFromThumb(button);
    });
  });

  const activeThumb =
    orderThumbButtons.find((button) => button.getAttribute("aria-pressed") === "true") ||
    orderThumbButtons[0];

  if (activeThumb) {
    setOrderMainFromThumb(activeThumb);
  }
}

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

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
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
