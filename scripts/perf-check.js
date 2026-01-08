const fs = require("fs");
const path = require("path");

const readFile = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

const html = readFile("index.html");
const script = readFile("script.js");
const css = readFile("styles.css");

const mainMatch = html.match(/<img[^>]*data-order-main[^>]*>/i);
if (!mainMatch) {
  throw new Error("missing order main image");
}

const mainTag = mainMatch[0];
if (!/fetchpriority=\"high\"/i.test(mainTag)) {
  throw new Error("order main image missing fetchpriority");
}

if (!/width=\"\d+\"/i.test(mainTag) || !/height=\"\d+\"/i.test(mainTag)) {
  throw new Error("order main image missing width/height");
}

const thumbMatches = html.match(/<button[^>]*data-order-thumb[^>]*>/gi) || [];
if (!thumbMatches.length) {
  throw new Error("missing order thumbnail buttons");
}

thumbMatches.forEach((tag, index) => {
  if (!/data-image-width=\"\d+\"/i.test(tag) || !/data-image-height=\"\d+\"/i.test(tag)) {
    throw new Error(`order thumb ${index + 1} missing dimensions`);
  }
});

const renderCalls = script.match(/renderGallery\(\);/g) || [];
if (renderCalls.length !== 1) {
  throw new Error(`expected 1 renderGallery() call, found ${renderCalls.length}`);
}

if (!script.includes("requestIdleCallback") && !script.includes("setTimeout")) {
  throw new Error("gallery does not schedule idle rendering");
}

if (!script.includes('fetchpriority", "high"')) {
  throw new Error("gallery first image missing fetchpriority");
}

if (!script.includes('index === 0 ? "eager" : "lazy"')) {
  throw new Error("gallery first image not eager");
}

if (!css.includes("safe-area-inset")) {
  throw new Error("missing safe area handling for dialog");
}

if (!css.includes("100dvh") || !css.includes("100svh")) {
  throw new Error("missing dynamic viewport units for dialog");
}

if (!html.includes('data-tab="adopt"')) {
  throw new Error("missing adopt tab");
}

if (!html.includes('data-panel="adopt"')) {
  throw new Error("missing adopt panel");
}

if (!script.includes("adopt: \"eleif · adopt an elephant\"")) {
  throw new Error("missing adopt tab title");
}

if (!html.includes('class="adopt-example"')) {
  throw new Error("missing adopt example dropdown");
}

if (/text-transform:\s*uppercase/i.test(css)) {
  throw new Error("uppercase text-transform still present");
}

const htmlFiles = ["index.html", "thank-you.html", "thank-you-order.html"];
const stripHtml = (value) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

htmlFiles.forEach((file) => {
  const contents = readFile(file);
  const textOnly = stripHtml(contents);
  if (/[A-Z]/.test(textOnly)) {
    throw new Error(`uppercase letter found in visible text for ${file}`);
  }

  if (/placeholder=\"[^\"]*[A-Z][^\"]*\"/.test(contents)) {
    throw new Error(`uppercase letter found in placeholder for ${file}`);
  }
});

console.log("perf checks passed");
