---
version: 1
slug: "src-app-voivodeship-voivodeship-component-html"
primary_target: "src/app/voivodeship/voivodeship.component.html"
related_targets: ["src/app/home/home.component.html","src/app/header/header.component.html","src/app/app.component.html","src/app/station/station.component.html"]
---

# MyAir app shell: map → voivodeship → station

Scope: the whole MyAir web app (home map, voivodeship station list, station readings, header, footer). Visitor mode: **Operate**. The visitor completes one task: find a station and learn what the air there is like and what it means.

Audience and task: residents checking current air (phone first, also desktop) and portfolio reviewers (desktop), with equal weight. The task is to choose a voivodeship on the map, or search for a station, then pick a station and read the GIOŚ verdict and readings against the WHO/EU norms.

Constraints: map-first flow; Polish only; GIOŚ data unaltered, displayed as published; every verdict names its source; norms compared only over their own averaging period; calm when the air is good, loud when it is bad; fewer bare numbers.

Reference products (craft bar, not layout): Airly, IQAir AirVisual, Apple Weather's air-quality module.

## Direction contract

THESIS: The category standard, played straight and finished like the best of it. The answer leads ("Zły, decyduje PM2.5"), the evidence follows, and the screen's volume follows the air. The page refuses the bare raw-number list it replaces and the unsourced red/green verdict.

OWN-WORLD: Cool light-grey ground (#f3f5f8) with white working surfaces, ink #111827 and a single blue accent (#0b6fb8, taken from the wind-line favicon) for links, focus and selection. GIOŚ's six official index colours are the only state hues. Text on those fills is chosen for contrast, not copied from GIOŚ. System UI sans with tabular figures, a fixed rem scale at a 1.2 ratio, 8px radii on controls and 12px on cards (the cards needed softer corners at their size, as in the reference apps), hairline borders and one soft offset shadow. Icons are authored line SVGs at a 1.75 stroke.

STORY: The visitor arrives at a map of Poland, picks a voivodeship or types a city, and sees each station's GIOŚ level before choosing one. On the station, they understand the overall verdict first. Then they see which pollutant drives it, how each measured value compares with WHO 2021 and the EU limits over the correct averaging period, and how the last 24 hours went. They trust it because every claim names GIOŚ, WHO or the EU.

FIRST VIEWPORT: Station view, desktop at 1440. A 64px white header holds the brand at left, a 420px station search and links to Mapa and Autor at right. Below it, a breadcrumb reads Polska / Małopolskie / Kraków, ul. Bujaka. A 360px station list card on the left shows rows with city, street and an index pill, plus a sort switch. On the right, a hero card holds a 168px index disc in the GIOŚ colour with the level name, the station title, the critical pollutant and the calculation time. At levels 4–5 the whole hero floods with the index colour. Below sits a grid of pollutant tiles: code, Polish name, latest value with unit and hour, the GIOŚ sub-index pill, a 24 h bar chart with a mean line, and WHO/UE norm rows. On mobile at 390 the list and the detail are separate routes, and the hero comes first.

FORM: the category standard, the canon card and standing exit taken by the owner, so it has no position on the grounded list. seed:32de6f3523fd1bca

Signature interaction: the hero's volume tracks the GIOŚ level. Levels 0–2 stay a calm white card with a coloured disc, level 3 gets a tinted card, and levels 4–5 flood with the index colour on white type, in a 200 ms colour transition when data lands.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Dark theme: not requested; tokens are built so it can be added later.
- Health advice text per index level: GIOŚ's official wording was not found, so none is shown rather than invented.
