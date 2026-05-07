/**
 * HTTP client for the clean.dev cockpit API.
 *
 * All functions use the native `fetch` global (Node 18+) and throw on
 * unexpected HTTP errors.  Callers are responsible for handling the typed
 * return values (pending, approved, expired, etc.).
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PairDeviceResponse {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
}

export type ExchangeStatus = 'approved' | 'pending' | 'expired';

export interface ExchangeDeviceResponse {
  status: ExchangeStatus;
  token?: string;
  deviceId?: string;
}

export interface RemoteProject {
  projectId: string;
  projectSlug: string | null;
  projectName: string | null;
  localRootPath: string | null;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  url: string,
  options: RequestInit & { bearerToken?: string },
): Promise<T> {
  const { bearerToken, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers as Record<string, string> | undefined);

  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  if (bearerToken) {
    headers.set('Authorization', `Bearer ${bearerToken}`);
  }

  const response = await fetch(url, { ...fetchOptions, headers });

  let body: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as Record<string, unknown>).error)
        : `HTTP ${response.status}`;

    throw new ApiError(response.status, message);
  }

  return body as T;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Step 1 of device-code pairing flow.
 *
 * Calls POST /api/cockpit/devices/pair.  No authentication required.
 */
export async function pairDevice(
  serverUrl: string,
  opts: {
    deviceId: string;
    deviceName: string;
    instanceName?: string;
  },
): Promise<PairDeviceResponse> {
  const url = `${serverUrl.replace(/\/$/, '')}/api/cockpit/devices/pair`;
  return apiFetch<PairDeviceResponse>(url, {
    method: 'POST',
    body: JSON.stringify({
      deviceId: opts.deviceId,
      deviceName: opts.deviceName,
      instanceName: opts.instanceName ?? null,
    }),
  });
}

/**
 * Step 3 of device-code pairing flow.
 *
 * Polls POST /api/cockpit/devices/exchange.  Returns the exchange result;
 * callers must retry while status === 'pending'.
 */
export async function pollExchange(
  serverUrl: string,
  opts: {
    deviceCode: string;
    deviceId: string;
  },
): Promise<ExchangeDeviceResponse> {
  const url = `${serverUrl.replace(/\/$/, '')}/api/cockpit/devices/exchange`;

  // A 202 (pending) is not an "ok" response, but it is expected.
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      deviceCode: opts.deviceCode,
      deviceId: opts.deviceId,
    }),
  });

  let body: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  // 202 = pending, 410 = expired, 200 = approved
  if (response.status === 202) {
    return { status: 'pending' };
  }

  if (response.status === 410) {
    return { status: 'expired' };
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as Record<string, unknown>).error)
        : `HTTP ${response.status}`;
    throw new ApiError(response.status, message);
  }

  const data = body as Record<string, unknown>;
  const status = data.status as ExchangeStatus;

  if (status === 'approved') {
    return {
      status: 'approved',
      token: typeof data.token === 'string' ? data.token : undefined,
      deviceId: typeof data.deviceId === 'string' ? data.deviceId : undefined,
    };
  }

  return { status: status ?? 'pending' };
}

/**
 * List cockpit projects from the remote server.
 *
 * Calls GET /api/cockpit/daemon/projects with a daemon bearer token.
 */
export async function listRemoteProjects(
  serverUrl: string,
  token: string,
): Promise<RemoteProject[]> {
  const url = `${serverUrl.replace(/\/$/, '')}/api/cockpit/daemon/projects`;
  const result = await apiFetch<{ projects: RemoteProject[] }>(url, {
    method: 'GET',
    bearerToken: token,
  });
  return result.projects;
}

/**
 * Find a single remote project by ID.
 *
 * Returns null if the project does not exist on the server.
 */
export async function findRemoteProject(
  serverUrl: string,
  token: string,
  projectId: string,
): Promise<RemoteProject | null> {
  const projects = await listRemoteProjects(serverUrl, token);
  return projects.find((p) => p.projectId === projectId) ?? null;
}

// Re-export ApiError so callers can instanceof-check it.
export { ApiError };
