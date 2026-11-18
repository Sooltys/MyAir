# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences carry equal weight (confirmed by the owner):

- **People in Poland checking current air quality.** They want to know what the air is like at a nearby GIOŚ measuring station right now. They use the app as a real tool on desktop and on phones.
- **Portfolio reviewers.** Recruiters and potential clients who arrive from the author's portfolio at https://puzyna.pl and judge the author's frontend work by using the app.

Neither audience is secondary. The app has to work as a real tool for the first group and hold up to close inspection by the second.

## Product Purpose

MyAir shows current air quality from the measuring stations of GIOŚ (Główny Inspektorat Ochrony Środowiska). The path through it is: map of Polish voivodeships → that voivodeship's stations → the latest reading from every sensor at the chosen station.

Confirmed direction: readings should stop being bare numbers. Each one should also be shown against two references:

1. **The official GIOŚ air-quality index** (Polski Indeks Jakości Powietrza), read from GIOŚ's own API.
2. **Health norms**, so a reading says what it means for health. Two references, shown together (confirmed by the owner): the **WHO 2021 guidelines** (health-based) and the **EU limit values currently binding in Poland** (legal).

Success means a resident can tell what the air at a station is like and what that means, without knowing the units or the norms beforehand. A reviewer should see a working, carefully built tool running on live public data.

## Positioning

*Derived from the owner's answers, not written by them.*

MyAir presents official data plainly. It shows GIOŚ's measurements exactly as published, every sensor of one station in a single view. Next to each value it adds the official index and a named health norm, so a resident gets both the number and its meaning without leaving the page. It produces no measurements, estimates or forecasts of its own.

## Operating Context

- Public, anonymous, Polish-language website at https://myair.puzyna.pl/, with no accounts.
- Visitors arrive directly or from the portfolio. The header's "Autor" button links to https://puzyna.pl, and the footer credit reads "Zrobione z ♥ przez puzyna.pl".
- GIOŚ publishes hourly measurements. The most recent hours are often still empty. Manual stations have no current data at all. The GIOŚ API is sometimes slow or down.
- The browser only ever calls `/api/*`. A Cloudflare Pages Function proxies those calls to GIOŚ API v1 (`https://api.gios.gov.pl/pjp-api/v1/rest/`) and caches responses for 10 minutes. GIOŚ's CORS policy only admits its own domain, so the browser cannot call GIOŚ directly.

## Capabilities and Constraints

**Current capabilities** (after the 2026-11-18 redesign)

- Home: an SVG map of the 16 voivodeships drawn from Natural Earth boundaries (public domain; generator in `scripts/voivodeship-map.py`). Next to it is a list of the voivodeships with their GIOŚ station counts (288 stations in total).
- A station search in the header works from any page. It ignores Polish characters ("krakow" finds Kraków), is keyboard-operable as a combobox, and opens the station directly.
- `/wojewodztwo/:id`: the voivodeship's stations, each with its GIOŚ index level. They are sorted alphabetically, or worst first on request. A summary shows the worst index in the voivodeship and how the levels are spread across its stations. On a phone, the summary sits above the list.
- `/wojewodztwo/:id/stacja/:stationId`: a station has its own URL. The station view leads with the overall GIOŚ index (disc plus the six-step scale), the pollutant that decides it and an answer-first sentence about the norms. A card for each pollutant with norms shows:
  - the latest hourly value, as published;
  - a 24-hour bar chart with the mean line and an hour-by-hour readout (hover, tap or arrow keys);
  - the GIOŚ sub-index;
  - meters against the WHO 2021 guideline and the EU limit.

  Other sensors (NO, NOx, manual PM and heavy-metal samplers) are folded into "Pozostałe stanowiska".
- Loudness follows the index. Levels 0–2 show a calm white card, level 3 a tinted card, and levels 4–5 flood the hero and the voivodeship verdict with the index colour (on phones the browser bar turns that colour too).
- Every failure state has a retry: the station list, the indexes and the readings. If one station's index fails, the others still load.
- The app no longer uses Angular Material or Google Fonts. It uses system UI fonts and its own components.

**Confirmed constraints**

- **Map-first flow.** Voivodeship map → station list → readings stays the main path through the app.
- **Polish only.** No other language version is planned.
- All data goes through the same-origin `/api` proxy. The browser never calls GIOŚ directly.
- Hosting is Cloudflare Pages at `myair.puzyna.pl`. `base href="/"` and the canonical URL `https://myair.puzyna.pl/` stay as they are. The `master` branch deploys to production.

**Terminology** (as GIOŚ uses it, kept in the UI)

- województwo: voivodeship
- stacja: measuring station
- stanowisko: one sensor or measuring position at a station
- wskaźnik: the measured parameter (PM10, PM2.5, NO₂, O₃, SO₂, CO, C₆H₆…)
- indeks jakości powietrza: the official index, with six levels: bardzo dobry, dobry, umiarkowany, dostateczny, zły, bardzo zły

**Norm comparison method** (settled in `src/app/lib/norms.ts`)

- Daily norms are compared with the mean of the last 24 hourly values, which needs at least 18 hours of data.
- 8-hour norms (O₃, EU CO) use the highest 8-hour rolling mean in the last day, which needs at least 6 of the 8 hours.
- Hourly norms (EU NO₂) use the latest hour with a value.
- Annual norms (EU PM2.5 20 µg/m³, benzene 5 µg/m³) are shown but never compared with one day of data.

**Open decisions**

- Whether GIOŚ stays the only data source. Left open.
- A formal accessibility standard. The owner didn't confirm WCAG 2.2 AA as a hard requirement, so none is recorded (the build still targets AA contrast and full keyboard use).
- Health advice per index level: GIOŚ's official wording was not found, so none is shown rather than invented.

## Brand Commitments

- Name: **My Air**, used in the header and the page title ("My Air – bieżąca jakość powietrza w Polsce"). The mark is `public/favicon.png`.
- Data attribution: the footer credits GIOŚ and links to https://powietrze.gios.gov.pl.
- Ties to the portfolio: the header's "Autor" link stays, and so does the footer credit "Zrobione z ♥ przez puzyna.pl" (heart as an icon, link on "puzyna.pl"). There is no "Wróć do portfolio" wording (owner's request, 2026-11-18).
- Voice in the current copy: plain Polish, informal second person ("Spróbuj ponownie za chwilę"), short and factual status messages.
- **Visual direction: the category standard, played straight** (chosen by the owner on 2026-11-18 over more expressive directions). MyAir should look and behave like a well-made air-quality app, with familiar conventions and no novelty for its own sake. The bar is the craft of **Airly, IQAir AirVisual and the air-quality module in Apple Weather**: their finish, legibility and phone behaviour, not their layouts or branding.
- Index colours follow GIOŚ's official scale (as on powietrze.gios.gov.pl), so the app reads like the official source. Text on those fills must still meet contrast requirements.
- Calm when the air is good; allowed to be loud when it is bad (the owner's words: "krzykliwa czasami, kiedy powietrze jest złe"). Fewer bare numbers: every screen should answer "jak jest?" before it shows values.

## Evidence on Hand

- Live GIOŚ data is the product's content. The station list, sensors and hourly measurements all come from API v1.
- Map: `src/app/data/voivodeship-shapes.ts` holds the voivodeship boundaries, generated by `scripts/voivodeship-map.py` from Natural Earth 1:10m Admin 1 (public domain). The voivodeship list is in `src/app/data/voivodeships.ts`.
- Not available: usage analytics, user counts, testimonials, press and accuracy studies. Future work must not invent any of them, and must not claim more accuracy or timeliness than GIOŚ's own data has.

## Product Principles

1. **Official numbers are never altered.** Values appear exactly as GIOŚ publishes them. MyAir adds context, never its own measurements or estimates.
2. **Every verdict names its source.** An index level is GIOŚ's. A health comparison names its norm and averaging period. Nothing is called good or bad without a source.
3. **Gaps are stated plainly.** Empty hours, manual stations and GIOŚ outages are said clearly and never hidden or filled in.
4. **Built for both audiences.** It has to be a tool a resident would rely on and a piece of work a reviewer can take apart. Correctness, failure states and craft are part of the product.
5. **Map first, Polish throughout.** Whatever is added, the voivodeship map stays the way in and the language stays Polish.
