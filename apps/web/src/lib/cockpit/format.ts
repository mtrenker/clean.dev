/**
 * Small formatting helpers shared across cockpit panels.
 *
 * Kept dependency-free so they can be imported by both server and client
 * components and unit-tested in isolation.
 */

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${minutes}m${seconds.toString().padStart(2, '0')}s`;
}

export function formatRelativeTime(
  isoString: string | Date | null | undefined,
  now: number = Date.now(),
): string {
  if (!isoString) return '—';
  const ts = isoString instanceof Date ? isoString.getTime() : Date.parse(isoString);
  if (Number.isNaN(ts)) return '—';
  const diff = now - ts;
  if (diff < 0) return 'in the future';
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '0';
  return NUMBER_FORMATTER.format(value);
}

/**
 * Formats a USD cost with a sensible number of decimals based on magnitude.
 *
 * - 0           → "$0.00"
 * - < $1        → "$0.0234"   (4 dp so micro-costs are visible)
 * - < $100      → "$1.23"     (2 dp)
 * - >= $100     → "$123"      (no dp)
 */
export function formatCostUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '$0.00';
  if (value === 0) return '$0.00';
  if (value < 1) return `$${value.toFixed(4)}`;
  if (value < 100) return `$${value.toFixed(2)}`;
  return `$${Math.round(value)}`;
}
