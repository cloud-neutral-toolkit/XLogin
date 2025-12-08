'use client';

import { useEffect, useState } from 'react';
import CloudCard from '@/components/CloudCard';
import { AccountWithRoles } from '@/components/AccountRoleSelector';
import { ProviderSummary, fetchProviders } from '@/lib/api';
import { loadSession } from '@/lib/oidc';

const emptyAccounts: AccountWithRoles[] = [];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const token = loadSession()?.idToken;
    const loadProviders = async () => {
      try {
        const providerList = await fetchProviders(token ?? undefined);
        setProviders(providerList);
      } catch (error) {
        console.error(error);
        setStatus('Unable to load providers.');
      }
    };
    void loadProviders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Configured providers</h2>
        <p className="text-gray-400 text-sm max-w-3xl">
          This page renders everything the XLogin API reports via <code>/api/providers</code>. Use it to confirm that
          cloud adapters are wired and to provide quick documentation for teammates.
        </p>
        {status ? <p className="text-xs text-amber-300">{status}</p> : null}
      </div>

      {providers.length === 0 ? (
        <p className="text-gray-400">No providers discovered yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <CloudCard
              key={provider.id}
              provider={provider}
              accounts={emptyAccounts}
              onSelectionChange={() => undefined}
              onLaunchConsole={() => undefined}
              disabled
            />
          ))}
        </div>
      )}
    </div>
  );
}
