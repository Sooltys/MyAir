/** Polska odmiana po liczebniku: 1 stacja, 2–4 stacje, 5+ stacji (12–14 → stacji, 22–24 → stacje). */
export function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) {
    return one;
  }
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}
