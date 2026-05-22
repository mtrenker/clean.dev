/**
 * Next.js middleware – authentication guard and callback-URL sanitisation.
 *
 * SECURITY: Open-redirect prevention
 * ────────────────────────────────────
 * The `callbackUrl` forwarded to the sign-in page is derived from the current
 * request pathname (a relative path, never an absolute URL).  Using only
 * `pathname` – not the raw query string – guarantees the value is same-origin
 * and cannot be manipulated by a crafted query parameter.
 *
 * For defence in depth the value is also passed through `sanitizeCallbackUrl`
 * so that any future refactor that accidentally introduces a user-controlled
 * URL is caught at the call site rather than silently redirecting users
 * off-site after authentication.
 */
import { auth } from "auth"
import { isAdminSession } from "@/lib/authz"
import { sanitizeCallbackUrl } from "@/lib/security"

export const proxy = auth((req) => {
  const pathname = req.nextUrl.pathname

  // Admin routes that require authentication
  const adminRoutes = ['/admin', '/clients', '/time', '/invoices', '/settings', '/bill']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Only protect admin routes
  if (isAdminRoute && !req.auth) {
    const newUrl = new URL('/api/auth/signin', req.nextUrl.origin)

    // Sanitize the callback path before forwarding to prevent open redirects.
    // `pathname` is already a relative URL path, but we run it through
    // sanitizeCallbackUrl to make the constraint explicit and enforce it even
    // if the source changes.
    newUrl.searchParams.set('callbackUrl', sanitizeCallbackUrl(pathname))

    return Response.redirect(newUrl)
  }

  if (isAdminRoute && !isAdminSession(req.auth)) {
    return Response.redirect(new URL('/', req.nextUrl.origin))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
