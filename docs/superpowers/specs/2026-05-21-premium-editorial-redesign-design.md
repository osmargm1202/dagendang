# Premium Editorial Redesign — DAgendaNG

## Source of truth

The visual source of truth is the Google Stitch export in `design/`:

- `design/design_base.md` / `design/desgin.md` — design tokens, palette, typography, spacing, component rules.
- `design/portada_light_mode.md` — homepage light-mode composition.
- `design/portada_dark_mode.md` — homepage dark-mode composition.
- `design/noticia_light_mode.md` — article detail light-mode composition.
- `design/noticia_dark_mode.md` — article detail dark-mode composition.

The data/API source of truth is `design/api.md` and the environment variables already placed in `frontend/.env`.

Implementation must follow the Stitch visual line and consume the migrated Strapi database/assets instead of keeping placeholder content where real content exists.

## Goal

Rebuild the public DAgendaNG experience so the current Next.js project matches the Stitch premium editorial newspaper design while consuming real migrated Strapi content/assets, adding real homepage modules for Tony D. Reyes and the daily challenge/poll, and improving rotating advertising placements.

## Design direction

Use the existing logo/brand but shift the interface to a premium international newspaper aesthetic:

- Minimalist, high-contrast editorial layout.
- Ivory light mode and deep navy-black dark mode.
- Playfair Display for editorial headlines.
- Inter for UI, navigation, metadata, and body text.
- Structural 1px borders instead of heavy shadows.
- Crisp cards, sharp editorial imagery, subtle hover movement, restrained animation.
- Modern sticky navigation with date, category links, search, theme toggle, and subscription/advertising CTA.

## Design tokens

Map Stitch tokens into the existing Tailwind/CSS variable system.

### Core colors

- Light background: `#FCFBF9`
- Light surface: `#fcf8f9`
- Light card/container: `#f6f3f4`, `#f0edee`, `#e5e2e3`
- Main text: `#1b1b1c`
- Secondary text: `#43474f`
- Primary navy: `#001e40`
- Primary container: `#003366`
- Accent red: `#b6171e`
- Accent red strong: `#da3433`
- Dark background: `#0B111B`
- Dark surface: `#161F2C`
- Light border: `#E5E3E0`
- Dark border: `#2D3748`
- Soft blue dark-mode accent: `#a7c8ff`

### Typography

- Display / main headline: Playfair Display, 64px desktop, 32–40px mobile/tablet.
- Section headlines: Playfair Display, 20–40px.
- Body: Inter, 16–18px with comfortable line height.
- Labels and navigation: Inter, uppercase, 12–14px, increased letter spacing.

## Homepage architecture

Desktop homepage uses a 12-column grid with max width near 1280px.

### Header

Implement a modern sticky header based on Stitch:

- Top row with date on desktop, logo/brand, theme toggle, search, and subscription/advertising CTA.
- Second row with uppercase category navigation.
- Active category uses red underline/accent.
- Mobile uses compact header with menu button/drawer and horizontal or stacked actions.
- Preserve existing auth/admin behavior: hide public header in `/admin` routes.

### Top advertising banner

Directly below the header:

- Full-width ad strip.
- Desktop preferred creative size: 728x90.
- Placeholder state must say `Anúnciate aquí` and include a contact number.
- Must support rotation using existing ad rotation behavior.
- Visual style: subtle bordered box, label `Publicidad`, integrated with light/dark themes.

### Main 3-column desktop grid

#### Left column — Reto Diario

Approx. 2.5–3 columns wide.

Content comes from the real Strapi `Poll` model described in `design/api.md`.

Content:

- Label/title: `Reto Diario`.
- Poll title/question/description from the active poll.
- Options A–I, hiding empty options.
- Primary CTA: `Votar`, `Jugar Ahora`, or `Responder reto` depending final UI wording.
- Optional icon/visual treatment inspired by Stitch (`extension`, `psychology`, puzzle/crossword imagery).

Behavior:

- Fetch active polls from Strapi using the server-side readonly token.
- Filter by `startsAt`/`endsAt` in Next.js when necessary.
- Vote through an internal Next.js route so `POLL_VOTE_TOKEN` never reaches the browser.
- After voting, show updated counts/percentages returned by Strapi.

Below Reto Diario:

- Add a mini ad placement, e.g. 300x250.
- Use the same rotating ad component with a left-sidebar position.

#### Center column — News

Approx. 6–7 columns wide.

Use real migrated Strapi `Article` data and adapt current `NewsGrid` behavior to Strapi response shapes while restyling to match Stitch:

- Featured article dominates page 1.
- Image ratio 16:9, sharp edges, subtle hover scale.
- Category label in red or navy.
- Headline in Playfair Display.
- Excerpt and byline visible for featured story.
- Secondary grid below in one or two columns.
- Use 1px dividers and editorial spacing.
- Keep existing pagination/load-more logic.

Add one mid-content ad banner between featured story and secondary grid or after first secondary block.

#### Right column — Tony D. Reyes

Approx. 2.5–3 columns wide.

Content comes from real Strapi `Daily Opinion` and `Personality` models described in `design/api.md`.

Content:

- Section label: `La Columna` or `Columna diaria`.
- Columnist profile from `Personality`, preferably slug `tony-d-reyes`.
- Columnist name, position/dedication, photo, and latest active daily opinion.
- Opinion title, summary, date, image if present, and CTA `Leer columna` / `Leer artículo completo`.

Behavior:

- Fetch the latest active daily opinion from Strapi sorted by `date:desc`.
- Populate `columnistProfile` and media.
- Use S3/MinIO asset URLs through the media helper.
- Link to a real opinion detail/list route when implemented; until then link can fall back to the opinion slug target planned in routing.

Below Tony column:

- Add one or more right-sidebar ad placements, preferably 300x250 and/or 300x600.
- Must show contact information in empty/placeholder state.

## Article detail architecture

Restyle `/noticias/[id]` to match the Stitch article templates:

- Header consistent with homepage.
- Article content uses 8 columns with 4-column sidebar on desktop.
- Breadcrumb/category label at top.
- Large Playfair headline.
- Dek/subtitle if available; otherwise omit.
- Byline/date row with bordered separators.
- Hero image below title area, matching existing article image data.
- Article body with comfortable line length and editorial type scale.
- Sidebar includes:
  - Tony D. Reyes opinion widget.
  - Reto Diario widget.
  - Advertising placement with contact/rotation placeholder.
- Keep existing premium content wrapper, comments, social share, related articles, and SEO metadata where compatible.

## Data/API integration

Use `design/api.md` as the integration guide.

### Environment variables

Read these from `frontend/.env` on the server side:

- `STRAPI_API_URL`
- `STRAPI_READONLY_TOKEN`
- `POLL_VOTE_TOKEN`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STRAPI_ASSETS_URL`
- `FASTAPI_API_URL` when dynamic economic data remains in FastAPI.

Never expose readonly or poll vote tokens to browser code.

### Strapi helper

Create a server-only Strapi client/helper:

- Adds `Authorization: Bearer ${STRAPI_READONLY_TOKEN}`.
- Accepts Strapi paths like `/api/articles?populate=*`.
- Uses reasonable Next.js caching/revalidation.
- Normalizes Strapi v5 `documentId`.

Create a media URL helper:

- Returns absolute URLs unchanged.
- Prefixes relative media paths with `NEXT_PUBLIC_STRAPI_ASSETS_URL`.

### Homepage minimum queries

- `GET /api/site-setting?populate=*`
- `GET /api/categories?sort[0]=order:asc`
- `GET /api/articles?sort[0]=publishedDate:desc&pagination[pageSize]=12&populate=*`
- `GET /api/daily-opinions?filters[isActive][$eq]=true&sort[0]=date:desc&pagination[pageSize]=1&populate=*`
- `GET /api/polls?filters[isActive][$eq]=true&sort[0]=order:asc&sort[1]=startsAt:desc&populate=*`
- `GET /api/price-board-items?filters[isActive][$eq]=true&sort[0]=type:asc&sort[1]=order:asc`

### Article detail minimum query

- Prefer slug route: `GET /api/articles?filters[slug][$eq]=SLUG&populate=*`.
- If legacy numeric IDs remain in routes temporarily, map or redirect to slug/document routes.

## Advertising functionality

Prefer real migrated advertising data if available in Strapi/API. If the current ad API remains active, the existing `AdBanner` already fetches ads by position and rotates according to `rotation_seconds`. Extend the design and placement strategy rather than replacing rotation behavior.

Required ad positions:

- `header` — top horizontal banner.
- `home_left` or `sidebar_left` — below Reto Diario.
- `home_middle` or `in_content` — between news blocks.
- `sidebar_top` — below Tony D. Reyes.
- `sidebar_bottom` — lower right sidebar.
- Article sidebar placement can reuse `sidebar_top`/`sidebar_bottom` or define `article_sidebar`.

Placeholder requirements when no ads are active:

- Show `Publicidad` label.
- Show size hint such as `728x90`, `300x250`, or `300x600`.
- Show `Anúnciate aquí`.
- Show a contact number, initially `809-555-0100` unless the site owner provides the final number.
- If multiple ads exist, show rotation indicator such as `1 / 3`.

Admin requirements:

- Existing admin advertising page already supports title, image, link, position, active state, and rotation seconds.
- Add new positions to the position selector so the new layout can be populated without code changes.
- Contact number can be hardcoded in placeholder for phase one, unless backend already has site configuration for it.

## Responsive behavior

### Desktop

Order:

1. Sticky header.
2. Top ad banner.
3. 3-column grid: Reto Diario / news / Tony D. Reyes.
4. Additional ads and footer.

### Tablet

- Collapse to two-column or stacked layout depending available width.
- News remains primary.
- Reto and Tony can stack above or below sidebars.

### Mobile

Order:

1. Header.
2. Top ad.
3. Featured news.
4. Reto Diario.
5. Tony D. Reyes.
6. Secondary news.
7. Ads.
8. Footer.

Use single-column cards and avoid horizontal overflow.

## Component plan

Create or update these public components:

- `SiteHeader` — align with Stitch header/nav while preserving search, theme toggle, login/admin state.
- `AdBanner` — add premium placeholder styling, contact text, optional rotation count, and layout-aware dimensions.
- `DailyChallengeCard` — real Strapi Poll-based Reto Diario module.
- `TonyColumnCard` — real Strapi Daily Opinion / Personality-based Tony D. Reyes module.
- `NewsGrid` — restyle article cards and add optional in-content ad slot.
- `SiteFooter` — align with Stitch footer.
- `/app/page.tsx` — restructure homepage into 12-column premium editorial grid.
- `/app/noticias/[id]/page.tsx` — restyle article detail layout and sidebar.
- `/app/admin/publicidad/page.tsx` — add new ad placement options.

## Non-goals for this phase

- Do not create new Strapi content models; use the migrated models documented in `design/api.md`.
- Do not implement advanced game mechanics beyond showing/voting on the active poll.
- Do not expose Strapi readonly tokens or poll vote tokens to the browser.
- Do not replace existing auth, premium wrapper, comments, SEO, or ad APIs unless required for Strapi compatibility.

## Acceptance criteria

- Homepage visually follows `design/portada_light_mode.md` and `design/portada_dark_mode.md`.
- Article pages visually follow `design/noticia_light_mode.md` and `design/noticia_dark_mode.md`.
- Light and dark modes use the Stitch palette.
- Left homepage column contains real active Strapi poll as Reto Diario.
- Right homepage column contains real latest Strapi daily opinion / Tony D. Reyes profile data.
- Banners appear in top, left/sidebar, center/in-content, and right/sidebar locations.
- Empty ad placeholders include `Anúnciate aquí` and contact number.
- Active ads continue rotating by configured `rotation_seconds`.
- Admin advertising page supports the new ad positions.
- Existing or migrated article data, pagination/search behavior, theme toggle, admin hiding, premium article behavior, social share, comments, and SEO remain functional with Strapi data.
