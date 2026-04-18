/**
 * Validate that numeric Y/M/D parts correspond to a real calendar date.
 *
 * JS `Date` silently rolls over invalid values (e.g. Feb 31 → Mar 2 or 3).
 * This helper constructs the date and then checks that the parts round-trip
 * back unchanged — rejecting impossible dates like 31.02.2024 or 29.02.2023.
 *
 * @param y  four-digit year
 * @param mo 1-based month (1 = January, 12 = December)
 * @param d  1-based day of month
 */
export function isRealDate(y: number, mo: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return false
  if (mo < 1 || mo > 12) return false
  if (d < 1 || d > 31) return false
  const date = new Date(y, mo - 1, d)
  return (
    date.getFullYear() === y &&
    date.getMonth() === mo - 1 &&
    date.getDate() === d
  )
}
