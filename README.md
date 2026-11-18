# MyAir

Bieżąca jakość powietrza ze stacji pomiarowych GIOŚ: mapa województw → lista stacji z indeksem GIOŚ →
odczyty stacji z ostatniej doby i porównanie z normami WHO i UE.

Angular 22 (standalone, zoneless, bez bibliotek UI), hosting na Cloudflare Pages.
Źródło danych: [Główny Inspektorat Ochrony Środowiska](https://powietrze.gios.gov.pl), API v1.

## Wymagania

Node.js w wersji z [.nvmrc](.nvmrc) (`nvm use`).

## Jak to działa

API GIOŚ wpuszcza przez CORS tylko własną domenę, więc przeglądarka woła wyłącznie `/api/...`
(stała `API_BASE_URL` w [src/app/api.config.ts](src/app/api.config.ts)), a dalej przekazuje to:

| Środowisko | Co obsługuje `/api/*` |
| --- | --- |
| `npm start` (`ng serve`) | [proxy.conf.json](proxy.conf.json) |
| Cloudflare Pages / `npm run preview` | Pages Function [functions/api/[[path]].js](functions/api/[[path]].js) |

Pages Function:
- przyjmuje tylko GET/HEAD (inne → 405) i dokleja ścieżkę oraz query do
  `https://api.gios.gov.pl/pjp-api/v1/rest/`; nie da się nią wyjść poza ten adres (→ 400),
- trzyma odpowiedzi w Cache API przez 10 minut (nagłówek `X-Proxy-Cache: HIT|MISS`),
- po 10 s bez odpowiedzi GIOŚ zwraca 504, przy błędzie połączenia 502 (krótki JSON),
- przepuszcza status i `Content-Type`, bez `Set-Cookie` i `Access-Control-Allow-Origin`.

Nagłówki plików statycznych (cache, bezpieczeństwo) są w [public/_headers](public/_headers).
Brak `404.html` w wyniku builda włącza na Pages tryb SPA (każda nieznana ścieżka → `index.html`).

## Komendy

| Komenda | Opis |
| --- | --- |
| `npm start` | dev server na http://localhost:4200 z proxy do GIOŚ |
| `npm run build` | build produkcyjny do `dist/my-air/browser` |
| `npm test` | testy jednostkowe Angulara (Vitest) |
| `npm run test:functions` | testy Pages Function (`node --test`) |
| `npm run preview` | build + `wrangler pages dev` na http://localhost:8788 (jak na Pages, z proxy) |

## Deploy (Cloudflare Pages)

Adres produkcyjny: https://myair.puzyna.pl/ (link z portfolio https://puzyna.pl).

Projekt Pages zakładamy przez **Workers & Pages → Create → „Looking to deploy Pages? Get started”
→ Import an existing Git repository** (nie formularz Workers z `npx wrangler deploy`).
Pages buduje projekt z GitHuba po każdym pushu:

- production branch: `master` (inne gałęzie dostają podgląd na `*.pages.dev`),
- framework preset: **None**,
- build command: `npm run build`,
- build output directory: `dist/my-air/browser`,
- wersja Node z `.nvmrc` (zmienna `NODE_VERSION` nie jest potrzebna).

Domena: projekt → **Custom domains → Set up a custom domain** → `myair.puzyna.pl`. Strefa
`puzyna.pl` jest w tym samym koncie Cloudflare, więc rekord CNAME Pages dodaje sam.
