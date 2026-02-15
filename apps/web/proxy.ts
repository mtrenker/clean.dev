import { auth } from "auth"

export const proxy = auth((req) => {
  const pathname = req.nextUrl.pathname

  // Admin routes that require authentication
  const adminRoutes = ['/clients', '/time', '/invoices', '/settings', '/bill']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Only protect admin routes
  if (isAdminRoute && !req.auth) {
    const newUrl = new URL('/api/auth/signin', req.nextUrl.origin)
    newUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
