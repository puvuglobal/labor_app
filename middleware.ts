import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/')) {
    return NextResponse.redirect(new URL('/dashboard/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
  ],
}
