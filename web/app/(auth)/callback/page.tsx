'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeImplicitFlow, parseCallbackParameters, decodeJwtPayload } from '@/lib/oidc';

export default function CallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Processing OIDC response...');

  useEffect(() => {
    const finish = async () => {
      try {
        const origin = window.location.origin;
        const redirectUri = `${origin}/callback`;
        await completeImplicitFlow({
          issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER ?? 'https://auth.svc.plus',
          clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? 'xlogin-web',
          redirectUri,
        });
        setMessage('Login successful, redirecting to dashboard...');
        setTimeout(() => router.replace('/'), 500);
      } catch (error) {
        console.error(error);
        setMessage('Failed to handle callback, please retry the login flow.');
      }
    };

    void finish();
  }, [router]);

  const params = parseCallbackParameters();
  const claims = params.idToken ? decodeJwtPayload(params.idToken) : undefined;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">OIDC Callback</h1>
      <p className="text-gray-300">{message}</p>
      {params.idToken ? (
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">Received id_token, storing locally for API calls.</p>
          <details className="bg-black/30 border border-gray-800 rounded p-3 text-gray-100">
            <summary className="cursor-pointer">Decoded claims preview</summary>
            <pre className="text-xs mt-2">{JSON.stringify(claims, null, 2)}</pre>
          </details>
        </div>
      ) : (
        <p className="text-sm text-amber-300">No id_token found in the callback payload.</p>
      )}
    </main>
  );
}
