# Shake On Overflow Hero — Handoff for Implementation or Regeneration

This document describes the **final** “Overflow” fundraising hero: an infinite CSS-driven loop with an optional opening still, a logo-shaped liquid fill (orange → teal → navy), stacked milestone captions, and gold confetti on the final hit. Another AI (or engineer) may **reuse assets and copy as-is** or **swap them** for a future campaign while keeping the same architecture.

---

## 1. Purpose and UX (what ships)

- **Looping story**: Opens with a **pledge / campaign still** (optional), then animates **three liquid fills** inside a **logo mask** (bottom-up: orange, then teal, then navy), synchronized with **milestone headlines** above the mark.
- **Milestone pattern** (built-in, six lines):  
  `$20K Goal` → `$20K Goal HIT!` + ✓ → `$40K 2X Goal` → `$40K 2X Goal HIT!` + ✓✓ → `$50K 2.5X Goal` → `$50K 2.5X Goal HIT!` + ✓✓✓ + **gold confetti** (two particle layers).
- **Accessibility**: `prefers-reduced-motion: reduce` shows a static meaningful frame (no intro banner animation, no confetti, fills/captions static). `aria-label` on the `<section>` summarizes motion for assistive tech.
- **Hosting**: The hero is an **ES module** (`ShakeOnOverflowHero.js`). It must be loaded over **HTTP(S)** (not `file://` alone). Demo: `preview-hero.sh` → `shake-on-overflow-hero.html`.

---

## 2. Swappable elements (use as-is or modify)

| Element | Role | Default / typical asset | How to change |
|--------|------|---------------------------|----------------|
| **Starting image** | Full-bleed intro card at loop start; fades out | `assets/ally-pledge-intro-banner.png` | `introBannerSrc` (path relative to page URL). Empty string `""` omits the node (CSS timing is still authored for **27s with intro**—see §7 if you remove intro). |
| **Logo (mask)** | Defines silhouette for fills; PNG used as SVG `<mask>` image | `SO-WHT_1@3x-8.png` (often at site root) | `logoSrc`. **ViewBox is fixed** `0 0 1889 633` in JS—replace art with same aspect or update `buildSvg` dimensions and CSS `aspect-ratio`. |
| **Milestones (copy)** | Six stacked `<p>` lines; opacity-only crossfades | Built-in strings in `buildBuiltinMilestoneHtml` | Edit that function **or** set `builtinMilestones: false` and pass `captions` + wire CSS classes `sohero__line--intro`, `--m1`, etc., **or** add new `sohero__line--s*` rows and matching `@keyframes sohero-cap-s*`. |
| **Palette** | Orange / teal / navy / white / rim | `DEFAULTS.colors` | Mount `colors` partial override **and/or** `.sohero` CSS variables in `shake-on-overflow-hero.css`. |
| **Confetti** | Gold rectangles, burst + linger layers | `CONFETTI_COLORS` + counts in `appendConfettiLayer` | Change palette, `n`, angles, or CSS `@keyframes sohero-confetti-*`. |
| **Total loop length** | Single timeline for intro + fills + captions + confetti | **27s** (`SOHERO_LOOP_DURATION_SEC`) | Must stay consistent between `DEFAULTS.durationSec`, exported constant, and **all** `%` keyframes in CSS (see §5). |

---

## 3. File map (repo)

| Path | Responsibility |
|------|------------------|
| `components/ShakeOnOverflowHero.js` | `mountShakeOnOverflowHero`, `DEFAULTS`, `SOHERO_LOOP_DURATION_SEC`, HTML string for section, SVG mask/fill build, confetti DOM, font inject |
| `components/shake-on-overflow-hero.css` | `.sohero` shell, intro overlay, caption slot, fill keyframes, `sohero-cap-s0`–`s5`, legacy custom caption keyframes, confetti, `prefers-reduced-motion` |
| `shake-on-overflow-hero.html` | Local demo: mounts hero with `logoSrc`, `introBannerSrc`, etc. |
| `preview-hero.sh` | Serves repo root for browser preview |
| `assets/ally-pledge-intro-banner.png` | Default intro still (campaign banner) |

---

## 4. Public API (for embeds / React)

```js
import { mountShakeOnOverflowHero, DEFAULTS, SOHERO_LOOP_DURATION_SEC } from './components/ShakeOnOverflowHero.js';
import './components/shake-on-overflow-hero.css';

const unmount = mountShakeOnOverflowHero(containerElement, {
  logoSrc: 'SO-WHT_1@3x-8.png',
  introBannerSrc: 'assets/ally-pledge-intro-banner.png',
  introHoldSec: 4,
  durationSec: 27,
  backgroundMode: 'white', // 'white' | 'transparent' | 'navy'
  loadBebasFont: true,
  ariaLabel: '…',
  builtinMilestones: true,
  // builtinMilestones: false, captions: [ { text: '…', checkCount: 0 }, … ],
  colors: { navy: '#011E42', orange: '#FF5F1F', teal: '#01B9B3', white: '#FFFFFF', rim: '#F5F2EC' },
});
// later: unmount();
```

- **`SOHERO_LOOP_DURATION_SEC`**: exported single source of truth for loop length in seconds; must match CSS.
- **Unmount**: returned function removes the `<section>` from the DOM.

---

## 5. Timing model (27s loop — do not drift)

Intended breakdown (as implemented in comments + keyframes):

| Segment | Seconds | Notes |
|---------|---------|--------|
| Intro still (hold + fade) | **4** | `@keyframes sohero-intro-fade` on `.sohero__intro` |
| Main block | **23** | Fills + milestones + confetti |
| **Main** composition | 15 + 6 + 2 | **15** = original story scale; **+6** = +1s × six milestone beats; **+2** = extra hold on final HIT + confetti |
| **Total** | **27** | `SOHERO_LOOP_DURATION_SEC` / `--sohero-duration` |

**Remap rule (intro → main):** The former **15s-relative** percentages were mapped into the global timeline as:

`globalPct ≈ 14.814814 + oldPct × (85.185185 / 100)`

(i.e. first **4/27** of the loop is intro + frozen fills at empty; the remaining **23/27** follows the old 0–100% story stretched by **23/15**). Any future change to `introHoldSec` or `durationSec` **without** updating this mapping will desync intro, fills, and captions.

---

## 6. DOM structure (high level)

```text
section.sohero [data-sohero-bg] [aria-label] style=--sohero-duration, colors…
  .sohero__intro? (optional) > img.sohero__intro-img
  .sohero__layout
    .sohero__caption > p.sohero__line--s0 … --s5 (stacked, opacity animated)
    .sohero__stage
      svg.sohero__svg (mask + three rect groups: orange, teal, navy)
      .sohero__confetti (burst pieces)
      .sohero__confetti.sohero__confetti--linger (linger pieces)
```

- **Captions**: `aria-hidden="true"` on the caption container (motion is decorative; static `aria-label` on section carries meaning).
- **Confetti**: pieces are `<span>`s with inline `--tx`, `--ty`, `--rot-end`, `--delay`; animated in `%` of `--sohero-duration`.

---

## 7. Modifying for a “future version” (checklist)

**A. Assets only (fastest)**  
1. Replace PNG files; keep paths or update `logoSrc` / `introBannerSrc` at mount.  
2. Adjust `ariaLabel` string to match new story.

**B. New dollar tiers / different number of milestones**  
1. Edit `buildBuiltinMilestoneHtml` (or switch to `builtinMilestones: false` + `captions`).  
2. Add/remove `sohero__line--sN` classes and `@keyframes sohero-cap-sN`.  
3. Re-tune fill keyframes if fills should complete at different story beats.  
4. Recompute **total `durationSec`** and every **percentage** in CSS (or introduce a build step that generates keyframes from seconds).

**C. Different intro length**  
1. Change `introHoldSec` and **recompute** intro keyframe end (≈ `introHoldSec / durationSec * 100%`) and the **remap** of fill/caption keyframes so “main” still starts after intro.

**D. Remove intro entirely**  
1. Set `introBannerSrc: ""`.  
2. **You must** shorten `durationSec` and **rewrite** keyframes so there is no dead 4/27 prefix (current CSS assumes intro occupies the head of the loop).

**E. React / SSR**  
- Mount only in `useEffect` (or `connectedCallback`) in the browser.  
- Ensure `logoSrc` / `introBannerSrc` resolve from the deployed public path.

---

## 8. Appendix — Link to slim prompt

For a **minimal copy-paste prompt** (regeneration / greenfield), use:

`OVERFLOW_HERO_REGENERATION_PROMPT.md`

---

## 9. Appendix — Known constraints

- **SVG mask ID** `sohero-logo-mask` is global per document; only one instance per page unless IDs are namespaced.
- **Bebas Neue** is loaded from Google Fonts unless `loadBebasFont: false`.
- **Legacy paths**: Custom captions still use `sohero__line--intro|m1|m2|m3` and older keyframe names in CSS.
