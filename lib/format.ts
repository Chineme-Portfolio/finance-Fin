/**
 * Display formatting for money and shares. All unit conversion (minor units to
 * major, basis points to percent) lives here, never inside a React component, so
 * components receive finished strings/numbers and do no arithmetic on financial
 * values (spec 0003 AC-6, AC-10; foundation.md §4 #1). This is formatting of
 * figures the engine already computed, not computing new ones.
 */

/** Integer minor units (cents) to a whole-number major value, for Stat. */
export function minorToMajorNumber(minor: number): number {
  return minor / 100;
}

/** Integer minor units to a display string like "$5,215". */
export function formatMoney(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

/** Integer basis points to a percent label like "62%". */
export function formatBps(bps: number): string {
  return `${Math.round(bps / 100)}%`;
}
