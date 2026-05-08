import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatRelativeTime,
  formatNumber,
  formatCostUsd,
} from './format';

describe('formatDuration', () => {
  it('returns empty string for null/undefined/NaN', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(NaN)).toBe('');
  });

  it('formats sub-second durations as ms', () => {
    expect(formatDuration(250)).toBe('250ms');
  });

  it('formats sub-minute durations as seconds with one decimal', () => {
    expect(formatDuration(2_345)).toBe('2.3s');
  });

  it('formats longer durations as Mm:SSs', () => {
    expect(formatDuration(75_000)).toBe('1m15s');
    expect(formatDuration(125_000)).toBe('2m05s');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-05-08T12:00:00.000Z');

  it('returns em dash for empty input', () => {
    expect(formatRelativeTime(null, now)).toBe('—');
    expect(formatRelativeTime(undefined, now)).toBe('—');
  });

  it('handles "just now" within the first minute', () => {
    expect(formatRelativeTime('2026-05-08T11:59:30.000Z', now)).toBe('just now');
  });

  it('handles minute / hour / day buckets', () => {
    expect(formatRelativeTime('2026-05-08T11:30:00.000Z', now)).toBe('30m ago');
    expect(formatRelativeTime('2026-05-08T08:00:00.000Z', now)).toBe('4h ago');
    expect(formatRelativeTime('2026-05-05T12:00:00.000Z', now)).toBe('3d ago');
  });
});

describe('formatNumber', () => {
  it('formats with US locale separators', () => {
    expect(formatNumber(1_234_567)).toBe('1,234,567');
  });
  it('returns "0" for null/undefined/NaN', () => {
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(NaN)).toBe('0');
  });
});

describe('formatCostUsd', () => {
  it('shows $0.00 for zero or missing values', () => {
    expect(formatCostUsd(0)).toBe('$0.00');
    expect(formatCostUsd(null)).toBe('$0.00');
  });

  it('uses 4 dp for sub-dollar costs to make micro-spend visible', () => {
    expect(formatCostUsd(0.0234)).toBe('$0.0234');
  });

  it('uses 2 dp for typical costs', () => {
    expect(formatCostUsd(12.5)).toBe('$12.50');
  });

  it('rounds to integer for >= $100', () => {
    expect(formatCostUsd(123.45)).toBe('$123');
  });
});
