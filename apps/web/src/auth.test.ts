import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  capturedConfig: null as any,
  githubProviderMock: vi.fn((options: Record<string, string>) => ({
    id: 'github',
    options,
  })),
  linkedinProviderMock: vi.fn((options: Record<string, string>) => ({
    id: 'linkedin',
    options,
  })),
}));

vi.mock('next-auth', () => ({
  default: vi.fn((config: unknown) => {
    state.capturedConfig = config;
    return {
      handlers: {},
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  }),
}));

vi.mock('next-auth/providers/github', () => ({
  default: state.githubProviderMock,
}));

vi.mock('next-auth/providers/linkedin', () => ({
  default: state.linkedinProviderMock,
}));

async function loadCallbacks() {
  await import('../auth');
  const callbacks = state.capturedConfig?.callbacks;
  if (!callbacks) {
    throw new Error('NextAuth callbacks were not captured');
  }
  return callbacks;
}

describe('auth configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    state.capturedConfig = null;

    process.env.GITHUB_ID = 'github-client-id';
    process.env.GITHUB_SECRET = 'github-client-secret';
    process.env.LINKEDIN_CLIENT_ID = 'linkedin-client-id';
    process.env.LINKEDIN_CLIENT_SECRET = 'linkedin-client-secret';
    delete process.env.ALLOWED_GITHUB_USERS;
  });

  it('registers GitHub and LinkedIn providers with configured credentials', async () => {
    await loadCallbacks();

    expect(state.githubProviderMock).toHaveBeenCalledWith({
      clientId: 'github-client-id',
      clientSecret: 'github-client-secret',
    });
    expect(state.linkedinProviderMock).toHaveBeenCalledWith({
      clientId: 'linkedin-client-id',
      clientSecret: 'linkedin-client-secret',
    });
  });

  describe('callbacks.signIn', () => {
    it('always allows LinkedIn sign-ins', async () => {
      process.env.ALLOWED_GITHUB_USERS = 'allowed-user';
      const callbacks = await loadCallbacks();

      const result = await callbacks.signIn({
        account: { provider: 'linkedin' },
        profile: {},
      });

      expect(result).toBe(true);
    });

    it('allows all GitHub users when ALLOWED_GITHUB_USERS is not set', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const callbacks = await loadCallbacks();

      const result = await callbacks.signIn({
        account: { provider: 'github' },
        profile: { login: 'any-user' },
      });

      expect(result).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        'ALLOWED_GITHUB_USERS not set - allowing all users',
      );
    });

    it('rejects GitHub users not in ALLOWED_GITHUB_USERS', async () => {
      process.env.ALLOWED_GITHUB_USERS = 'alice,bob';
      const callbacks = await loadCallbacks();

      const result = await callbacks.signIn({
        account: { provider: 'github' },
        profile: { login: 'mallory' },
      });

      expect(result).toBe(false);
    });
  });

  describe('callbacks.jwt', () => {
    it('stores LinkedIn identity fields in the token', async () => {
      const callbacks = await loadCallbacks();

      const token = await callbacks.jwt({
        token: {},
        account: { provider: 'linkedin' },
        profile: {
          sub: 'li-sub-123',
          name: 'LinkedIn Name',
          picture: 'https://example.com/avatar.jpg',
        },
      });

      expect(token).toMatchObject({
        provider: 'linkedin',
        linkedinSub: 'li-sub-123',
        name: 'LinkedIn Name',
        picture: 'https://example.com/avatar.jpg',
      });
    });

    it('sets provider for non-LinkedIn accounts without LinkedIn-specific fields', async () => {
      const callbacks = await loadCallbacks();

      const token = await callbacks.jwt({
        token: {},
        account: { provider: 'github' },
        profile: { login: 'alice' },
      });

      expect(token.provider).toBe('github');
      expect(token.linkedinSub).toBeUndefined();
    });
  });

  describe('callbacks.session', () => {
    it('exposes provider and LinkedIn subject on session.user', async () => {
      const callbacks = await loadCallbacks();

      const session = await callbacks.session({
        session: { user: {} },
        token: { provider: 'linkedin', linkedinSub: 'li-sub-999' },
      });

      expect(session.user.provider).toBe('linkedin');
      expect(session.user.linkedinSub).toBe('li-sub-999');
    });

    it('leaves linkedinSub unset when token has no linkedinSub', async () => {
      const callbacks = await loadCallbacks();

      const session = await callbacks.session({
        session: { user: {} },
        token: { provider: 'github' },
      });

      expect(session.user.provider).toBe('github');
      expect(session.user.linkedinSub).toBeUndefined();
    });
  });
});
