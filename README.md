# WhiteHouse College of Business & Technology — website

Next.js (App Router, TypeScript) site for WhiteHouse College. Pages are built from a set of HTML design
templates plus structured page content (JSON). Every route is pre-rendered to static HTML at build time.

## Quick start

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build      # pre-renders all 40 pages
npm start          # serves the build on http://localhost:3000
```

Other scripts:

| Command          | What it does                                                        |
| ---------------- | ------------------------------------------------------------------- |
| `npm run lint`   | Type-check the project (`tsc --noEmit`)                             |
| `npm run scrape` | Re-scrape content from the live site (Python, see below)            |

## Project structure

```
.
├── content/                  Page content, one JSON file per route (about_legacy.json -> /about/legacy/)
│   └── raw/                  Rendered HTML snapshots the scraper extracts content from
├── templates/                Design templates (full HTML documents, Alpine.js markup)
├── public/                   Static files served as-is
│   ├── media/…/site-assets/  Template CSS, JS, fonts, icons
│   ├── images/               Real photos (see src/config/images.ts)
│   ├── vendor/               jQuery
│   └── json/
├── scripts/scraper/          Python content scraper (optional)
└── src/
    ├── app/
    │   ├── layout.tsx        <html>/<body> shell
    │   ├── [[...slug]]/      Single catch-all route that renders every page
    │   └── not-found.tsx
    ├── components/
    │   └── TemplatePage.tsx  Outputs a rendered page (styles, markup, scripts)
    ├── config/
    │   ├── site.ts           Site name, contact details, footer text, placeholders
    │   ├── images.ts         Real photos for content images
    │   └── navigation.ts     Routes -> templates, sections, header/footer navigation
    ├── lib/
    │   ├── content.ts        Loads content JSON and templates from disk
    │   └── render/           Template engine
    │       ├── page.ts       Assembles a page and splits it for Next.js
    │       ├── home.ts       Homepage sections (Find a course, Your next steps)
    │       ├── chrome.ts     Header nav, mobile nav, breadcrumb, section menu, footer
    │       ├── hero.ts       Fills the template's page header with the page's hero copy
    │       ├── blocks.ts     Renders content blocks (cards, stats, forms, FAQs, tables…)
    │       ├── lorem.ts      Detects and removes leftover template lorem ipsum
    │       └── dom.ts        cheerio/htmlparser2 helpers
    └── types/content.ts      Types for the content JSON
```

## How a page is rendered

1. `src/config/navigation.ts` maps the route (e.g. `/programs/bit/`) to a template (`05-course-detail`) and a
   section (`programs`).
2. The template HTML is parsed. Its header navigation, breadcrumb, section menu and footer are rebuilt from the
   navigation config.
3. The first content block with an `h1` fills the template's hero. The rest of the template body is replaced by
   the blocks from `content/<slug>.json`, rendered with the template's own component classes.
4. The template's stylesheets and scripts are emitted with the page. The interactive parts (menus, carousels,
   accordions) are driven by the template's Alpine.js/jQuery bundles in `public/media`, not React. That's why site
   links are plain `<a>` tags.

## Common tasks

- **Edit page text:** edit `content/<slug>.json`. `next dev` picks it up on reload.
- **Change navigation, footer links or page titles:** `src/config/navigation.ts`.
- **Change contact details / footer tagline:** `src/config/site.ts`.
- **Add a page:**
  1. Add the route to `PAGES` in `src/config/navigation.ts`, choosing a template and section.
  2. Create `content/<slug>.json` (copy a similar page's file as a starting point).
  3. Link it from `SECTIONS`, `PRIMARY_NAV` or `FOOTER_COLS` as needed.
- **Change how a kind of content looks:** `src/lib/render/blocks.ts`.
- **Homepage layout:** `src/lib/render/home.ts`. It adds "Find a course" (search + quick filters for the two
  programs) under the hero and renders "Your next steps" with the template's image cards. Content blocks between
  the hero and the course search on the live site are left out.
- **Use a real photo instead of a placeholder:** put the file in `public/images/` and map the image's alt text to it
  in `src/config/images.ts`. `position` controls the crop (e.g. keep a face in view).

During rendering, a console warning names any page that still contains template lorem ipsum.

## Refreshing content from the live site

`scripts/scraper/scrape_content.py` renders each route of https://www.whitehouseeducation.edu.np with headless
Chrome and extracts structured blocks into `content/`:

```bash
pip install -r scripts/scraper/requirements.txt
npm run scrape                                          # render + extract
python3 scripts/scraper/scrape_content.py --offline     # re-extract from content/raw only
```

Keep its `ROUTES` list in sync with `PAGES`. The script expects Chrome at `/opt/google/chrome/chrome`; edit
`CHROME` in the script if yours is elsewhere.

## Notes

- Images are `placehold.co` placeholders (`PLACEHOLDER` in `src/config/site.ts`) unless listed in
  `src/config/images.ts`. The header logo placeholder
  is in the templates.
- The contact and apply forms are front-end only; they show a confirmation message and do not send data.
