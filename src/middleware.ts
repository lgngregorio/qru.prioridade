
import { NextResponse, type NextRequest } from 'next/server';
import { useUser } from '@/firebase';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { user, isUserLoading } = useUser();
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/signup', '/forgot-password'];

  if (isUserLoading) {
    return NextResponse.next();
  }

  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
