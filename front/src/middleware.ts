import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a dashboard or auth route
  const isDashboardOrAuth = pathname.includes('/dash-') || pathname.includes('/auth/mimo') || pathname.includes('/mimo');

  if (isDashboardOrAuth) {
    // If it's a dashboard/auth route and the locale is NOT Arabic (e.g. /en/dash-home), redirect to /ar/...
    const segments = pathname.split('/');
    if (segments[1] === 'en') {
      segments[1] = 'ar';
      const newUrl = request.nextUrl.clone();
      newUrl.pathname = segments.join('/');
      return NextResponse.redirect(newUrl);
    }
  }

  return intlMiddleware(request);
}
export const config = {
  // الماتشر ده بيحدد المسارات اللي الميدل وير يشتغل عليها
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};