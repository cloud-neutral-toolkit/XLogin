import { NextRequest, NextResponse } from 'next/server';
import { decodeJwtPayload } from '@/lib/oidc';

export async function POST(request: NextRequest) {
  const { idToken, state } = await request.json();
  if (!idToken) {
    return NextResponse.json({ error: 'id_token required' }, { status: 400 });
  }

  const claims = decodeJwtPayload(idToken);
  const response = NextResponse.json({ stored: true, state, claims });
  response.cookies.set('id_token', idToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return response;
}
