import { Buffer } from 'buffer';

export type OIDCConfig = {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  responseType?: 'id_token' | 'code' | 'code id_token';
  prompt?: string;
};

export type OIDCSession = {
  idToken: string;
  claims?: Record<string, unknown>;
  state?: string;
};

const STORAGE_KEY = 'xlogin_oidc_session';

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const decoded = typeof atob === 'function'
    ? atob(padded)
    : Buffer.from(padded, 'base64').toString('binary');
  return decoded;
};

export const decodeJwtPayload = (jwt: string): Record<string, unknown> => {
  const [, payload] = jwt.split('.');
  if (!payload) return {};
  const json = base64UrlDecode(payload);
  return JSON.parse(json) as Record<string, unknown>;
};

export const persistSession = (session: OIDCSession) => {
  if (typeof window === 'undefined') return session;
  const payload = JSON.stringify({
    idToken: session.idToken,
    claims: session.claims,
    state: session.state,
    storedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, payload);
  document.cookie = `id_token=${session.idToken}; path=/; SameSite=Lax`;
  return session;
};

export const loadSession = (): OIDCSession | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as OIDCSession;
    return parsed;
  } catch (error) {
    console.error('Failed to parse stored OIDC session', error);
    return null;
  }
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = 'id_token=; Max-Age=0; path=/; SameSite=Lax';
};

export const buildAuthorizationUrl = (config: OIDCConfig, state?: string, codeChallenge?: string) => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType ?? 'id_token',
    scope: config.scope ?? 'openid profile email',
    state: state ?? crypto.randomUUID(),
  });

  if (config.prompt) params.set('prompt', config.prompt);
  if (codeChallenge) {
    params.set('code_challenge', codeChallenge);
    params.set('code_challenge_method', 'S256');
  }

  return `${config.issuer.replace(/\/$/, '')}/authorize?${params.toString()}`;
};

export const beginLogin = (config: OIDCConfig, state?: string) => {
  const url = buildAuthorizationUrl(config, state);
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
  return url;
};

export const parseCallbackParameters = (urlString?: string) => {
  const targetUrl = urlString ?? (typeof window !== 'undefined' ? window.location.href : '');
  if (!targetUrl) {
    return { idToken: undefined, state: undefined, code: undefined };
  }

  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch {
    return { idToken: undefined, state: undefined, code: undefined };
  }
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const searchParams = url.searchParams;

  const idToken = hashParams.get('id_token') ?? searchParams.get('id_token');
  const state = hashParams.get('state') ?? searchParams.get('state');
  const code = hashParams.get('code') ?? searchParams.get('code');

  return { idToken: idToken ?? undefined, state: state ?? undefined, code: code ?? undefined };
};

export const completeImplicitFlow = async (config: OIDCConfig, urlString?: string) => {
  const { idToken, state } = parseCallbackParameters(urlString);
  if (!idToken) {
    throw new Error('Missing id_token in callback');
  }

  const claims = decodeJwtPayload(idToken);
  const session = persistSession({ idToken, claims, state });
  if (typeof fetch !== 'undefined') {
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, state }),
      });
    } catch (error) {
      console.warn('Unable to persist id_token cookie via route handler', error);
    }
  }
  return { session, redirectTo: '/' };
};
