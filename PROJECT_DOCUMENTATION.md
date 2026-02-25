# Shake On — Project Documentation

**Purpose:** Single-page fundraising website for Shake On, supporting Parkinson's research via The Michael J. Fox Foundation. Ally Simpson (#20, New York Sirens, PWHL) pledges $20 per point, block, and win.

**Live site:** https://shakeon.org

---

## Project History & Changes Made

This document captures features, configuration, and maintenance steps so the project can be understood and updated after moving or without prior chat history.

### Features Implemented

1. **Fundraising Totals Display**
   - Total raised, pledge matches, one-time donations
   - Goal: $20K
   - Updatable via `FUNDRAISING_TOTALS` in `index.html` (see Maintenance section)

2. **2-Column Story Section**
   - Left: Ally spotlight image (`ally-simpson-spotlight.png`)
   - Right: Total Raised box + Shake On story text
   - Equal-height columns with shared container

3. **Dedication Messages Carousel**
   - 21 supporter messages, auto-advances every 6 seconds
   - Seamless loop (last → first)
   - Centered text
   - Heading: "Support and dedication messages"
   - Source data: `dedication-messages-table.md`

4. **Pledge Form Modal**
   - Match my pledge / Make a one-time donation buttons
   - Form: name, email, pledge amount, dedication message
   - reCAPTCHA v2 (checkbox)
   - Submits to Google Apps Script → Google Sheet

5. **reCAPTCHA Enterprise Verification**
   - Server-side token verification in Google Apps Script
   - Setup: `RECAPTCHA_SETUP.md`

6. **Design System**
   - Colors: Navy (#011E42), Orange (#FF5F1F), Teal (#01B9B3)
   - Teal used for: carousel, social section, PWHL section, background orb
   - Orange for primary CTAs

7. **Paragraph Break**
   - Extra spacing between "no matter what" and "This season" in story text

---

## File Structure

```
Shake On/
├── index.html                    # Main site (all-in-one)
├── preview-fundraising-totals.html  # Standalone totals preview
├── ally-simpson-spotlight.png    # Ally image (B&W, on ice)
├── ally-james-thank-you.png      # Thank you screen image
├── SO-WHT_1@3x-8.png             # Shake On logo
├── dedication-messages-table.md  # Source for carousel messages
├── UPDATED_GOOGLE_SCRIPT_CODE.js # Apps Script with reCAPTCHA
├── RECAPTCHA_SETUP.md            # reCAPTCHA Enterprise setup
├── FORM_SETUP_INSTRUCTIONS.md    # Form/Sheet setup
└── PROJECT_DOCUMENTATION.md      # This file
```

---

## Key Configuration

| Item | Location | Value |
|------|----------|-------|
| Google Apps Script URL | `index.html` ~line 1663 | `https://script.google.com/macros/s/AKfycbyRYYyOg_qCEzuCAHDip1Fc1ZUQii9xIs9Z21hsQW0y7Loryo92QNYivzpembr5o1y1/exec` |
| reCAPTCHA Site Key | `index.html` (g-recaptcha div) | `6Ld_SVUsAAAAAKIQpaytI8PJ76qAqmPHHakAgxPy` |
| Google Sheet ID | `UPDATED_GOOGLE_SCRIPT_CODE.js` | `1EIfU6bG-Y6wTdWPIk5_lBOmW9afsIGKAPrK7J04u4cM` |
| reCAPTCHA Project ID | `UPDATED_GOOGLE_SCRIPT_CODE.js` | `my-project-3317-1769289470923` |
| Donation link | `index.html` | `https://give.michaeljfox.org/fundraiser/6816216` |

---

## Maintenance — How to Update

### Fundraising Totals

Edit `index.html`, find `FUNDRAISING_TOTALS` (~line 1471):

```javascript
const FUNDRAISING_TOTALS = {
    totalRaised: '$10,800',
    pledgeMatches: '$7,200',
    oneTimeDonations: '$3,600'
};
```

Also update the fallback HTML values in the same file (search for the dollar amounts). Update `preview-fundraising-totals.html` if you use it.

### Dedication Carousel Messages

1. Edit `dedication-messages-table.md` to add/change messages (Dedication Message | First Name).
2. Update the carousel HTML in `index.html` — search for `carousel-slide` and add/remove `<div class="carousel-slide">` blocks.
3. Each slide format:
   ```html
   <div class="carousel-slide">
       <p class="carousel-quote">"Message here"</p>
       <p class="carousel-author">— FirstName</p>
   </div>
   ```

### Google Apps Script URL

If you create a new deployment in Apps Script, update `GOOGLE_SCRIPT_URL` in `index.html` (~line 1663).

### reCAPTCHA API Key

Stored in Apps Script **Script Properties** as `RECAPTCHA_API_KEY`. Not in code. See `RECAPTCHA_SETUP.md`.

---

## Deployment

```bash
git add .
git commit -m "Your message"
git push origin main
```

Site deploys from GitHub (e.g. GitHub Pages, Netlify, Vercel). Allow 1–2 minutes for updates.

---

## Moving the Project

**Recommended approach:**

1. **Commit and push** all changes so everything is in git.
2. **Move or clone** the folder to the new location.
3. **Open in Cursor** from the new path.

**What moves with the project:**
- All files (via git or copy)
- This documentation
- Git history (if you move the whole folder or clone)

**What may not move:**
- Cursor chat history (tied to workspace path)
- Cursor-specific settings in the old path

**After moving:** Use this document and the codebase as the main reference. New AI sessions can use `PROJECT_DOCUMENTATION.md` for context.

---

## External Links

- **Donation page:** https://give.michaeljfox.org/fundraiser/6816216
- **PWHL schedule:** https://www.thepwhl.com/en/stats/schedule/4/8/all-months/homeaway?league=1
- **Social:** @shakeonsimpson, @a.simpy, @allysimpson

---

*Last updated: February 2025*
