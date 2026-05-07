import { describe, it, expect } from 'vitest';
import { getDaemonHealth } from './health-indicator';

describe('getDaemonHealth', () => {
  it('returns active when dirty is false (daemon recently heartbeat)', () => {
    expect(getDaemonHealth(false, true)).toBe('active');
    expect(getDaemonHealth(false, false)).toBe('active');
  });

  it('returns stale when dirty is true but a heartbeat was received at some point', () => {
    expect(getDaemonHealth(true, true)).toBe('stale');
  });

  it('returns offline when dirty is true and no heartbeat was ever received', () => {
    expect(getDaemonHealth(true, false)).toBe('offline');
  });
});
