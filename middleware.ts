import { type NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  let hostname = request.headers.get("x-forwarded-host") || request.headers.get("host") || ''
  
  if (hostname.includes(':')) {
    hostname = hostname.split(':')[0]
  }

  const url = request.nextUrl
  const path = url.pathname

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-current-domain', hostname)
  requestHeaders.set('x-current-path', path)

  const reservedPaths = [
    'about', 'contact', 'login', 'signup', 'dashboard', 'api', 'categories', 
    'courses', 'exams', 'mocktest', 'forgot-password', 'reset-password', 'auth', 
    'streams', 'blogs', 'complete-profile', 'cookie-policy', 'faqs', 
    'getting-started', 'library', 'privacy', 'profile', 'security', 'terms', 
    'update-password', '_next', 'subject-practice'
  ];

  const allowedSubroutes = [
    'about', 'contact', 'blogs', 'categories', 'streams', 'login', 'signup', 
    'forgot-password', 'reset-password'
  ];

  const segments = path.split('/').filter(Boolean);
  const potentialSlug = segments[0];

  // If visiting /:slug/:subroute (e.g. /gvmps/about -> rewrite to /about while keeping URL as /gvmps/about)
  if (potentialSlug && !reservedPaths.includes(potentialSlug) && segments.length > 1 && allowedSubroutes.includes(segments[1])) {
    const subpath = segments.slice(1).join('/');
    const rewriteUrl = new URL(`/${subpath}`, request.url);
    rewriteUrl.search = request.nextUrl.search;
    const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    rewriteResponse.cookies.set('school_slug', potentialSlug, { path: '/' });
    return rewriteResponse;
  }

  // Public routes check
  const isSchoolLanding = potentialSlug && !reservedPaths.includes(potentialSlug);
  const isPublicPath = 
    path === '/' ||                       
    path.startsWith('/login') ||          
    path.startsWith('/signup') ||         
    path.startsWith('/about') ||         
    path.startsWith('/contact') || 
    path.startsWith('/streams') ||    
    path.startsWith('/categories') ||        
    path.startsWith('/blogs') ||         
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/auth') ||           
    path.startsWith('/api/auth') ||       
    path.includes('.') ||
    Boolean(isSchoolLanding);

  const authRoutes = ['/login', '/signup', '/forgot-password', '/update-password'];
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  // Only decode JWT if necessary (e.g. visiting protected page or auth page)
  let user = null;
  if (!isPublicPath || isAuthRoute) {
    user = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev' });
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/categories', request.url));
  }

  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Track school slug in cookie if visiting /:slug
  if (isSchoolLanding) {
    response.cookies.set('school_slug', potentialSlug, { path: '/' });
  }

  return response;
}