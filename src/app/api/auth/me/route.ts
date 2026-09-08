import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getSessionFromRequest(request);

  if (!user) {
    return NextResponse.json({
      success: false,
      authenticated: false,
      user: null
    });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      id: user.userId,
      email: user.email,
      role: user.role.toLowerCase(),
      roleRaw: user.role,
      name: user.name,
      organization: user.organization
    }
  });
}
