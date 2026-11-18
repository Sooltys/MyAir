---
name: MyAir
description: Current GIOŚ air quality for Polish measuring stations, read against the official index and WHO/EU norms.
colors:
  ground: "#f3f5f8"
  surface: "#ffffff"
  surface-2: "#f7f9fb"
  ink: "#111827"
  ink-2: "#4b5563"
  ink-3: "#5f6b7a"
  line: "#e3e8ee"
  line-strong: "#cdd5df"
  accent: "#0b6fb8"
  accent-strong: "#095a96"
  accent-soft: "#e8f2fb"
  selection: "#cfe3f6"
  danger: "#b42318"
  bar: "#c4cdd8"
  meter-within: "#7d8fa4"
  map-region: "#e1e7ee"
  map-region-hover: "#c7dcf0"
  warn-tint: "#fff4e6"
  warn-line: "#f6cf9f"
  lvl-0: "#57b108"
  lvl-1: "#b0dd10"
  lvl-2: "#ffd911"
  lvl-3: "#e58100"
  lvl-4: "#e50000"
  lvl-5: "#990000"
  lvl-none: "#e4e8ed"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.074rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.074rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.44rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.2
  lede:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1
  caption:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  hairline: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
  disc: "50%"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "8": "32px"
  "10": "40px"
  "14": "56px"
  gutter: "24px"
  gutter-phone: "16px"
  page: "1280px"
components:
  button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  button-active:
    backgroundColor: "{colors.line}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    padding: "4px 0"
  button-link-hover:
    textColor: "{colors.accent-strong}"
  input-search:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 40px 0 38px"
    height: "40px"
  input-search-focus:
    backgroundColor: "{colors.surface}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  nav-link-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  nav-link-active:
    textColor: "{colors.accent}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-warn:
    backgroundColor: "{colors.warn-tint}"
  index-badge:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "26px"
  index-badge-sm:
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "22px"
  index-badge-none:
    backgroundColor: "{colors.lvl-none}"
    textColor: "{colors.ink-2}"
  index-disc:
    rounded: "{rounded.disc}"
    size: "168px"
    padding: "12px"
  index-disc-phone:
    size: "128px"
  segmented:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.md}"
    padding: "3px"
  segmented-option-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "32px"
  list-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
    height: "56px"
  list-row-current:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-strong}"
  norm-meter:
    backgroundColor: "{colors.line}"
    rounded: "{rounded.pill}"
    height: "6px"
---

# Design System: MyAir

## Overview

**Creative North Star: "The Straight Reading"**

MyAir is the category standard for air-quality apps, played straight and finished to the level of Airly, IQAir AirVisual and Apple Weather's air-quality module. The answer comes first ("Zły, decyduje PM10"), the evidence follows, and every claim names its source: GIOŚ, WHO or the EU. The world is a cool light-grey ground with white working cards, near-black ink and one blue accent. The only other hues in the system are the six official colours of the Polski Indeks Jakości Powietrza, so any colour that isn't the accent is the air speaking.

The screen gets louder as the air gets worse. Good air is a calm white card with a coloured disc. Level 3 (dostateczny) tints the card warm. At levels 4 and 5 the hero and the voivodeship verdict fill with the index colour, the disc and badges invert to white, and on phones the browser bar takes the colour too. The density is that of a working tool: tabular figures, small captions, hairline rules, and nothing decorative between the visitor and the reading.

The system rejects the bare list of raw numbers it replaced, and it rejects red/green verdicts that don't name a source. It does not tint, gradient or reinterpret GIOŚ's legend colours.

**Key Characteristics:**
- A cool grey ground with white cards, one blue accent, and GIOŚ's six index colours as the only state hues.
- Loudness tracks the index: calm at 0–2, tinted at 3, flooded at 4–5.
- System UI sans, no webfont, tabular figures for every number.
- Gently rounded shapes: 8px on controls, 12px on cards, pills for index badges, a full circle for the index disc.
- Hairline borders and one soft ambient shadow. Depth comes from the white surface sitting on grey.
- Authored line icons on a 24-unit grid with a 1.75 stroke, always decorative.

## Colors

A cool, nearly colourless working palette carries one blue accent, so that the official GIOŚ index colours are the loudest thing on any screen.

### Primary
- **Wind-Line Blue** (accent): links, focus rings, the active nav item, the chart's mean line and active bar, the map region's focus stroke. It was taken from the wind-line favicon. It never encodes air quality.
- **Deep Wind-Line Blue** (accent-strong): hover state for links and link buttons, the chart readout text, and the city name of the current station row.
- **Pale Wind-Line Blue** (accent-soft): the background of the current list row, the active search option, and the voivodeship-list hover. Selected text uses the slightly deeper **Selection Blue** (selection).

### Index (the GIOŚ legend, used only for index state)
- **Bardzo dobry Green** (lvl-0), **Dobry Lime** (lvl-1), **Umiarkowany Yellow** (lvl-2), **Dostateczny Orange** (lvl-3), **Zły Red** (lvl-4), **Bardzo zły Maroon** (lvl-5): the official powietrze.gios.gov.pl legend, copied exactly. They fill badges, the disc, the six-step scale, distribution segments, legend swatches, the latest chart bar, and the flooded hero at 4–5.
- **Brak indeksu Grey** (lvl-none): the neutral fill for "Brak indeksu", for failed index fetches ("Brak danych"), and for the unknown disc. The text on it is ink-2.
- **Dostateczny Wash** (warn-tint) with **Dostateczny Rule** (warn-line): the level-3 card tint and its border. These are the only derived index colours.

### Neutral
- **Cool Ground** (ground): the page background, and the track of the segmented control.
- **Card White** (surface): every card, the header (at 96% opacity), the footer, the panels, and the plate under the level scale.
- **Mist** (surface-2): hover fill on buttons and nav, and the resting fill of the search input.
- **Ink** (ink): headings, values, body text, and the norm-meter limit tick.
- **Slate** (ink-2): secondary text, pollutant names, units, and nav links at rest.
- **Pewter** (ink-3): captions, timestamps, counts, placeholder text, and icons in lists. It holds 4.5:1 on ground.
- **Hairline** (line): card borders, dividers, empty chart hours, and the meter track.
- **Firm Hairline** (line-strong): button and input borders, and the scrollbar thumb.
- **Bar Grey** (bar): the chart's 23 past hours. **Meter Slate** (meter-within): the part of a norm meter that is within the limit.
- **Map Grey** (map-region) and **Map Hover Blue** (map-region-hover): voivodeship fills at rest and on hover or focus. The region borders are white.
- **Alarm Brick** (danger): errors, and the "above norm" portion of a meter with its figure. It is a text and UI red, deliberately distinct from Zły Red.

### Named Rules
**The Air Owns the Colour Rule.** Apart from wind-line blue, every chromatic hue on screen is a GIOŚ index level. Never use green, yellow, orange or red decoratively, for success states or for branding.

**The Legend Is Verbatim Rule.** The six index fills are GIOŚ's hexes, exactly. Text on them is chosen for contrast and not copied from GIOŚ: ink on levels 0–3 and white on levels 4–5. GIOŚ's white-on-green fails contrast, so it is not used.

**The Volume Rule.** How loud a surface is depends on the index level and nothing else. Levels 0–2: a white card, with colour only in the disc or badge. Level 3: the card takes warn-tint and warn-line. Levels 4–5: the card fills with the level colour, the text turns white, and the disc and badges invert to white with the level colour as text. On phones the browser theme-color follows. The change runs as a 200ms ease-out colour transition.

## Typography

**Display Font:** system-ui (with -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif)
**Body Font:** the same system stack
**Label/Mono Font:** none. Numbers use the same face with tabular figures.

**Character:** It is the platform's own UI face, chosen on purpose. The app should read as a native instrument, not as a branded site, and it loads no font files. Hierarchy comes from weight (400/500/600/700) and a fixed 1.2 ratio scale (12 / 14 / 16 / 19.2 / 23 / 27.6 / 33 / 40 px), never from a second family.

### Hierarchy
- **Display** (700, 2.074rem, 1.2, -0.02em): page and station titles (h1). It steps down to 1.728rem below 720px.
- **Figure** (700, 2.074rem, 1.1, -0.02em, tabular): the latest pollutant value on each card.
- **Headline** (700, 1.44rem, 1.2): section headings, the voivodeship verdict, and the level name inside the disc.
- **Title** (700, 1.2rem): card headings, the pollutant code, and the brand.
- **Lede** (500, 1.2rem, max 62ch): the hero's answer-first sentence, and the home intro. It drops to 1rem on phones.
- **Body** (400, 1rem, 1.5): running text. Explanations cap at 70–75ch.
- **Body-sm** (400, 0.875rem): pollutant names, norm rows, legends, and the footer.
- **Label** (600, 0.875rem): buttons, nav, the segmented control, and index badges (0.75rem on small badges).
- **Caption** (400, 0.75rem, 1.3): chart axis hours, norm basis, fact terms, and the scale's end labels.

### Named Rules
**The Tabular Figures Rule.** Every number and time is set with `font-variant-numeric: tabular-nums`: values, counts, hours and ratios. Columns of readings must not shimmer as they update.

**The No Webfont Rule.** Only the system UI stack. No Google Fonts and no display face; weight and size carry the hierarchy.

## Layout

The content column is 1280px wide (page), centred, with 24px gutters that drop to 16px below 720px. Spacing follows a 4px base rhythm: 4, 8, 12, 16, 20, 24, 28, 32, 40, 56. Pages have 24–40px of top padding and 56px at the bottom. Cards are 16px apart in grids, and sections are 24px apart.

- **Header:** sticky and 64px tall. A three-column grid: the brand, a search box up to 440px, and nav aligned right. Below 720px it wraps into two rows, with brand and nav first and full-width search second.
- **Home:** the map card is fluid, with a 340px voivodeship list to the right. The map is capped so it fits in a laptop's first viewport (`max(360px, 100dvh − 300px)`). Below 960px the list moves under the map as an auto-fill grid with 240px minimum columns.
- **Voivodeship / station:** a 340px sticky station-list card (top 88px, scrolling internally with a 32px fade mask at the bottom) sits beside a fluid detail column. Below 1024px it becomes a single column. The list and the station are then separate views, and the voivodeship summary sits above the list.
- **Pollutant grid:** `repeat(auto-fill, minmax(290px, 1fr))` with a 16px gap.
- **Hero:** disc column and body, 32px gap, 28px padding. Below 720px it stacks: 20px gap, 20px/16px padding, a 128px disc.

Breakpoints: 720px (phone), 960px (home list), 1024px (list–detail split).

## Elevation & Depth

Depth is mostly tonal: white cards sit on the cool ground with a hairline border and one soft ambient shadow. Floating layers (the search panel) get a deeper shadow. The only other shadows are functional: the selected segment, and the white disc lifted off a flooded hero.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgb(17 24 39 / 0.05), 0 6px 16px -6px rgb(17 24 39 / 0.08)`): every card. It is always paired with the 1px hairline border.
- **Popover** (`box-shadow: 0 12px 32px -8px rgb(17 24 39 / 0.18), 0 2px 6px rgb(17 24 39 / 0.06)`): the search results panel.
- **Segment thumb** (`box-shadow: 0 1px 2px rgb(17 24 39 / 0.1)`): the selected option in the segmented control.
- **Alarm disc lift** (`box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.35)`): only on the inverted white disc at levels 4–5.
- **Fill edge** (`box-shadow: inset 0 0 0 1px rgb(17 24 39 / 0.07–0.08)`): a 1px inner edge on badges, swatches and the disc, so pale fills (lime, yellow, grey) hold their shape on white.
- **Focus ring** (`outline: 2px solid accent; outline-offset: 2px`), and for text inputs `box-shadow: 0 0 0 3px rgb(11 111 184 / 0.18)` with an accent border.

### Named Rules
**The One Ambient Shadow Rule.** Resting cards all share the single card shadow. Don't add hover lifts, and don't add stronger shadows to make a card important. Importance comes from the index colour.

## Shapes

The corners are gently rounded and consistent: 8px (md) on every control (buttons, inputs, nav links, list rows, the segmented track, the level-scale plate), 12px (lg) on cards and the popover, and 6px (sm) on inner pieces such as segment thumbs, search options, the clear button and skeletons. Index badges and meters are full pills. The overall verdict is a perfect circle, the index disc, which is the one round mass in the system. Small marks are near-square: 3px on legend swatches, 2px on scale steps, 4px on the chart frame. Borders are 1px hairlines. The map's regions are separated by white 1.5px strokes (2px on phones) with round joins.

## Components

### Buttons
Quiet, bordered and neutral. The blue belongs to links.
- **Shape:** gently rounded (8px), at least 40px tall, padding 0 16px, a gap of 8px before any icon.
- **Default:** surface fill, line-strong border, ink label at 600.
- **Hover / Active:** mist fill with a pewter border, then a line fill on press. Background and border transition over 150ms ease-out. Disabled is 55% opacity.
- **Link button:** no box, accent text at 600, an underline on hover with accent-strong. Used for "Odśwież" and retry actions.

### Index Badge (chip)
- **Style:** a pill, 26px tall (22px small), filled with the level colour and with ink or white text per the Legend Is Verbatim Rule. A 1px inset edge.
- **States:** loading shows a matching-size skeleton. A failed fetch reads "Brak danych" on lvl-none. No index reads "Brak indeksu" on lvl-none.
- **On a flooded card:** inverted to a white fill with level-colour text. On the voivodeship verdict it keeps its fill and gains a 2px white inset ring.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** surface. At level 3, warn-tint with a warn-line border. At 4–5, the level colour.
- **Shadow Strategy:** the card shadow only (see Elevation).
- **Border:** a 1px line hairline.
- **Internal Padding:** 20px for pollutant and skeleton cards, 24px for the verdict, the distribution and the about card, 28px for the hero. Below 720px: 20px/16px.

### Inputs / Fields
- **Style:** the station search. 40px tall, mist fill, line-strong border, 8px radius, a leading search icon at 12px in pewter, a 28px clear button at the right edge, and 1rem text so iOS doesn't zoom.
- **Focus:** the border turns accent, the fill turns white, with a 3px accent halo at 18%.
- **Results panel:** a 12px-radius white popover 6px below the field, with the popover shadow and 6px padding. Options are 6px-radius rows, and the active option takes accent-soft.

### Navigation
- **Header nav:** label-weight links in slate, 40px tall, 8px radius, mist on hover, accent text for the current route. The external "Autor" link carries a small external arrow icon.
- **Breadcrumbs:** body-sm in pewter, with a chevron separator. Links are slate and turn accent with an underline on hover. The current page is ink at 600.
- **Segmented control:** a 3px-padded ground track with two equal options. The selected option is a white 6px thumb with the segment shadow. Used for the station sort (Alfabetycznie / Od najgorszych).
- **Station list rows:** at least 56px tall, 8px radius, city at 600 over street in body-sm slate (truncated), and a small index badge at the right. Mist on hover. The current row is accent-soft, with the city in accent-strong.

### Station Hero (signature)
The overall verdict comes first. A 168px index disc (128px on phones) holds the level name in headline weight and the caption "indeks GIOŚ". Under the disc sits the six-step level scale on a white 8px plate: six 6px steps at 45% opacity, with the current step drawn full height (14px) in full colour and a 2px white and 1px ink ring. The plate stays white on every card so the scale reads on a flooded hero too. To the right: the display title, the lede-weight answer sentence, then a row of facts (caption term over 600 value: Decyduje, Indeks z, Stacja GIOŚ) and a refresh link button. The hero follows the Volume Rule.

### Pollutant Card (signature)
- **Head:** the pollutant code (title, with chemical subscripts such as NO₂) over its Polish name (body-sm slate), and the GIOŚ sub-index badge at the top right.
- **Value:** the latest hourly value as published, in the figure style, with the unit and "ostatni pomiar" time.
- **24 h chart:** a 64px SVG of 24 hourly bars in bar grey, with missing hours in line. A dashed accent mean line (4 3, 1.5 stroke). The latest bar is ink, or the GIOŚ sub-index colour with a faint ink outline, but only when the sub-index was calculated for that same hour. Hover, tap or arrow keys mark the active bar in accent, and the centre caption becomes a readout in accent-strong. The caption row is a three-column grid: first hour, mean or readout, last hour.
- **Norm meters:** one row each for WHO 2021 and UE, separated from the chart by a hairline. A 6px pill track whose 2px ink limit tick always sits at 50%, so the track spans twice the norm. The within portion is meter-within. The above portion is danger, with the figure in danger and an alert icon. A caption states the basis (for example "średnia z 24 h: 60 z 45 µg/m³"). The norm is only compared over its own averaging period.

### Voivodeship Summary
A verdict card, "Najgorszy indeks w województwie" with the worst-level badge, follows the Volume Rule. Below it, a distribution card: a 14px pill bar of level segments with 2px gaps (each at least 6px), on a line track. Under it is a legend grid of swatch, name and tabular count, with zero counts dimmed to pewter.

### Map (home)
An SVG of the 16 voivodeships, generated from Natural Earth boundaries by `scripts/voivodeship-map.py`. Regions rest in map grey with white borders and slate 600 labels. Hover or focus turns the region map-hover blue with ink labels, and focus adds a 2.5px accent stroke. The map shows no index colours: it is navigation, not a reading.

### States
- **Loading:** skeleton blocks (6px radius, a #eceff3 → #f6f8fa sweep, 1.4s ease-in-out), shaped like the content they replace.
- **Error:** a notice block (20px padding, slate text, ink for alerts) with a retry link button. Inline errors use danger with the alert icon. If one station's index fails, the others still render.
- **Reduced motion:** every animation and transition collapses to 0.01ms.

### Icons
Authored line icons on a 24×24 grid with a 1.75 stroke and round caps and joins, drawn in currentColor at 20px by default. The set: search, chevrons, close, refresh, external, check, alert, info, minus, and one filled heart, which appears only in the footer credit, in the accent colour. They are always `aria-hidden`, and a text label carries the meaning.

## Do's and Don'ts

### Do:
- **Do** take index colour only from lvl-0 … lvl-5 and lvl-none, set through `data-level`, which provides both `--lvl` and `--lvl-ink`.
- **Do** put ink text on levels 0–3 and white on levels 4–5, everywhere a level colour is a fill.
- **Do** follow the Volume Rule on any surface that states a verdict: white at 0–2, warn-tint at 3, a full flood with inverted disc and badges at 4–5, over a 200ms ease-out transition.
- **Do** name the source next to every verdict or norm (GIOŚ, WHO 2021, UE) and compare norms only over their own averaging period.
- **Do** set every number and time in tabular figures.
- **Do** use 8px radii on controls and 12px on cards, with the hairline border and the single card shadow.
- **Do** keep the norm limit tick at 50% of a track that spans twice the norm.
- **Do** colour only the latest chart bar by the GIOŚ sub-index, and only when the sub-index hour matches the bar.
- **Do** use 150ms ease-out for hover and press transitions.

### Don't:
- **Don't** use a GIOŚ index colour for anything that is not an index level: no green success, no red buttons, no coloured decoration.
- **Don't** copy GIOŚ's white text on green or orange fills. It fails contrast.
- **Don't** load a webfont or add a second type family.
- **Don't** colour the map by index, or tint whole pages. Loudness lives on the verdict cards.
- **Don't** show a verdict without a source, or a bare value without its unit and hour.
- **Don't** add hover lifts or heavier shadows to cards for emphasis.
- **Don't** use icon fonts or packaged icon sets. Draw icons on the 24-unit grid with a 1.75 stroke.
