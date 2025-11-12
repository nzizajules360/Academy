import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/firebase/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/developer') && !pathname.startsWith('/developer/auth')) {
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/developer/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/developer/:path*',
  ],
}
