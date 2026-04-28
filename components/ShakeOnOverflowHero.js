/**
 * Shake On Overflow — hero fundraising fill animation
 *
 * ─── Where to change things ─────────────────────────────────────────────
 * LOGO_PATH          → DEFAULTS.logoSrc (or mount option logoSrc)
 * Brand colors       → DEFAULTS.colors + CSS vars on .sohero in .css file
 * Animation duration → DEFAULTS.durationSec + --sohero-duration (CSS)
 * Built-in milestones → DEFAULTS.builtinMilestones (see buildBuiltinMilestoneHtml)
 * Custom captions     → set builtinMilestones false + DEFAULTS.captions
 * Background mode    → DEFAULTS.backgroundMode or data-sohero-bg / mount option
 * ─────────────────────────────────────────────────────────────────────────
 *
 * React usage (no extra deps):
 *   import { mountShakeOnOverflowHero } from './ShakeOnOverflowHero.js';
 *   import './shake-on-overflow-hero.css';
 *   useEffect(() => {
 *     const root = ref.current;
 *     if (!root) return;
 *     const unmount = mountShakeOnOverflowHero(root, { logoSrc: '/assets/your-logo.png' });
 *     return unmount;
 *   }, []);
 */

/** @typedef {'white' | 'transparent' | 'navy'} SoheroBackgroundMode */

/**
 * @typedef {{ text: string, checkCount?: number, showCheck?: boolean }} SoheroCaption
 * checkCount: number of teal ✓ marks after text (default 0). Legacy showCheck: true → 1 check.
 */

export const DEFAULTS = {
  /** Logo asset (project uses white mark on transparent @ repo root). */
  logoSrc: "SO-WHT_1@3x-8.png",
  /** Total loop length in seconds (fill + caption keyframes use % of this timeline). Last ~2s = final hold; see CSS). */
  durationSec: 15,
  /** Page background preset for the hero shell. */
  backgroundMode: /** @type {SoheroBackgroundMode} */ ("white"),
  /** Injects Google Fonts link for Bebas Neue once (set false if the host page already loads it). */
  loadBebasFont: true,
  /** Accessible description of the motion (static copy, not tied to caption strings). */
  ariaLabel:
    "Shake On fundraising progress animation: twenty thousand dollar goal, first hit, forty thousand two-x goal, second hit with two checks, then fifty thousand two and a half x goal with one two and three question marks as the final stretch fills in.",
  /**
   * When true, uses the seven-state Overflow story (timing is fixed in CSS to the 7s loop).
   * Set false and supply `captions` for a custom 4-line (or merged) story instead.
   */
  builtinMilestones: true,
  /** Used only if `builtinMilestones` is false. */
  captions: /** @type {SoheroCaption[]} */ ([
    { text: "$20K Goal", checkCount: 0 },
    { text: "$20K Goal", checkCount: 1 },
    { text: "$40K 2X Goal Hit!", checkCount: 2 },
    { text: "$50K 2.5X Goal???", checkCount: 0 },
  ]),
  /** Optional CSS color overrides for :root-level vars on the section. */
  colors: {
    navy: "#011E42",
    orange: "#FF5F1F",
    teal: "#01B9B3",
    white: "#FFFFFF",
    rim: "#F5F2EC",
  },
};

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

/**
 * @param {SoheroCaption[]} raw
 * @returns {{ text: string, checkCount: number }[]}
 */
function normalizeCaptions(raw) {
  return raw.map((c) => {
    const checkCount =
      typeof c.checkCount === "number"
        ? c.checkCount
        : c.showCheck
          ? 1
          : 0;
    return { text: c.text, checkCount: Math.max(0, Math.min(3, checkCount)) };
  });
}

/**
 * @param {number} n
 */
function qmGroupHtml(n) {
  const q = '<span class="sohero__qm" aria-hidden="true">?</span>';
  const inner = Array.from({ length: n }, () => q).join("");
  return `<span class="sohero__qm-group" aria-hidden="true">${inner}</span>`;
}

/**
 * Seven milestone rows; opacity timing is in `shake-on-overflow-hero.css` (s0–s6).
 * @param {(s: string) => string} esc
 */
function buildBuiltinMilestoneHtml(esc) {
  const t = esc;
  return [
    `<p class="sohero__line sohero__line--s0"><span class="sohero__txt">${t("$20K Goal")}</span></p>`,
    `<p class="sohero__line sohero__line--s1"><span class="sohero__txt">${t("$20K Goal HIT!")}</span><span class="sohero__check" aria-hidden="true">\u2713</span></p>`,
    `<p class="sohero__line sohero__line--s2"><span class="sohero__txt">${t("$40K 2X Goal")}</span></p>`,
    `<p class="sohero__line sohero__line--s3"><span class="sohero__txt">${t("$40K 2X Goal HIT!")}</span><span class="sohero__checks" aria-hidden="true"><span class="sohero__check">\u2713</span><span class="sohero__check">\u2713</span></span></p>`,
    `<p class="sohero__line sohero__line--s4"><span class="sohero__txt">${t("$50K 2.5X Goal")}</span>${qmGroupHtml(1)}</p>`,
    `<p class="sohero__line sohero__line--s5"><span class="sohero__txt">${t("$50K 2.5X Goal")}</span>${qmGroupHtml(2)}</p>`,
    `<p class="sohero__line sohero__line--s6"><span class="sohero__txt">${t("$50K 2.5X Goal")}</span>${qmGroupHtml(3)}</p>`,
  ].join("");
}

/**
 * Same headline + first check on one row (check fades in), then m2 / m3.
 * @param {{ text: string, checkCount: number }[]} captions
 */
function shouldMergeGoalRows(captions) {
  if (!captions || captions.length < 4) return false;
  const a = captions[0];
  const b = captions[1];
  return a.text === b.text && a.checkCount === 0 && b.checkCount === 1;
}

/**
 * @param {{ text: string, checkCount: number }[]} captions
 * @param {(s: string) => string} esc
 * @param {(n: number) => string} checksHtml
 */
function buildCaptionHtml(captions, esc, checksHtml) {
  if (shouldMergeGoalRows(captions)) {
    const c0 = captions[0];
    const c2 = captions[2];
    const c3 = captions[3];
    return [
      `<p class="sohero__line sohero__line--goal">` +
        `<span class="sohero__txt">${esc(c0.text)}</span>` +
        `<span class="sohero__check sohero__check--reveal" aria-hidden="true">\u2713</span>` +
        `</p>`,
      `<p class="sohero__line sohero__line--m2">` +
        `<span class="sohero__txt">${esc(c2.text)}</span>${checksHtml(c2.checkCount)}</p>`,
      `<p class="sohero__line sohero__line--m3">` +
        `<span class="sohero__txt">${esc(c3.text)}</span>${checksHtml(c3.checkCount)}</p>`,
    ].join("");
  }
  const lineClass = ["intro", "m1", "m2", "m3"];
  return captions
    .map((cap, i) => {
      const cls = lineClass[i] ?? `m${i}`;
      return `<p class="sohero__line sohero__line--${cls}">
        <span class="sohero__txt">${esc(cap.text)}</span>${checksHtml(cap.checkCount)}</p>`;
    })
    .join("");
}

/**
 * @param {HTMLElement} container
 * @param {Partial<typeof DEFAULTS> & { logoSrc?: string; backgroundMode?: SoheroBackgroundMode; durationSec?: number; captions?: SoheroCaption[]; ariaLabel?: string; colors?: typeof DEFAULTS.colors; loadBebasFont?: boolean; builtinMilestones?: boolean }} [options]
 * @returns {() => void} unmount
 */
export function mountShakeOnOverflowHero(container, options = {}) {
  const config = {
    ...DEFAULTS,
    ...options,
    builtinMilestones:
      options.builtinMilestones ?? DEFAULTS.builtinMilestones,
    captions: normalizeCaptions(options.captions ?? DEFAULTS.captions),
    colors: { ...DEFAULTS.colors, ...options.colors },
  };

  if (config.loadBebasFont && typeof document !== "undefined") {
    const fid = "sohero-bebas-neue-font";
    if (!document.getElementById(fid)) {
      const link = document.createElement("link");
      link.id = fid;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=block";
      document.head.appendChild(link);
    }
  }

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const section = document.createElement("section");
  section.className = "sohero";
  section.setAttribute("data-sohero-bg", config.backgroundMode);
  section.setAttribute("aria-label", config.ariaLabel);
  section.style.setProperty("--sohero-duration", `${config.durationSec}s`);
  section.style.setProperty("--sohero-navy", config.colors.navy);
  section.style.setProperty("--sohero-orange", config.colors.orange);
  section.style.setProperty("--sohero-teal", config.colors.teal);
  section.style.setProperty("--sohero-white", config.colors.white);
  section.style.setProperty("--sohero-rim", config.colors.rim);

  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  const checksHtml = (n) => {
    if (!n) return "";
    const inner = Array.from(
      { length: n },
      () => `<span class="sohero__check" aria-hidden="true">\u2713</span>`
    ).join("");
    return `<span class="sohero__checks" aria-hidden="true">${inner}</span>`;
  };

  const capHtml = config.builtinMilestones
    ? buildBuiltinMilestoneHtml(esc)
    : buildCaptionHtml(config.captions, esc, checksHtml);

  section.innerHTML = `
    <div class="sohero__layout">
      <div class="sohero__caption" aria-hidden="true">${capHtml}</div>
      <div class="sohero__stage" aria-hidden="true"></div>
    </div>
  `;

  const stage = section.querySelector(".sohero__stage");
  if (!stage) {
    throw new Error("ShakeOnOverflowHero: stage node missing");
  }

  const svg = buildSvg(config.logoSrc, reduced);
  stage.appendChild(svg);

  /** Prevent layout shift: reserve aspect ratio box already in CSS */
  container.appendChild(section);

  return () => {
    section.remove();
  };
}

/**
 * @param {string} logoSrc
 * @param {boolean} reducedMotion
 */
function buildSvg(logoSrc, reducedMotion) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "sohero__svg");
  svg.setAttribute("viewBox", "0 0 1889 633");
  svg.setAttribute("width", "1889");
  svg.setAttribute("height", "633");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("focusable", "false");

  const defs = document.createElementNS(SVG_NS, "defs");

  const mask = document.createElementNS(SVG_NS, "mask");
  mask.setAttribute("id", "sohero-logo-mask");
  mask.setAttribute("maskUnits", "userSpaceOnUse");
  mask.setAttribute("maskContentUnits", "userSpaceOnUse");
  mask.setAttribute("x", "0");
  mask.setAttribute("y", "0");
  mask.setAttribute("width", "1889");
  mask.setAttribute("height", "633");

  const maskImg = document.createElementNS(SVG_NS, "image");
  maskImg.setAttributeNS(XLINK_NS, "href", logoSrc);
  maskImg.setAttribute("href", logoSrc);
  maskImg.setAttribute("width", "1889");
  maskImg.setAttribute("height", "633");
  maskImg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  maskImg.setAttribute("x", "0");
  maskImg.setAttribute("y", "0");
  mask.appendChild(maskImg);

  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", "sohero-wave");
  filter.setAttribute("x", "-4%");
  filter.setAttribute("y", "-4%");
  filter.setAttribute("width", "108%");
  filter.setAttribute("height", "108%");
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const turb = document.createElementNS(SVG_NS, "feTurbulence");
  turb.setAttribute("type", "fractalNoise");
  turb.setAttribute("baseFrequency", "0.012 0.35");
  turb.setAttribute("numOctaves", "1");
  turb.setAttribute("seed", "42");
  turb.setAttribute("result", "soheroNoise");

  if (!reducedMotion) {
    const anim = document.createElementNS(SVG_NS, "animate");
    anim.setAttribute("attributeName", "baseFrequency");
    anim.setAttribute(
      "values",
      "0.012 0.35;0.014 0.38;0.011 0.33;0.012 0.35"
    );
    anim.setAttribute("dur", "8s");
    anim.setAttribute("repeatCount", "indefinite");
    turb.appendChild(anim);
  }

  const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
  disp.setAttribute("in", "SourceGraphic");
  disp.setAttribute("in2", "soheroNoise");
  disp.setAttribute("scale", reducedMotion ? "0" : "2.2");
  disp.setAttribute("xChannelSelector", "R");
  disp.setAttribute("yChannelSelector", "G");

  if (!reducedMotion) {
    const animD = document.createElementNS(SVG_NS, "animate");
    animD.setAttribute("attributeName", "scale");
    animD.setAttribute("values", "1.9;2.6;2.1;1.9");
    animD.setAttribute("dur", "6.5s");
    animD.setAttribute("repeatCount", "indefinite");
    disp.appendChild(animD);
  }

  filter.appendChild(turb);
  filter.appendChild(disp);

  const rimGrad = document.createElementNS(SVG_NS, "linearGradient");
  rimGrad.setAttribute("id", "sohero-rim-grad");
  rimGrad.setAttribute("x1", "0");
  rimGrad.setAttribute("y1", "0");
  rimGrad.setAttribute("x2", "0");
  rimGrad.setAttribute("y2", "1");
  const s0 = document.createElementNS(SVG_NS, "stop");
  s0.setAttribute("offset", "0%");
  s0.setAttribute("stop-color", "#ffffff");
  s0.setAttribute("stop-opacity", "0.22");
  const s1 = document.createElementNS(SVG_NS, "stop");
  s1.setAttribute("offset", "18%");
  s1.setAttribute("stop-color", "#ffffff");
  s1.setAttribute("stop-opacity", "0");
  rimGrad.appendChild(s0);
  rimGrad.appendChild(s1);

  defs.appendChild(mask);
  defs.appendChild(filter);
  defs.appendChild(rimGrad);
  svg.appendChild(defs);

  const masked = document.createElementNS(SVG_NS, "g");
  masked.setAttribute("mask", "url(#sohero-logo-mask)");

  const W = 1889;
  const H = 633;

  const orangeG = document.createElementNS(SVG_NS, "g");
  orangeG.setAttribute("class", "sohero__lift-orange");
  const orange = document.createElementNS(SVG_NS, "rect");
  orange.setAttribute("x", "0");
  orange.setAttribute("y", "0");
  orange.setAttribute("width", String(W));
  orange.setAttribute("height", String(H));
  orange.setAttribute("fill", "var(--sohero-orange)");
  if (!reducedMotion) orange.setAttribute("filter", "url(#sohero-wave)");
  const orangeRim = document.createElementNS(SVG_NS, "rect");
  orangeRim.setAttribute("x", "0");
  orangeRim.setAttribute("y", "0");
  orangeRim.setAttribute("width", String(W));
  orangeRim.setAttribute("height", String(H * 0.14));
  orangeRim.setAttribute("fill", "url(#sohero-rim-grad)");
  orangeRim.setAttribute("style", "mix-blend-mode: soft-light");
  orangeRim.setAttribute("pointer-events", "none");
  orangeG.appendChild(orange);
  orangeG.appendChild(orangeRim);

  const tealG = document.createElementNS(SVG_NS, "g");
  tealG.setAttribute("class", "sohero__lift-teal");
  const teal = document.createElementNS(SVG_NS, "rect");
  teal.setAttribute("x", "0");
  teal.setAttribute("y", "0");
  teal.setAttribute("width", String(W));
  teal.setAttribute("height", String(H));
  teal.setAttribute("fill", "var(--sohero-teal)");
  if (!reducedMotion) teal.setAttribute("filter", "url(#sohero-wave)");
  const tealRim = document.createElementNS(SVG_NS, "rect");
  tealRim.setAttribute("x", "0");
  tealRim.setAttribute("y", "0");
  tealRim.setAttribute("width", String(W));
  tealRim.setAttribute("height", String(H * 0.14));
  tealRim.setAttribute("fill", "url(#sohero-rim-grad)");
  tealRim.setAttribute("style", "mix-blend-mode: soft-light");
  tealRim.setAttribute("pointer-events", "none");
  tealG.appendChild(teal);
  tealG.appendChild(tealRim);

  const navyG = document.createElementNS(SVG_NS, "g");
  navyG.setAttribute("class", "sohero__lift-navy");
  const navy = document.createElementNS(SVG_NS, "rect");
  navy.setAttribute("x", "0");
  navy.setAttribute("y", "0");
  navy.setAttribute("width", String(W));
  navy.setAttribute("height", String(H));
  navy.setAttribute("fill", "var(--sohero-navy)");
  if (!reducedMotion) navy.setAttribute("filter", "url(#sohero-wave)");
  const navyRim = document.createElementNS(SVG_NS, "rect");
  navyRim.setAttribute("x", "0");
  navyRim.setAttribute("y", "0");
  navyRim.setAttribute("width", String(W));
  navyRim.setAttribute("height", String(H * 0.14));
  navyRim.setAttribute("fill", "url(#sohero-rim-grad)");
  navyRim.setAttribute("style", "mix-blend-mode: soft-light");
  navyRim.setAttribute("pointer-events", "none");
  navyG.appendChild(navy);
  navyG.appendChild(navyRim);

  masked.appendChild(orangeG);
  masked.appendChild(tealG);
  masked.appendChild(navyG);
  svg.appendChild(masked);

  return svg;
}
