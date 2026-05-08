/**
 * Tests for GET /api/cockpit/devices
 *
 * Covers:
 * - 401 when no session is present
 * - 403 when a non-admin session is present
 * - tokenHash is never present in any response payload
 * - Successful admin response shape (devices + pendingPairings)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { authMock, repositoryMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  repositoryMock: {
    listDevicesWithDetails: vi.fn(),
    listPendingDevicePairings: vi.fn(),
    listProjects: vi.fn(),
    getProjectedProjectState: vi.fn(),
  },
}));

vi.mock('auth', () => ({ auth: authMock }));
vi.mock('@/lib/cockpit-repo', () => ({
  getCockpitRepository: () => repositoryMock,
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRequest(url = 'http://localhost/api/cockpit/devices') {
  return new NextRequest(url);
}

function adminSession() {
  return { user: { email: 'martin@example.com', role: 'admin' } };
}

function userSession() {
  return { user: { email: 'other@example.com', role: 'user' } };
}

const NOW = new Date('2026-05-08T12:00:00Z');

const mockDevice = {
  deviceId: 'dev-abc123',
  deviceName: 'Martin laptop',
  instanceName: null,
  metadata: null,
  pairedAt: NOW,
  lastSeenAt: null,
  revokedAt: null,
  revokedReason: null,
  activeSessionCount: 1,
  maxEventSequence: 42,
  latestToken: {
    tokenId: 'tok-uuid-1',
    // tokenHash should never be included in any response
    tokenLabel: 'dev-laptop',
    issuedAt: NOW,
    expiresAt: null,
    lastUsedAt: null,
    revokedAt: null,
    revokedReason: null,
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/cockpit/devices', () => {
  beforeEach(() => {
    repositoryMock.listDevicesWithDetails.mockResolvedValue([mockDevice]);
    repositoryMock.listPendingDevicePairings.mockResolvedValue([]);
    repositoryMock.listProjects.mockResolvedValue([]);
    repositoryMock.getProjectedProjectState.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no session', async () => {
    authMock.mockResolvedValue(null);

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ error: 'Unauthorized' });
  });

  it('returns 403 when the session is not an admin', async () => {
    authMock.mockResolvedValue(userSession());

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toMatchObject({ error: 'Forbidden' });
  });

  it('returns devices and pendingPairings for an admin session', async () => {
    authMock.mockResolvedValue(adminSession());

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json() as { devices: unknown[]; pendingPairings: unknown[] };
    expect(body.devices).toHaveLength(1);
    expect(body.pendingPairings).toHaveLength(0);
  });

  it('never includes tokenHash in the response', async () => {
    authMock.mockResolvedValue(adminSession());

    // Inject a tokenHash on the repository mock (it should be stripped)
    repositoryMock.listDevicesWithDetails.mockResolvedValue([
      {
        ...mockDevice,
        latestToken: {
          ...mockDevice.latestToken,
          tokenHash: 'super-secret-hash-value-that-must-not-leak',
        },
      },
    ]);

    const { GET } = await import('./route');
    const response = await GET(makeRequest());
    const body = await response.json();

    // Stringify the entire response and verify the hash is absent
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).not.toContain('super-secret-hash-value-that-must-not-leak');
    expect(bodyStr).not.toContain('tokenHash');
  });

  it('includes observedProjectCount from projected states', async () => {
    authMock.mockResolvedValue(adminSession());

    repositoryMock.listProjects.mockResolvedValue([{ projectId: 'proj-1' }]);
    repositoryMock.getProjectedProjectState.mockResolvedValue({
      devices: {
        'dev-abc123': {
          deviceId: 'dev-abc123',
          lastHeartbeat: { occurredAt: '2026-05-08T11:55:00Z', activeTaskCount: 0 },
        },
      },
    });

    const { GET } = await import('./route');
    const response = await GET(makeRequest());
    const body = await response.json() as { devices: Array<{ observedProjectCount: number; lastHeartbeatAt: string }> };

    expect(response.status).toBe(200);
    expect(body.devices[0]!.observedProjectCount).toBe(1);
    expect(body.devices[0]!.lastHeartbeatAt).toBe('2026-05-08T11:55:00Z');
  });

  it('honours includeRevoked query param', async () => {
    authMock.mockResolvedValue(adminSession());

    const { GET } = await import('./route');
    await GET(makeRequest('http://localhost/api/cockpit/devices?includeRevoked=true'));

    expect(repositoryMock.listDevicesWithDetails).toHaveBeenCalledWith({ includeRevoked: true });
  });
});
