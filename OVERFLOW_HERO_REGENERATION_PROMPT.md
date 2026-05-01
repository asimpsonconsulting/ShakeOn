# Prompt: Regenerate the “Shake On Overflow” fundraising hero (vanilla JS + CSS)

Copy everything below the line into a new chat for another AI to implement from scratch or port to another stack.

---

You are implementing **Shake On Overflow**: a self-contained, dependency-free **hero section** that loops forever.

## Visual / behavior spec

1. **Root**: A `<section class="sohero">` with configurable background (`white` | `transparent` | `navy`), max-width ~1200px, padding, optional Bebas Neue for headlines.

2. **Optional intro (first ~4s of each loop)**  
   - Full-area overlay with a **single raster image** (campaign banner), `object-fit: contain`, centered, subtle shadow.  
   - CSS animation on the overlay: **visible for the first 4/27 of the total loop**, then **fade to invisible** and stay hidden until the next loop.  
   - Omit entirely if `introBannerSrc` is empty.

3. **Main column** (below or under intro)  
   - **Caption band**: fixed height; **six** absolutely stacked lines, **only opacity** animates (no layout jump). Bebas for headline text; system-ui for ✓ marks (teal).  
   - **Built-in copy (exact pattern)**  
     - `$20K Goal`  
     - `$20K Goal HIT!` + one ✓  
     - `$40K 2X Goal`  
     - `$40K 2X Goal HIT!` + two ✓  
     - `$50K 2.5X Goal`  
     - `$50K 2.5X Goal HIT!` + three ✓  
   - **Stage**: aspect ratio matching the SVG viewBox (**1889×633**).  
   - **SVG**: `<mask>` from a **PNG** (`logoSrc`); three `<g>` groups each containing a full-size **rect** fill (orange, teal, navy) clipped by the mask. Each group uses **`transform: scaleY(0→1)`** from **bottom** (`transform-origin: bottom`), with **ease** keyframes so orange completes first, then teal, then navy. Optional subtle **feTurbulence + feDisplacementMap** “liquid” on fills unless `prefers-reduced-motion`.  
   - At loop end (~100%), all fills **snap reset** to empty for a clean restart.

4. **Gold confetti** (decorative, `aria-hidden`)  
   - Two layers over the logo: **burst** (~44 pieces) + **linger** (~36), small rotated rectangles, gold palette.  
   - Particles emanate from **logo center** using per-piece CSS variables `--tx`, `--ty`, `--rot-end`, `--delay`.  
   - Visible mainly during the **final $50K HIT** window (~last fifth of the loop).  
   - Disable entirely under `prefers-reduced-motion: reduce`.

5. **Total loop duration: 27 seconds**  
   - **4s** intro + **23s** main.  
   - **23s main** = original **15s** story rhythm **time-stretched by 23/15**, plus baked-in extra time so milestone beats feel **+1s each (×6)** and the **final HIT + confetti** gets **+2s** more hold.  
   - Implement by authoring **one** `--sohero-duration: 27s` and **percentage keyframes** where the first **~14.814815%** is intro (fills frozen at 0); the remainder maps the old 0–100% timeline via `globalPct = introEndPct + oldPct * (1 - introEndPct/100)`.

6. **`mountShakeOnOverflowHero(container, options)`**  
   - Returns `() => void` unmount.  
   - Sets CSS variables for colors and duration.  
   - Escapes HTML for caption strings and `src` attribute.  
   - Exports **`SOHERO_LOOP_DURATION_SEC = 27`** and **`DEFAULTS`** aligned with CSS.

7. **Accessibility**  
   - `aria-label` on `<section>` describes the motion in plain language.  
   - `@media (prefers-reduced-motion: reduce)`: static frame (e.g. navy full, final milestone line visible, no intro, no confetti).

## Deliverables

- `ShakeOnOverflowHero.js` (ES module)  
- `shake-on-overflow-hero.css`  
- Demo `shake-on-overflow-hero.html` + note to serve over HTTP  
- Example assets: optional intro PNG path `assets/ally-pledge-intro-banner.png`, logo PNG

## Extension hooks (future variants)

- **`logoSrc`**, **`introBannerSrc`**, **`colors`**, **`durationSec`**, **`ariaLabel`** via mount options.  
- **`builtinMilestones: false`** + **`captions`** array for a different ladder (requires matching CSS line classes / keyframes).  
- Document that **changing loop length** requires updating **every** `%` keyframe in lockstep with `SOHERO_LOOP_DURATION_SEC`.

---

End of prompt.
