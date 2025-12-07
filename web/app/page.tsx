'use client';

import { useEffect, useMemo, useState } from 'react';
import CloudCard from '@/components/CloudCard';
import { AccountWithRoles } from '@/components/AccountRoleSelector';
import {
  AllowedRole,
  ProviderSummary,
  fetchMe,
  fetchProviders,
  requestConsoleUrl,
} from '@/lib/api';
import { beginLogin, loadSession, OIDCConfig, OIDCSession } from '@/lib/oidc';

const defaultOidcConfig = (origin?: string): OIDCConfig => ({
  issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER ?? 'https://auth.svc.plus',
  clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? 'xlogin-web',
  redirectUri: `${origin ?? ''}/callback`,
  scope: 'openid profile email',
  responseType: 'id_token',
  prompt: 'login',
});

const groupAllowedByProvider = (
  allowed: AllowedRole[],
  providers: ProviderSummary[],
): Array<{ provider: ProviderSummary; accounts: AccountWithRoles[] }> => {
  const providerIndex = new Map<string, ProviderSummary>();
  providers.forEach((provider) => providerIndex.set(provider.id, provider));

  const grouped = new Map<string, Map<string, AllowedRole[]>>();
  allowed.forEach((entry) => {
    if (!grouped.has(entry.provider)) grouped.set(entry.provider, new Map());
    const accounts = grouped.get(entry.provider)!;
    if (!accounts.has(entry.target)) accounts.set(entry.target, []);
    accounts.get(entry.target)!.push(entry);
  });

  return Array.from(grouped.entries()).map(([providerId, accountMap]) => ({
    provider:
      providerIndex.get(providerId) ?? {
        id: providerId,
        name: providerId.toUpperCase(),
        description: 'Provider description not returned yet.',
      },
    accounts: Array.from(accountMap.entries()).map(([target, roles]) => ({ target, roles })),
  }));
};

export default function Page() {
  const [session, setSession] = useState<OIDCSession | null>(null);
  const [me, setMe] = useState<{ claims: Record<string, unknown>; allowed: AllowedRole[] } | null>(null);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [selection, setSelection] = useState<Record<string, { target: string; roleKey: string }>>({});
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    setSession(loadSession());
  }, []);

  useEffect(() => {
    const token = session?.idToken;
    if (!token) return;

    const bootstrap = async () => {
      try {
        const [meResponse, providerResponse] = await Promise.all([fetchMe(token), fetchProviders(token)]);
        setMe(meResponse);
        setProviders(providerResponse);
      } catch (error) {
        console.error(error);
        setStatus('Failed to load identity or provider metadata.');
      }
    };

    void bootstrap();
  }, [session?.idToken]);

  const providerCards = useMemo(() => {
    if (!me) return [] as Array<{ provider: ProviderSummary; accounts: AccountWithRoles[] }>;
    return groupAllowedByProvider(me.allowed, providers);
  }, [me, providers]);

  const handleLogin = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const url = beginLogin(defaultOidcConfig(origin));
    setStatus(`Redirecting to IdP: ${url}`);
  };

  const handleSelectionChange = (providerId: string, target: string, roleKey: string) => {
    setSelection((current) => ({ ...current, [providerId]: { target, roleKey } }));
  };

  const handleLaunchConsole = async (providerId: string) => {
    if (!session?.idToken) {
      setStatus('Sign in to generate a console URL.');
      return;
    }
    const currentSelection = selection[providerId];
    if (!currentSelection) {
      setStatus('Select an account and role first.');
      return;
    }

    try {
      setStatus('Requesting console URL...');
      const response = await requestConsoleUrl(session.idToken, {
        provider: providerId,
        target: currentSelection.target,
        roleKey: currentSelection.roleKey,
      });
      window.location.href = response.consoleUrl;
    } catch (error) {
      console.error(error);
      setStatus('Failed to generate console URL.');
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Unified dashboard</h2>
          <span className="text-xs px-2 py-1 border border-emerald-500/50 bg-emerald-500/10 rounded-full text-emerald-200">
            IdP → XLogin API → Cloud
          </span>
        </div>
        <p className="text-gray-400 max-w-3xl">
          Authenticate with your OpenID Provider, discover which cloud accounts and roles are allowed, and launch a
          short-lived console session with one click. All flows reuse the same id_token you obtained from the IdP.
        </p>
        {!session?.idToken ? (
          <button
            onClick={handleLogin}
            className="self-start bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md font-semibold"
          >
            Login with auth.svc.plus
          </button>
        ) : (
          <p className="text-sm text-emerald-300">id_token detected, loading available access...</p>
        )}
        {status ? <p className="text-xs text-amber-300">{status}</p> : null}
      </section>

      {session?.claims ? (
        <section className="border border-gray-800 rounded-lg p-5 bg-gray-950/40 space-y-3">
          <h3 className="text-lg font-semibold">OIDC claims</h3>
          <pre className="bg-black/40 border border-gray-800 rounded p-3 overflow-auto text-sm text-gray-200">
            {JSON.stringify(session.claims, null, 2)}
          </pre>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Accessible providers</h3>
          <p className="text-xs text-gray-500">Each card shows the accounts and roles returned by /api/me</p>
        </div>
        {providerCards.length === 0 ? (
          <p className="text-gray-400">Sign in to load accessible cloud accounts.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {providerCards.map((item) => (
              <CloudCard
                key={item.provider.id}
                provider={item.provider}
                accounts={item.accounts}
                selected={selection[item.provider.id]}
                onSelectionChange={(target, roleKey) => handleSelectionChange(item.provider.id, target, roleKey)}
                onLaunchConsole={() => handleLaunchConsole(item.provider.id)}
                disabled={!session?.idToken}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
