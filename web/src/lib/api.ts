export type AllowedRole = {
  provider: string;
  target: string;
  roleKey: string;
  roleName?: string;
  tenant?: string;
  env?: string;
};

export type MeResponse = {
  claims: Record<string, unknown>;
  allowed: AllowedRole[];
};

export type ProviderSummary = {
  id: string;
  name: string;
  description?: string;
  consoleUrlExample?: string;
  regions?: string[];
};

export type ConsoleUrlRequest = {
  provider: string;
  target: string;
  roleKey: string;
};

export type StsRequest = ConsoleUrlRequest;

export type StsCredentials = Record<string, unknown>;

const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? '';

const buildHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleJson = async <T>(response: Response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return (await response.json()) as T;
};

export const fetchMe = async (token: string): Promise<MeResponse> => {
  const response = await fetch(`${apiBase}/api/me`, {
    headers: buildHeaders(token),
    cache: 'no-store',
  });
  return handleJson<MeResponse>(response);
};

export const fetchProviders = async (token?: string): Promise<ProviderSummary[]> => {
  const response = await fetch(`${apiBase}/api/providers`, {
    headers: buildHeaders(token),
    next: { revalidate: 60 },
  });
  return handleJson<ProviderSummary[]>(response);
};

export const requestConsoleUrl = async (
  token: string,
  payload: ConsoleUrlRequest,
): Promise<{ consoleUrl: string }> => {
  const response = await fetch(`${apiBase}/api/console-url`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleJson<{ consoleUrl: string }>(response);
};

export const requestSts = async (token: string, payload: StsRequest): Promise<StsCredentials> => {
  const response = await fetch(`${apiBase}/api/sts`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleJson<StsCredentials>(response);
};
