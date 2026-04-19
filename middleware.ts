import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/maintenance', '/error-500', '/mobile-scanner'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, Next.js internals, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files (favicon.ico, etc.)
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const token = request.cookies.get('token')?.value;

  // Redirect to login if accessing a protected route without a token
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged in and accessing public auth routes
  if (isPublicRoute && token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // PREVENCIÓN DE BYPASS (Botón Atrás): No cachear rutas protegidas
  if (!isPublicRoute) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
