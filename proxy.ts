import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/employee', request.url));
    }
    return NextResponse.next();
  }

  // Protect /employee routes
  if (pathname.startsWith('/employee')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (session.role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Protect /payslip routes
  if (pathname.startsWith('/payslip')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Already logged in → redirect away from login page
  if (pathname === '/' && session) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/employee', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/employee/:path*', '/payslip/:path*'],
};
