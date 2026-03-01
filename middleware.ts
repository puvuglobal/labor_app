import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get: (key) => request.cookies.get(key)?.value,
        set: (key, value, options) => {
          res.cookies.set(key, value, options)
        },
        remove: (key, options) => {
          res.cookies.delete(key)
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const pathname = request.nextUrl.pathname

    if (!session && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session && (pathname === '/login' || pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard/home', request.url))
    }
  } catch (e) {
    // Allow request to continue
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
