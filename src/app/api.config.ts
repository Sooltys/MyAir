/**
 * Bazowy adres API GIOŚ widziany z przeglądarki.
 *
 * Przeglądarka nigdy nie woła serwera API GIOŚ bezpośrednio (GIOŚ wpuszcza przez CORS tylko
 * własną domenę). Zapytania na `/api/...` przekazuje dalej:
 * - na Cloudflare Pages: Pages Function `functions/api/[[path]].js`,
 * - w `ng serve`: `proxy.conf.json`.
 */
export const API_BASE_URL = '/api';
