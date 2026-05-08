/**
 * Tests for GET /api/cockpit/devices/[deviceId] and DELETE /api/cockpit/devices/[deviceId]
 *
 * Covers:
 * - 401/403 for unauthenticated / non-admin requests
 * - tokenHash never leaks in the GET response
 * - 404 when device is not found
 * - Successful GET and DELETE shapes
 * - Revocation audit: revokeDevice called with reason
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { authMock, repositoryMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  repositoryMock: {
    listDevicesWithDetails: vi.fn(),
    listProjects: vi.fn(),
    getProjectedProjectState: vi.fn(),
    revokeDevice: vi.fn(),
  },
}));

vi.mock('auth', () => ({ auth: authMock }));
vi.mock('@/lib/cockpit-repo', () => ({
  getCockpitRepository: () => repositoryMock,
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeGetRequest(deviceId: string) {
  return new NextRequest(`http://localhost/api/cockpit/devices/${deviceId}`);
}

function makeDeleteRequest(deviceId: string, body?: Record<string, unknown>) {
  return new NextRequest(`http://localhost/api/cockpit/devices/${deviceId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function adminSession() {
  return { user: { email: 'martin@example.com', role: 'admin' } };
}

function userSession() {
  return { user: { email: 'other@example.com', role: 'user' } };
}

const NOW = new Date('2026-05-08T12:00:00Z');

const mockDevice = {
  deviceId: 'dev-xyz',
  deviceName: 'Build server',
  instanceName: 'ci-01',
  metadata: null,
  pairedAt: NOW,
  lastSeenAt: null,
  revokedAt: null,
  revokedReason: null,
  activeSessionCount: 0,
  maxEventSequence: 7,
  latestToken: {
    tokenId: 'tok-uuid-2',
    tokenLabel: 'ci-token',
    issuedAt: NOW,
    expiresAt: null,
    lastUsedAt: null,
    revokedAt: null,
    revokedReason: null,
  },
};

function setupDefault() {
  repositoryMock.listDevicesWithDetails.mockResolvedValue([mockDevice]);
  repositoryMock.listProjects.mockResolvedValue([]);
  repositoryMock.getProjectedProjectState.mockResolvedValue(null);
}

// ── GET tests ─────────────────────────────────────────────────────────────────

describe('GET /api/cockpit/devices/[deviceId]', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns 401 with no session', async () => {
    authMock.mockResolvedValue(null);
    setupDefault();

    const { GET } = await import('./route');
    const res = await GET(makeGetRequest('dev-xyz'), { params: Promise.resolve({ deviceId: 'dev-xyz' }) });

    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin session', async () => {
    authMock.mockResolvedValue(userSession());
    setupDefault();

    const { GET } = await import('./route');
    const res = await GET(makeGetRequest('dev-xyz'), { params: Promise.resolve({ deviceId: 'dev-xyz' }) });

    expect(res.status).toBe(403);
  });

  it('returns 404 when the device does not exist', async () => {
    authMock.mockResolvedValue(adminSession());
    repositoryMock.listDevicesWithDetails.mockResolvedValue([]);
    repositoryMock.listProjects.mockResolvedValue([]);

    const { GET } = await import('./route');
    const res = await GET(makeGetRequest('missing-id'), { params: Promise.resolve({ deviceId: 'missing-id' }) });

    expect(res.status).toBe(404);
  });

  it('returns device detail without tokenHash', async () => {
    authMock.mockResolvedValue(adminSession());
    // Inject a tokenHash on the mock that must NOT leak through the response
    repositoryMock.listDevicesWithDetails.mockResolvedValue([
      {
        ...mockDevice,
        latestToken: { ...mockDevice.latestToken, tokenHash: 'must-not-appear' },
      },
    ]);
    repositoryMock.listProjects.mockResolvedValue([]);

    const { GET } = await import('./route');
    const res = await GET(makeGetRequest('dev-xyz'), { params: Promise.resolve({ deviceId: 'dev-xyz' }) });

    expect(res.status).toBe(200);
    const body = await res.json() as { device: Record<string, unknown> };
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).not.toContain('must-not-appear');
    expect(bodyStr).not.toContain('tokenHash');
    expect(body.device.deviceId).toBe('dev-xyz');
  });

  it('exposes activeSessionCount, maxEventSequence, and latestToken.tokenLabel', async () => {
    authMock.mockResolvedValue(adminSession());
    setupDefault();

    const { GET } = await import('./route');
    const res = await GET(makeGetRequest('dev-xyz'), { params: Promise.resolve({ deviceId: 'dev-xyz' }) });

    const body = await res.json() as { device: Record<string, unknown> };
    expect(body.device.activeSessionCount).toBe(0);
    expect(body.device.maxEventSequence).toBe(7);
    expect((body.device.latestToken as Record<string, unknown>)?.tokenLabel).toBe('ci-token');
  });
});

// ── DELETE tests ──────────────────────────────────────────────────────────────

describe('DELETE /api/cockpit/devices/[deviceId]', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns 401 with no session', async () => {
    authMock.mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const res = await DELETE(makeDeleteRequest('dev-xyz'), { params: Promise.resolve({ deviceId: 'dev-xyz' }) });

    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin session', async () => {
    authMock.mockResolvedValue(userSession());

    const { DELETE } = await import('./route');
    const res = await DELETE(makeDeleteRequest('dev-xyz'), { params: Promise.resolve({ deviceId: 'dev-xyz' }) });

    expect(res.status).toBe(403);
  });

  it('returns 404 when revokeDevice throws not-found', async () => {
    authMock.mockResolvedValue(adminSession());
    repositoryMock.revokeDevice.mockRejectedValue(new Error('no device found with id dev-missing'));

    const { DELETE } = await import('./route');
    const res = await DELETE(makeDeleteRequest('dev-missing'), { params: Promise.resolve({ deviceId: 'dev-missing' }) });

    expect(res.status).toBe(404);
  });

  it('calls revokeDevice with the supplied reason', async () => {
    authMock.mockResolvedValue(adminSession());
    repositoryMock.revokeDevice.mockResolvedValue({ ...mockDevice, revokedAt: new Date() });

    const { DELETE } = await import('./route');
    const res = await DELETE(
      makeDeleteRequest('dev-xyz', { reason: 'laptop stolen' }),
      { params: Promise.resolve({ deviceId: 'dev-xyz' }) },
    );

    expect(res.status).toBe(200);
    expect(repositoryMock.revokeDevice).toHaveBeenCalledWith({
      deviceId: 'dev-xyz',
      reason: 'laptop stolen',
    });
  });

  it('returns the revoked device record', async () => {
    authMock.mockResolvedValue(adminSession());
    const revokedDevice = { ...mockDevice, revokedAt: new Date(), revokedReason: 'test reason' };
    repositoryMock.revokeDevice.mockResolvedValue(revokedDevice);

    const { DELETE } = await import('./route');
    const res = await DELETE(makeDeleteRequest('dev-xyz'), { params: Promise.resolve({ deviceId: 'dev-xyz' }) });

    expect(res.status).toBe(200);
    const body = await res.json() as { device: Record<string, unknown> };
    expect(body.device.deviceId).toBe('dev-xyz');
  });
});
