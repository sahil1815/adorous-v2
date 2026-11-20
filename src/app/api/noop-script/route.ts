import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return new NextResponse('/* @vercel/analytics disabled on custom host */\n', {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
