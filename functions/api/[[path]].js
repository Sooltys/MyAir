// Cloudflare Pages Function: obsługuje wszystkie żądania pod /api/* (proxy do API GIOŚ v1).
// Logika jest w functions/_lib/proxy.mjs (testy: test/functions/).
import { handleProxyRequest } from '../_lib/proxy.mjs';

export const onRequest = (context) => handleProxyRequest(context);
