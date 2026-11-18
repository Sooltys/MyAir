const PUBLISHED = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 3 });
const ONE_DECIMAL = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 });
const WHOLE = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });

/** Wartość pomiaru tak, jak opublikował ją GIOŚ – tylko z polskim przecinkiem dziesiętnym. */
export function formatValue(value: number): string {
  return PUBLISHED.format(value);
}

/** Wartość policzona przez MyAir (średnia, norma): do 1 miejsca po przecinku poniżej 10. */
export function formatDerived(value: number): string {
  return Math.abs(value) < 10 ? ONE_DECIMAL.format(value) : WHOLE.format(value);
}

/** Krotność normy, np. „4,7”. */
export function formatRatio(ratio: number): string {
  return ONE_DECIMAL.format(ratio);
}

interface LocalParts {
  year: number;
  month: number;
  day: number;
  time: string;
}

/** GIOŚ podaje czas lokalny jako "RRRR-MM-DD GG:MM:SS"; nie przeliczamy stref. */
function parseLocal(date: string): LocalParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(date);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute] = match;
  return { year: +year, month: +month, day: +day, time: `${hour}:${minute}` };
}

/** "2026-11-18 21:00:00" → "21:00". */
export function formatHour(date: string): string {
  return parseLocal(date)?.time ?? date;
}

/** "dziś, 21:00" / "wczoraj, 23:00" / "16.11, 23:00". */
export function formatWhen(date: string, now: Date = new Date()): string {
  const parts = parseLocal(date);
  if (!parts) {
    return date;
  }
  const day = new Date(parts.year, parts.month - 1, parts.day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diffDays === 0) {
    return `dziś, ${parts.time}`;
  }
  if (diffDays === 1) {
    return `wczoraj, ${parts.time}`;
  }
  const dd = String(parts.day).padStart(2, '0');
  const mm = String(parts.month).padStart(2, '0');
  return `${dd}.${mm}, ${parts.time}`;
}

/** Do wyszukiwania: małe litery, bez polskich znaków („Łódź” → „lodz”). */
export function normalizeText(text: string): string {
  return text
    .toLocaleLowerCase('pl')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}
